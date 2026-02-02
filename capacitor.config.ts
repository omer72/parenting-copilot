import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.kidsit.app',
  appName: 'Kidsit.ai',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#8b5cf6'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#8b5cf6',
      showSpinner: false
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
