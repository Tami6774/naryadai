"""Модуль экспорта отчётов в Excel (openpyxl) и печатных форм (HTML / PDF-ready).

Соответствует разделу 7 кейса («Отчёты и аналитика», «Выгрузка в PDF / Excel»).
Полностью автономен, без внешних API и облачных сервисов.
"""
from __future__ import annotations

import html
import io
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..models import (
    AIAssessment,
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialNorm,
    MaterialWriteOff,
    Role,
    Section,
    Status,
    WorkOrder,
    WorkOrderEvent,
)
from ..serializers import (
    PRIORITY_LABELS,
    STATUS_LABELS,
    downtime_minutes,
    short_name,
    work_minutes,
)
from . import reports

# Цветовая палитра оформления АО «Костанайские Минералы»
COLOR_HEADER_BG = "1E293B"      # slate-800
COLOR_HEADER_FG = "FFFFFF"
COLOR_ACCENT = "059669"         # emerald-600
COLOR_SUBHEADER_BG = "F1F5F9"   # slate-100
COLOR_BORDER = "CBD5E1"         # slate-300
COLOR_ALERT_BG = "FEE2E2"       # red-100
COLOR_ALERT_FG = "991B1B"       # red-800


def _style_header_row(ws, row_idx: int, col_count: int, bg_hex: str = COLOR_HEADER_BG, fg_hex: str = COLOR_HEADER_FG):
    fill = PatternFill(start_color=bg_hex, end_color=bg_hex, fill_type="solid")
    font = Font(name="Arial", size=10, bold=True, color=fg_hex)
    thin = Side(border_style="thin", color=COLOR_BORDER)
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    align = Alignment(horizontal="center", vertical="center", wrap_text=True)

    for col in range(1, col_count + 1):
        cell = ws.cell(row=row_idx, column=col)
        cell.fill = fill
        cell.font = font
        cell.border = border
        cell.alignment = align
    ws.row_dimensions[row_idx].height = 28


def _apply_table_borders(ws, start_row: int, end_row: int, col_count: int):
    thin = Side(border_style="thin", color="E2E8F0")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    for r in range(start_row, end_row + 1):
        for c in range(1, col_count + 1):
            cell = ws.cell(row=r, column=c)
            cell.border = border
            if cell.font.name != "Arial":
                cell.font = Font(name="Arial", size=9)


def _auto_column_widths(ws):
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val = str(cell.value or "")
            if len(val) > max_len and len(val) < 80:
                max_len = len(val)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 11)


# =====================================================================
# 1. Экспорт отчёта за смену в Excel
# =====================================================================
def export_shift_report_excel(db: Session, start: datetime, end: datetime) -> io.BytesIO:
    data = reports.shift_report(db, start, end)
    wb = Workbook()

    # Лист 1: Сводка смены
    ws_sum = wb.active
    ws_sum.title = "Сводка смены"
    ws_sum.views.sheetView[0].showGridLines = True

    # Заголовок документа
    ws_sum.merge_cells("A1:G1")
    title_cell = ws_sum["A1"]
    title_cell.value = "АО «Костанайские Минералы» — Сводный отчёт за смену"
    title_cell.font = Font(name="Arial", size=14, bold=True, color="065F46")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws_sum.row_dimensions[1].height = 35

    ws_sum["A2"] = f"Период: {start.strftime('%d.%m.%Y %H:%M')} — {end.strftime('%d.%m.%Y %H:%M')}"
    ws_sum["A2"].font = Font(name="Arial", size=10, italic=True)

    # Таблица показателей
    metrics = [
        ("Выдано нарядов за смену", data["issued"]),
        ("Выполнено нарядов (завершено)", data["done"]),
        ("Закрыто и утверждено мастером", data["closed"]),
        ("Просрочено нарядов", data["overdue"]),
        ("Отклонений исполнителями", data["rejected"]),
        ("Суммарный простой оборудования (часов)", f"{data['downtime_hours']} ч"),
        ("Средняя оценка качества закрытия (ИИ)", f"{data['avg_score']}/100" if data['avg_score'] else "—"),
    ]

    ws_sum.cell(row=4, column=1, value="Показатель смены")
    ws_sum.cell(row=4, column=2, value="Значение")
    _style_header_row(ws_sum, 4, 2, bg_hex="065F46", fg_hex="FFFFFF")

    cur_row = 5
    for title, val in metrics:
        ws_sum.cell(row=cur_row, column=1, value=title).font = Font(name="Arial", size=10)
        c_val = ws_sum.cell(row=cur_row, column=2, value=val)
        c_val.font = Font(name="Arial", size=10, bold=True)
        c_val.alignment = Alignment(horizontal="center")
        cur_row += 1
    _apply_table_borders(ws_sum, 5, cur_row - 1, 2)

    # ИИ-резюме
    cur_row += 1
    ws_sum.cell(row=cur_row, column=1, value="Итоговое ИИ-резюме смены:").font = Font(name="Arial", size=10, bold=True)
    cur_row += 1
    ws_sum.merge_cells(start_row=cur_row, start_column=1, end_row=cur_row + 2, end_column=6)
    summary_cell = ws_sum.cell(row=cur_row, column=1, value=data["summary"])
    summary_cell.font = Font(name="Arial", size=9, italic=True)
    summary_cell.alignment = Alignment(wrap_text=True, vertical="top")
    summary_cell.fill = PatternFill(start_color="F0FDF4", end_color="F0FDF4", fill_type="solid")

    # Таблица загрузки сотрудников
    cur_row += 4
    ws_sum.cell(row=cur_row, column=1, value="Загрузка ремонтно-технического персонала").font = Font(name="Arial", size=11, bold=True)
    cur_row += 1
    load_headers = ["Сотрудник", "Нарядов", "Отработано (мин)", "Отработано (ч)"]
    for c_idx, h in enumerate(load_headers, 1):
        ws_sum.cell(row=cur_row, column=c_idx, value=h)
    _style_header_row(ws_sum, cur_row, len(load_headers))
    load_start = cur_row + 1
    cur_row += 1
    for w in data.get("load", []):
        ws_sum.cell(row=cur_row, column=1, value=w["name"])
        ws_sum.cell(row=cur_row, column=2, value=w["orders"]).alignment = Alignment(horizontal="center")
        ws_sum.cell(row=cur_row, column=3, value=w["minutes"]).alignment = Alignment(horizontal="center")
        ws_sum.cell(row=cur_row, column=4, value=round(w["minutes"] / 60, 1)).alignment = Alignment(horizontal="center")
        cur_row += 1
    if data.get("load"):
        _apply_table_borders(ws_sum, load_start, cur_row - 1, len(load_headers))

    _auto_column_widths(ws_sum)

    # Лист 2: Реестр нарядов смены
    ws_orders = wb.create_sheet(title="Наряды смены")
    ws_orders.views.sheetView[0].showGridLines = True
    order_headers = [
        "№ наряда", "Оборудование", "Участок", "Приоритет", "Тип",
        "Исполнитель", "Статус", "Срок", "Просрочен", "Время (мин)",
        "Оценка ИИ", "Шифр дефекта",
    ]
    for c_idx, h in enumerate(order_headers, 1):
        ws_orders.cell(row=1, column=c_idx, value=h)
    _style_header_row(ws_orders, 1, len(order_headers))

    orders = reports._period_orders(db, start, end)
    r_idx = 2
    for o in orders:
        ws_orders.cell(row=r_idx, column=1, value=o.number).alignment = Alignment(horizontal="center")
        ws_orders.cell(row=r_idx, column=2, value=o.equipment.name if o.equipment else "—")
        ws_orders.cell(row=r_idx, column=3, value=o.section.name if o.section else "—")
        ws_orders.cell(row=r_idx, column=4, value=PRIORITY_LABELS.get(o.priority, str(o.priority)))
        ws_orders.cell(row=r_idx, column=5, value="Внеплановый" if o.work_type == "unplanned" else "Плановый")
        ws_orders.cell(row=r_idx, column=6, value=short_name(o.assignee.full_name) if o.assignee else "—")
        ws_orders.cell(row=r_idx, column=7, value=STATUS_LABELS.get(Status(o.status), str(o.status)))
        ws_orders.cell(row=r_idx, column=8, value=o.deadline.strftime("%H:%M %d.%m") if o.deadline else "—")
        ws_orders.cell(row=r_idx, column=9, value="Да" if reports.is_overdue(o) else "Нет").alignment = Alignment(horizontal="center")
        minutes = work_minutes(o)
        ws_orders.cell(row=r_idx, column=10, value=int(minutes) if minutes is not None else "—").alignment = Alignment(horizontal="center")
        score = o.assessment.final_score if o.assessment else None
        ws_orders.cell(row=r_idx, column=11, value=score if score is not None else "—").alignment = Alignment(horizontal="center")
        ws_orders.cell(row=r_idx, column=12, value=o.fault_code.code if o.fault_code else "—").alignment = Alignment(horizontal="center")
        r_idx += 1

    if len(orders) > 0:
        _apply_table_borders(ws_orders, 2, r_idx - 1, len(order_headers))
    _auto_column_widths(ws_orders)

    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    return out


# =====================================================================
# 2. Экспорт рейтинга рабочих и бригад в Excel
# =====================================================================
def export_rating_excel(db: Session, start: datetime, end: datetime, brigade_id: int | None = None) -> io.BytesIO:
    rows = reports.compute_rating(db, start, end, brigade_id)
    wb = Workbook()
    ws = wb.active
    ws.title = "Рейтинг сотрудников"
    ws.views.sheetView[0].showGridLines = True

    # Заголовок
    ws.merge_cells("A1:K1")
    t = ws["A1"]
    t.value = "АО «Костанайские Минералы» — Объективный рейтинг ремонтно-технического персонала"
    t.font = Font(name="Arial", size=13, bold=True, color="065F46")
    t.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    ws["A2"] = (
        f"Период: {start.strftime('%d.%m.%Y')} — {end.strftime('%d.%m.%Y')} | "
        f"Формула: 0.35·Качество + 0.25·В срок + 0.20·(100 − Повторы) + 0.15·Объём + 0.05·(100 − Отказы)"
    )
    ws["A2"].font = Font(name="Arial", size=9, italic=True)

    headers = [
        "Место", "Сотрудник", "Специальность", "Разряд", "Бригада",
        "Итоговый балл", "Качество (35%)", "В срок (25%)", "Без повторов (20%)",
        "Объём/сложность (15%)", "Без отказов (5%)", "Закрыто нарядов", "Повторов за 7 дней",
        "ИИ-рекомендация исполнителю",
    ]
    for c_idx, h in enumerate(headers, 1):
        ws.cell(row=4, column=c_idx, value=h)
    _style_header_row(ws, 4, len(headers), bg_hex="065F46", fg_hex="FFFFFF")

    r_idx = 5
    for row in rows:
        place_cell = ws.cell(row=r_idx, column=1, value=row.get("place", r_idx - 4))
        place_cell.alignment = Alignment(horizontal="center")
        place_cell.font = Font(name="Arial", size=10, bold=True)
        ws.cell(row=r_idx, column=2, value=row["full_name"]).font = Font(name="Arial", size=10, bold=True)
        ws.cell(row=r_idx, column=3, value=row["specialty"])
        ws.cell(row=r_idx, column=4, value=row["grade"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=5, value=row.get("brigade", {}).get("name", "—") if row.get("brigade") else "—")
        
        # Рейтинг
        rate_cell = ws.cell(row=r_idx, column=6, value=row["rating"])
        rate_cell.alignment = Alignment(horizontal="center")
        rate_cell.font = Font(name="Arial", size=11, bold=True, color="065F46")
        rate_cell.fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")

        comp = row.get("components", {})
        ws.cell(row=r_idx, column=7, value=comp.get("quality", 0)).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=8, value=comp.get("on_time", 0)).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=9, value=comp.get("no_rework", 0)).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=10, value=comp.get("volume", 0)).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=11, value=comp.get("no_reject", 0)).alignment = Alignment(horizontal="center")

        ws.cell(row=r_idx, column=12, value=row["orders_closed"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=13, value=row["repeat_failures"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=14, value=row.get("explanation", ""))
        r_idx += 1

    if rows:
        _apply_table_borders(ws, 5, r_idx - 1, len(headers))
    _auto_column_widths(ws)

    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    return out


# =====================================================================
# 3. Экспорт списанных ТМЦ и отклонений от норм в Excel
# =====================================================================
def export_materials_excel(db: Session, start: datetime, end: datetime) -> io.BytesIO:
    materials_stat = get_materials_report(db, start, end)
    wb = Workbook()
    ws = wb.active
    ws.title = "Списание ТМЦ"
    ws.views.sheetView[0].showGridLines = True

    ws.merge_cells("A1:G1")
    t = ws["A1"]
    t.value = "АО «Костанайские Минералы» — Отчёт по списанию запчастей и ТМЦ против нормативов"
    t.font = Font(name="Arial", size=13, bold=True, color="1E3A8A")
    t.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 32

    headers = [
        "Наименование ТМЦ / запчасти", "Ед. изм.", "Фактически списано",
        "Типичный норматив", "Отклонение от нормы", "Кол-во нарядов", "Статус контроля ИИ",
    ]
    for c_idx, h in enumerate(headers, 1):
        ws.cell(row=3, column=c_idx, value=h)
    _style_header_row(ws, 3, len(headers), bg_hex="1E3A8A", fg_hex="FFFFFF")

    r_idx = 4
    for item in materials_stat["items"]:
        ws.cell(row=r_idx, column=1, value=item["name"]).font = Font(name="Arial", size=10, bold=True)
        ws.cell(row=r_idx, column=2, value=item["unit"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=3, value=item["total_qty"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=4, value=item["norm_qty"]).alignment = Alignment(horizontal="center")

        diff = item.get("diff_pct", 0)
        c_diff = ws.cell(row=r_idx, column=5, value=f"{diff:+.1f}%")
        c_diff.alignment = Alignment(horizontal="center")
        if diff > 50:
            c_diff.font = Font(name="Arial", size=10, bold=True, color="DC2626")
            c_diff.fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")

        ws.cell(row=r_idx, column=6, value=item["orders_count"]).alignment = Alignment(horizontal="center")
        ws.cell(row=r_idx, column=7, value=item["status_label"])
        r_idx += 1

    if materials_stat["items"]:
        _apply_table_borders(ws, 4, r_idx - 1, len(headers))
    _auto_column_widths(ws)

    out = io.BytesIO()
    wb.save(out)
    out.seek(0)
    return out


# =====================================================================
# 4. JSON-агрегация по списанным материалам (для UI и экспорта)
# =====================================================================
def get_materials_report(db: Session, start: datetime, end: datetime) -> dict:
    orders = reports._period_orders(db, start, end)
    order_ids = [o.id for o in orders]
    if not order_ids:
        return {"items": [], "total_writeoffs": 0, "anomalies_count": 0}

    writeoffs = db.scalars(
        select(MaterialWriteOff)
        .where(MaterialWriteOff.order_id.in_(order_ids))
        .options(selectinload(MaterialWriteOff.material), selectinload(MaterialWriteOff.order))
    ).all()

    # Справочник норм
    norms = db.scalars(select(MaterialNorm)).all()
    norm_map = {(n.fault_code_id, n.material_id): n.typical_qty for n in norms}

    by_mat: dict[int, dict] = {}
    for w in writeoffs:
        mid = w.material_id
        if mid not in by_mat:
            mat_name = w.material.name if w.material else f"Материал #{mid}"
            mat_unit = w.material.unit if w.material else "ед."
            by_mat[mid] = {
                "material_id": mid,
                "name": mat_name,
                "unit": mat_unit,
                "total_qty": 0.0,
                "expected_qty": 0.0,
                "orders": set(),
                "overuse_events": 0,
            }
        by_mat[mid]["total_qty"] += w.qty
        by_mat[mid]["orders"].add(w.order_id)
        if w.order.fault_code_id:
            typ = norm_map.get((w.order.fault_code_id, mid), w.qty)
            by_mat[mid]["expected_qty"] += typ
            if w.qty > typ * 1.5:
                by_mat[mid]["overuse_events"] += 1
        else:
            by_mat[mid]["expected_qty"] += w.qty

    items = []
    anomalies_count = 0
    for stat in by_mat.values():
        total_q = round(stat["total_qty"], 1)
        expected_q = round(stat["expected_qty"], 1)
        diff_pct = round(((total_q - expected_q) / expected_q * 100), 1) if expected_q > 0 else 0.0
        is_anom = diff_pct > 40 and stat["overuse_events"] >= 2
        if is_anom:
            anomalies_count += 1
        items.append({
            "material_id": stat["material_id"],
            "name": stat["name"],
            "unit": stat["unit"],
            "total_qty": total_q,
            "norm_qty": expected_q,
            "diff_pct": diff_pct,
            "orders_count": len(stat["orders"]),
            "overuse_count": stat["overuse_events"],
            "is_anomaly": is_anom,
            "status_label": "⚠️ Перерасход выше нормы" if is_anom else "Нормативный расход",
        })

    items.sort(key=lambda x: (x["is_anomaly"], x["diff_pct"]), reverse=True)
    return {
        "period": {"start": start, "end": end},
        "items": items,
        "total_writeoffs": len(writeoffs),
        "anomalies_count": anomalies_count,
    }


# =====================================================================
# 5. Печатная форма наряда (Print-Ready / PDF)
# =====================================================================
def _e(value) -> str:
    """Экранирование значений из БД перед вставкой в HTML (защита от XSS)."""
    return html.escape(str(value), quote=True)


def generate_order_print_html(order: WorkOrder) -> str:
    """Генерирует официальную форму наряда-допуска АО «Костанайские Минералы».

    Все значения из БД (тексты исполнителя/мастера, справочники) экранируются через _e():
    страница открывается с того же origin, что и SPA, где хранится JWT.
    """
    events_html = "".join(
        f"<tr><td>{ev.created_at.strftime('%d.%m.%Y %H:%M:%S') if ev.created_at else '—'}</td>"
        f"<td><strong>{_e(ev.action)}</strong></td>"
        f"<td>{_e(short_name(ev.actor.full_name)) if ev.actor else 'ИИ / Система'}</td>"
        f"<td>{_e(ev.comment or ev.reason or '—')}</td></tr>"
        for ev in (order.events or [])
    )

    mats_html = "".join(
        f"<tr><td>{_e(m.material.name) if m.material else f'Материал #{m.material_id}'}</td>"
        f"<td>{_e(m.qty)} {_e(m.material.unit) if m.material else 'ед.'}</td></tr>"
        for m in (order.materials or [])
    ) or "<tr><td colspan='2' style='text-align:center; color:#64748b;'>Материалы не списывались</td></tr>"

    eq_desc = (f"{_e(order.equipment.name)} (Инв. № {_e(order.equipment.inv_no)})" if order.equipment
               else "Не указано (Инв. № —)")
    sec_name = _e(order.section.name) if order.section else "Не указан"
    created_str = order.created_at.strftime('%d.%m.%Y %H:%M') if order.created_at else "—"
    deadline_str = order.deadline.strftime('%d.%m.%Y %H:%M') if order.deadline else "—"
    master_name = _e(order.master.full_name) if order.master else "Мастер смены"
    assignee_name = _e(order.assignee.full_name) if order.assignee else "Не назначен"
    assignee_spec = _e(order.assignee.specialty) if order.assignee else "—"
    priority_label = _e(PRIORITY_LABELS.get(order.priority, str(order.priority)))
    description = _e(order.description or '—')
    comment = _e(order.comment) if order.comment else ''
    fault_code = _e(order.fault_code.code) if order.fault_code else '—'
    fault_name = _e(order.fault_code.name) if order.fault_code else '—'
    work_done = _e(order.work_done) if order.work_done else 'Работы не описаны'
    close_comment = _e(order.close_comment) if order.close_comment else ''

    assessment_html = ""
    if order.assessment:
        a = order.assessment
        v_raw = a.verdict.value if hasattr(a.verdict, "value") else str(a.verdict)
        verdict_trans = _e({
            "accepted": "✅ Принято без замечаний",
            "accepted_with_remarks": "⚠️ Принято с замечаниями",
            "needs_rework": "❌ Требует доработки",
        }.get(v_raw, v_raw))
        assessment_html = f"""
        <div class="box ai-box">
            <h3>🤖 ИИ-ЗАКЛЮЧЕНИЕ ЦИФРОВОГО КОНТРОЛЁРА («НарядAI»)</h3>
            <p><strong>Вердикт ИИ:</strong> {verdict_trans} | <strong>Балл:</strong> {_e(a.score)}/100
               {f'| <strong>Мастер скорректировал оценку:</strong> {_e(a.master_score)}/100' if a.master_score is not None else ''}</p>
            <p><strong>Пояснение:</strong> {_e(a.explanation or '—')}</p>
            {f'<p><strong>Комментарий мастера:</strong> {_e(a.master_comment)}</p>' if a.master_comment else ''}
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Наряд-задание №{order.number} — АО «Костанайские Минералы»</title>
<style>
    @page {{ size: A4; margin: 15mm; }}
    body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 11pt;
        color: #1e293b;
        line-height: 1.4;
        margin: 0;
        padding: 10px;
    }}
    .header {{
        text-align: center;
        border-bottom: 2px solid #065f46;
        padding-bottom: 10px;
        margin-bottom: 15px;
    }}
    .header h1 {{ margin: 0; font-size: 16pt; color: #065f46; }}
    .header h2 {{ margin: 4px 0 0; font-size: 13pt; font-weight: normal; color: #334155; }}
    .meta-grid {{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 15px;
    }}
    .box {{
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 8px 12px;
    }}
    .box h3 {{ margin: 0 0 6px; font-size: 11pt; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }}
    .ai-box {{ background: #f0fdf4; border-color: #86efac; }}
    .ai-box h3 {{ color: #166534; }}
    table {{ width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5pt; }}
    th, td {{ border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; }}
    th {{ background: #f1f5f9; font-weight: bold; }}
    .signatures {{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 15px;
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px dashed #94a3b8;
    }}
    .sig-line {{ border-bottom: 1px solid #000; height: 30px; margin-top: 5px; }}
    .badge {{ display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9pt; font-weight: bold; }}
    .badge-emergency {{ background: #fee2e2; color: #991b1b; }}
    .badge-normal {{ background: #e0f2fe; color: #075985; }}
    @media print {{
        body {{ padding: 0; }}
        .no-print {{ display: none; }}
    }}
</style>
</head>
<body>

<div class="no-print" style="margin-bottom: 15px; text-align: right;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #059669; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
        🖨️ Распечатать / Сохранить в PDF
    </button>
</div>

<div class="header">
    <h1>АО «КОСТАНАЙСКИЕ МИНЕРАЛЫ»</h1>
    <h2>НАРЯД-ЗАДАНИЕ № {order.number} НА ВЫПОЛНЕНИЕ РЕМОНТНЫХ РАБОТ</h2>
    <div style="font-size: 9pt; color: #64748b; margin-top: 4px;">Система автоматизированного контроля «НарядAI»</div>
</div>

<div class="meta-grid">
    <div class="box">
        <h3>ОБОРУДОВАНИЕ И УЧАСТОК</h3>
        <div><strong>Оборудование:</strong> {eq_desc}</div>
        <div><strong>Участок:</strong> {sec_name}</div>
        <div><strong>Тип работ:</strong> {'Внеплановый (аварийный)' if order.work_type == 'unplanned' else 'Плановый регламентный'}</div>
        <div><strong>Приоритет:</strong> <span class="badge {'badge-emergency' if order.priority == 'emergency' else 'badge-normal'}">{priority_label}</span></div>
    </div>
    <div class="box">
        <h3>СРОКИ И ОТВЕТСТВЕННЫЕ</h3>
        <div><strong>Выдан:</strong> {created_str}</div>
        <div><strong>Срок исполнения:</strong> {deadline_str}</div>
        <div><strong>Мастер смены:</strong> {master_name}</div>
        <div><strong>Исполнитель:</strong> {assignee_name} ({assignee_spec})</div>
    </div>
</div>

<div class="box" style="margin-bottom: 12px;">
    <h3>ОПИСАНИЕ НЕИСПРАВНОСТИ / ЗАДАНИЕ МАСТЕРА</h3>
    <p style="margin: 4px 0;">{description}</p>
    {f'<div style="font-size: 9pt; color: #64748b;">Комментарий: {comment}</div>' if comment else ''}
</div>

<div class="box" style="margin-bottom: 12px;">
    <h3>ФАКТИЧЕСКИ ВЫПОЛНЕННЫЕ РАБОТЫ И МАТЕРИАЛЫ</h3>
    <div><strong>Шифр неисправности:</strong> [{fault_code}] {fault_name}</div>
    <div><strong>Выполненные операции:</strong> {work_done}</div>
    {f'<div><strong>Комментарий исполнителя:</strong> {close_comment}</div>' if close_comment else ''}
    
    <h4 style="margin: 8px 0 2px; font-size: 9.5pt;">Списанные материалы и запчасти:</h4>
    <table>
        <thead><tr><th>Материал / Запчасть</th><th style="width: 120px;">Количество</th></tr></thead>
        <tbody>{mats_html}</tbody>
    </table>
</div>

{assessment_html}

<div class="box" style="margin-bottom: 15px;">
    <h3>ХРОНОЛОГИЯ ПЕРЕХОДОВ СТАТУСОВ</h3>
    <table>
        <thead><tr><th>Время</th><th>Действие</th><th>Автор</th><th>Примечание / Причина</th></tr></thead>
        <tbody>{events_html}</tbody>
    </table>
</div>

<div class="signatures">
    <div>
        <strong>Мастер смены:</strong>
        <div class="sig-line"></div>
        <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">{master_name}</div>
    </div>
    <div>
        <strong>Исполнитель:</strong>
        <div class="sig-line"></div>
        <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">{assignee_name}</div>
    </div>
    <div>
        <strong>Начальник участка / службы:</strong>
        <div class="sig-line"></div>
        <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">Подпись / Дата</div>
    </div>
</div>

</body>
</html>
"""
