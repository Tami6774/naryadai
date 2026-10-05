"""Генератор тестовых данных: история за 3 месяца с заложенными закономерностями.

Запуск:  python -m seed.generate [--days 92] [--seed 42]

Заложенные закономерности (их должен найти ИИ-аналитик):
 1. Конвейер К-3 ломается в ~3 раза чаще остальных, большинство — М-02 (подшипник).
 2. Сериков Д. — частые доработки и повторные поломки того же шифра в течение 7 дней.
 3. Дробилка КМД-1750 — внеплановые поломки через 2–5 дней после планового ремонта (качество ППР).
 4. Обогатительная фабрика — в ночную смену внеплановых нарядов примерно в 2 раза больше.
 5. Ковалёв И. — списывает материалы примерно в 2 раза выше нормы.
"""
from __future__ import annotations

import argparse
import heapq
import random
from dataclasses import dataclass, field
from datetime import datetime, timedelta

from app.auth import hash_pin
from app.db import Base, SessionLocal, engine
from app.models import (
    AIAssessment,
    Brigade,
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialNorm,
    MaterialWriteOff,
    Role,
    Section,
    Status,
    Verdict,
    WorkOrder,
    WorkOrderEvent,
)

from . import reference as R

DEMO_PIN = "1234"
K3 = "Конвейер К-3"
KMD = "Дробилка КМД-1750"
BAD_WORKER = "serikov"
OVERUSE_WORKER = "kovalev"
ENRICHMENT = "Обогатительная фабрика"


@dataclass(order=True)
class Job:
    at: datetime
    seq: int
    equipment: str = field(compare=False)
    planned: bool = field(compare=False)
    fault: str | None = field(compare=False, default=None)
    origin: str = field(compare=False, default="base")  # base | k3 | ppr | repeat


def weighted(rng: random.Random, d: dict[str, float]) -> str:
    keys = list(d)
    return rng.choices(keys, weights=[d[k] for k in keys])[0]


def shift_of(t: datetime) -> str:
    return "day" if 8 <= t.hour < 20 else "night"


def night_brigade(t: datetime, start: datetime) -> int:
    """Бригады чередуются в ночь понедельно (чтобы смена не совпадала с бригадой)."""
    day = t if t.hour >= 8 else t - timedelta(days=1)
    return ((day - start).days // 7) % 3


def build_reference(db):
    sections = [Section(name=n) for n in R.SECTIONS]
    db.add_all(sections)
    db.flush()
    equipment = {}
    for name, inv, sec, typ, crit in R.EQUIPMENT:
        e = Equipment(name=name, inv_no=inv, section_id=sections[sec].id, type=typ, criticality=crit,
                      qr_code=f"NARYAD:{inv}")
        db.add(e)
        equipment[name] = e
    brigades = [Brigade(name=f"Бригада №{i}") for i in (1, 2, 3)]
    db.add_all(brigades)
    faults = {}
    for code, cat, name, hours, _ in R.FAULT_CODES:
        f = FaultCode(code=code, category=cat, name=name, norm_hours=hours)
        db.add(f)
        faults[code] = f
    materials = {}
    for name, unit in R.MATERIALS:
        m = Material(name=name, unit=unit)
        db.add(m)
        materials[name] = m
    db.flush()
    for code, items in R.MATERIAL_NORMS.items():
        for mname, qty in items:
            db.add(MaterialNorm(fault_code_id=faults[code].id, material_id=materials[mname].id,
                                typical_qty=qty))

    pin = hash_pin(DEMO_PIN)  # один хеш на всех — быстрее, ПИН у всех демо-учёток одинаковый
    workers = []
    for full, spec, grade, br, login in R.WORKERS:
        w = Employee(full_name=full, specialty=spec, grade=grade, brigade_id=brigades[br].id,
                     role=Role.worker, login=login, pin_hash=pin)
        db.add(w)
        workers.append(w)
    masters = []
    for i, (full, login) in enumerate(R.MASTERS):
        m = Employee(full_name=full, specialty="Мастер смены", grade=0, role=Role.master,
                     shift="day" if i == 0 else "night", login=login, pin_hash=pin)
        db.add(m)
        masters.append(m)
    db.add(Employee(full_name=R.MANAGER[0], specialty="Главный механик", grade=0, role=Role.manager,
                    login=R.MANAGER[1], pin_hash=pin))
    db.add(Employee(full_name=R.ADMIN[0], specialty="Администратор", grade=0, role=Role.admin,
                    login=R.ADMIN[1], pin_hash=pin))
    db.flush()
    return equipment, brigades, faults, materials, workers, masters


def generate(days: int = 92, seed: int = 42) -> None:
    rng = random.Random(seed)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    equipment, brigades, faults, materials, workers, masters = build_reference(db)
    fault_spec = {c[0]: c[4] for c in R.FAULT_CODES}
    eq_section = {e.name: R.SECTIONS[R.EQUIPMENT[i][2]] for i, e in enumerate(equipment.values())}
    eq_type = {e.name: e.type for e in equipment.values()}
    worker_by_login = {w.login: w for w in workers}
    brigade_idx = {b.id: i for i, b in enumerate(brigades)}

    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    start = today - timedelta(days=days)
    end = today  # история — до вчерашнего дня включительно; сегодняшнюю смену создаём отдельно

    # ------------------------------------------------ 1. поток событий-«поломок» и ППР
    heap: list[Job] = []
    seq = 0

    def push(job_at, eq, planned, fault=None, origin="base"):
        nonlocal seq
        if start <= job_at < end:
            seq += 1
            heapq.heappush(heap, Job(job_at, seq, eq, planned, fault, origin))

    base_rate = 0.075  # внеплановых в смену на единицу оборудования
    for eq in equipment:
        for d in range(days):
            for sh in ("day", "night"):
                rate = base_rate
                if eq == K3:
                    rate *= 3.2                                 # закономерность 1
                if eq_section[eq] == ENRICHMENT and sh == "night":
                    rate *= 2.2                                 # закономерность 4
                if eq_type[eq] in ("станок", "сварочное оборудование", "циклон"):
                    rate *= 0.5
                n = sum(1 for _ in range(3) if rng.random() < rate / 3)
                for _ in range(n):
                    h = rng.uniform(8, 20) if sh == "day" else rng.uniform(20, 32)
                    push(start + timedelta(days=d, hours=h), eq, False,
                         origin="k3" if eq == K3 else "base")
        # ППР каждые ~14 дней, дневная смена
        t = start + timedelta(days=rng.randint(0, 13))
        while t < end:
            push(t.replace(hour=rng.randint(8, 11), minute=rng.choice([0, 15, 30])), eq, True)
            t += timedelta(days=rng.randint(12, 16))

    # ------------------------------------------------ 2. моделирование выполнения
    busy_until: dict[int, datetime] = {w.id: start for w in workers}
    orders: list[dict] = []

    def pick_worker(t: datetime, spec: str) -> Employee:
        if shift_of(t) == "night":
            pool = [w for w in workers if brigade_idx[w.brigade_id] == night_brigade(t, start)]
        else:
            nb = night_brigade(t, start)
            pool = [w for w in workers if brigade_idx[w.brigade_id] != nb]
        cands = [w for w in pool if w.specialty == spec] or pool
        free = [w for w in cands if busy_until[w.id] <= t]
        return rng.choice(free or cands)

    while heap:
        job = heapq.heappop(heap)
        t = job.at
        eq = equipment[job.equipment]
        if job.planned:
            fault = rng.choice(["С-01", "С-02", "М-06"])
            spec = "Слесарь"
        else:
            if job.fault:
                fault = job.fault
            elif job.equipment == K3 and rng.random() < 0.7:
                fault = "М-02"                                  # закономерность 1
            else:
                fault = weighted(rng, R.TYPE_FAULTS[eq.type])
            spec = fault_spec[fault]
        worker = pick_worker(t, spec)
        master = masters[0] if shift_of(t) == "day" else masters[1]
        norm = faults[fault].norm_hours

        if job.planned:
            priority = "planned"
        else:
            crit_boost = 0.15 if eq.criticality == 1 else 0
            priority = rng.choices(["emergency", "high", "normal"],
                                   weights=[0.22 + crit_boost, 0.45, 0.33 - crit_boost])[0]
        slack = {"emergency": 1, "high": 2, "normal": 6, "planned": 24}[priority]
        deadline = t + timedelta(hours=norm * 1.3 + slack)

        is_bad = worker.login == BAD_WORKER
        events = [("issued", master, t, None, Status.issued, None, None)]
        cur = t
        assignee = worker

        # отказ и переназначение (~6%)
        if rng.random() < 0.06:
            cur += timedelta(minutes=rng.randint(2, 10))
            reason = rng.choice(R.VALID_REJECTS) if rng.random() < 0.7 else rng.choice(R.INVALID_REJECTS)
            events.append(("reject", assignee, cur, Status.issued, Status.rejected, None, reason))
            cur += timedelta(minutes=rng.randint(2, 8))
            others = [w for w in workers if w.specialty == spec and w.id != assignee.id] or workers
            new = rng.choice(others)
            events.append(("reassign", master, cur, Status.rejected, Status.issued,
                           f"→ {new.full_name.split()[0]}", None))
            assignee = new
            is_bad = assignee.login == BAD_WORKER

        # очередь (~10%) или сразу принятие
        accepted_at = None
        queued_at = None
        if busy_until[assignee.id] > cur and priority != "emergency" and rng.random() < 0.8:
            cur += timedelta(minutes=rng.randint(1, 6))
            queued_at = cur
            events.append(("queue", assignee, cur, Status.issued, Status.queued, None, None))
            cur = max(cur, busy_until[assignee.id]) + timedelta(minutes=rng.randint(2, 10))
            events.append(("auto_accept", None, cur, Status.queued, Status.accepted, None, None))
            accepted_at = cur
        else:
            cur += timedelta(minutes=rng.randint(1, 4) if priority == "emergency" else rng.randint(2, 15))
            accepted_at = cur
            events.append(("accept", assignee, cur, events[-1][4], Status.accepted, None, None))
        cur += timedelta(minutes=rng.randint(3, 25))
        started_at = cur
        events.append(("start", assignee, cur, Status.accepted, Status.in_progress, None, None))

        dur = norm * 60 * rng.lognormvariate(0, 0.28) * (1.15 if is_bad else 1.0)
        if rng.random() < 0.08:
            dur *= rng.uniform(1.6, 2.5)                        # затяжные работы → просрочки
        paused = 0.0
        if rng.random() < 0.15:
            p_at = cur + timedelta(minutes=dur * rng.uniform(0.2, 0.6))
            paused = rng.uniform(25, 120)
            reason = rng.choice(R.PAUSE_REASONS)
            events.append(("pause", assignee, p_at, Status.in_progress, Status.paused, None, reason))
            events.append(("resume", assignee, p_at + timedelta(minutes=paused), Status.paused,
                           Status.in_progress, None, None))
        done_at = cur + timedelta(minutes=dur + paused)

        # материалы
        overuse = assignee.login == OVERUSE_WORKER                # закономерность 5
        mats = []
        norms = R.MATERIAL_NORMS[fault]
        chosen = norms if len(norms) <= 3 else rng.sample(norms, k=rng.randint(2, len(norms)))
        if fault == "М-02":  # подшипник ставится один тип
            brg = [n for n in norms if n[0].startswith("Подшипник")]
            chosen = [rng.choice(brg)] + [n for n in norms if not n[0].startswith("Подшипник")]
        for mname, typical in chosen:
            k = rng.uniform(1.8, 2.6) if overuse else (rng.uniform(1.6, 2.2) if rng.random() < 0.03
                                                         else rng.uniform(0.7, 1.15))
            qty = typical * k
            unit = next(u for n, u in R.MATERIALS if n == mname)
            qty = max(1, round(qty)) if unit == "шт" else round(qty, 1)
            mats.append((mname, qty))

        # оценка качества
        overdue = done_at > deadline
        score = rng.gauss(86, 6)
        if is_bad:
            score = rng.gauss(68, 9)
        if overdue:
            score -= 8
        if overuse:
            score -= 12
        rework = rng.random() < (0.32 if is_bad else 0.04)
        events.append(("complete", assignee, done_at, Status.in_progress, Status.done, None, None))
        events.append(("ai_review", None, done_at + timedelta(seconds=5), Status.done, Status.ai_review,
                       None, None))
        if rework:
            events.append(("ai_verdict", None, done_at + timedelta(seconds=8), None, None,
                           "Требует доработки: описание работ не соответствует проблеме", None))
            events.append(("return_rework", None, done_at + timedelta(seconds=9), Status.ai_review,
                           Status.rework, None, "Вердикт ИИ"))
            r_start = done_at + timedelta(minutes=rng.randint(10, 40))
            events.append(("start", assignee, r_start, Status.rework, Status.in_progress, None, None))
            done_at = r_start + timedelta(minutes=norm * 60 * rng.uniform(0.3, 0.6))
            events.append(("complete", assignee, done_at, Status.in_progress, Status.done, None, None))
            events.append(("ai_review", None, done_at + timedelta(seconds=5), Status.done,
                           Status.ai_review, None, None))
            score -= 10
            overdue = done_at > deadline
        score = int(max(25, min(100, score)))
        verdict = (Verdict.accepted if score >= 85 else
                   Verdict.accepted_with_remarks if score >= 60 else Verdict.needs_rework)
        if verdict == Verdict.needs_rework:
            verdict, score = Verdict.accepted_with_remarks, 60
        remarks = []
        if overdue:
            remarks.append("выполнено с просрочкой")
        if overuse:
            remarks.append("списание материалов выше обычного расхода")
        if is_bad and score < 75:
            remarks.append("описание работ недостаточно подробное")
        expl = ("Наряд принят." if verdict == Verdict.accepted else
                "Наряд принят с замечаниями: " + (", ".join(remarks) or "незначительные отклонения") + ".")
        events.append(("ai_verdict", None, done_at + timedelta(seconds=8), None, None,
                       f"{score}/100. {expl}", None))
        closed_at = done_at + timedelta(minutes=rng.randint(10, 90))
        events.append(("approve", master, closed_at, Status.ai_review, Status.closed, None, None))

        busy_until[assignee.id] = done_at
        orders.append(dict(
            created_at=t, work_type="planned" if job.planned else "unplanned",
            description=(rng.choice(R.PLANNED_TEXT) if job.planned else rng.choice(R.PROBLEM_TEXT[fault])),
            equipment=eq, assignee=assignee, master=master, priority=priority, deadline=deadline,
            accepted_at=accepted_at, queued_at=queued_at, started_at=started_at, done_at=done_at,
            closed_at=closed_at, paused=paused, fault=fault,
            work_done=(R.WORK_TEXT[fault] if not (is_bad and rng.random() < 0.4) else "Сделано"),
            mats=mats, score=score, verdict=verdict, expl=expl, events=events,
            brigade_id=assignee.brigade_id,
        ))

        # закономерность 2: после ремонта Серикова поломка повторяется в течение 7 дней
        if not job.planned and assignee.login == BAD_WORKER and rng.random() < 0.45:
            push(done_at + timedelta(days=rng.uniform(1.5, 6)), job.equipment, False, fault, "repeat")
        # закономерность 3: после ППР дробилки КМД-1750 — поломка через 2–5 дней
        if job.planned and job.equipment == KMD and rng.random() < 0.8:
            push(done_at + timedelta(days=rng.uniform(2, 5)), job.equipment, False,
                 rng.choice(["М-06", "Г-01", "М-02"]), "ppr")

    # ------------------------------------------------ 3. запись в БД
    orders.sort(key=lambda o: o["created_at"])
    for num, o in enumerate(orders, 1):
        wo = WorkOrder(
            number=num, work_type=o["work_type"], description=o["description"],
            section_id=o["equipment"].section_id, equipment_id=o["equipment"].id,
            assignee_id=o["assignee"].id, brigade_id=o["brigade_id"], master_id=o["master"].id,
            priority=o["priority"], deadline=o["deadline"], status=Status.closed,
            work_done=o["work_done"], fault_code_id=faults[o["fault"]].id,
            created_at=o["created_at"], accepted_at=o["accepted_at"], queued_at=o["queued_at"],
            started_at=o["started_at"], done_at=o["done_at"], closed_at=o["closed_at"],
            paused_minutes=o["paused"],
        )
        db.add(wo)
        db.flush()
        for action, actor, at, fs, ts, comment, reason in o["events"]:
            db.add(WorkOrderEvent(order_id=wo.id, actor_id=actor.id if actor else None, action=action,
                                  from_status=fs, to_status=ts, comment=comment, reason=reason,
                                  created_at=at))
        for mname, qty in o["mats"]:
            db.add(MaterialWriteOff(order_id=wo.id, material_id=materials[mname].id, qty=qty))
        db.add(AIAssessment(order_id=wo.id, verdict=o["verdict"], score=o["score"],
                            explanation=o["expl"], worker_report=f"Оценка: {o['score']}/100. {o['expl']}",
                            details={"engine": "seed"}, created_at=o["done_at"] + timedelta(seconds=8)))

    # ------------------------------------------------ 4. текущая смена (для демо)
    nb = night_brigade(datetime.now(), start)
    is_day = 8 <= datetime.now().hour < 20
    for w in workers:
        in_night = brigade_idx[w.brigade_id] == nb
        w.on_shift = in_night != is_day
        w.shift = "night" if in_night else "day"

    # Гарантируем, что главные герои демо на смене
    ahmetov = worker_by_login["ahmetov"]
    serikov = worker_by_login["serikov"]
    zhaksybekov = worker_by_login["zhaksybekov"]
    kovalev = worker_by_login["kovalev"]
    ahmetov.on_shift = True
    serikov.on_shift = True
    zhaksybekov.on_shift = True
    kovalev.on_shift = True

    # Для Серикова создаём наряд «В работе» — чтобы в панели мастера было видно 🟡 В работе
    now_dt = datetime.now()
    demo_order_num = len(orders) + 1
    eq_k4 = equipment["Конвейер К-4"]
    wo_serikov = WorkOrder(
        number=demo_order_num,
        work_type="unplanned",
        description="Замена повреждённых роликов холостой ветви",
        section_id=eq_k4.section_id,
        equipment_id=eq_k4.id,
        assignee_id=serikov.id,
        brigade_id=serikov.brigade_id,
        master_id=masters[0].id,
        priority="normal",
        deadline=now_dt + timedelta(hours=3),
        status=Status.in_progress,
        created_at=now_dt - timedelta(minutes=45),
        accepted_at=now_dt - timedelta(minutes=40),
        started_at=now_dt - timedelta(minutes=30),
    )
    db.add(wo_serikov)
    db.flush()
    db.add(WorkOrderEvent(order_id=wo_serikov.id, actor_id=masters[0].id, action="issued",
                          from_status=None, to_status=Status.issued, created_at=now_dt - timedelta(minutes=45)))
    db.add(WorkOrderEvent(order_id=wo_serikov.id, actor_id=serikov.id, action="accept",
                          from_status=Status.issued, to_status=Status.accepted, created_at=now_dt - timedelta(minutes=40)))
    db.add(WorkOrderEvent(order_id=wo_serikov.id, actor_id=serikov.id, action="start",
                          from_status=Status.accepted, to_status=Status.in_progress, created_at=now_dt - timedelta(minutes=30)))

    db.commit()
    db.close()

    k3 = sum(1 for o in orders if o["equipment"].name == K3 and o["work_type"] == "unplanned")
    avg = sum(1 for o in orders if o["work_type"] == "unplanned") / len(equipment)
    print(f"Сгенерировано нарядов: {len(orders)} за {days} дней "
          f"(внеплановых: {sum(1 for o in orders if o['work_type'] == 'unplanned')}).")
    print(f"  К-3: {k3} внеплановых при среднем {avg:.1f} на единицу оборудования")
    print(f"  Повторных поломок после Серикова: {sum(1 for o in orders if False)}"
          if False else "", end="")
    print(f"Учётные записи: master1, master2, boss, admin, исполнители — по фамилии (ahmetov, serikov…). "
          f"ПИН у всех: {DEMO_PIN}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=92)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()
    generate(args.days, args.seed)
