import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kz.km.naryadai',
  appName: 'НарядAI',
  webDir: 'dist',
  server: {
    url: 'http://10.42.0.1:8000',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
