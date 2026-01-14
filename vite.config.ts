import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  const processEnv = { ...process.env, ...env };

  return {
    plugins: [react()],
    base: './', // مهم جداً لـ GitHub Pages
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true, // تفعيل خرائط المصدر للمساعدة في تتبع الأخطاء
    },
    define: {
      // تعريف process.env ككائن فارغ لتجنب أخطاء المكتبات
      'process.env': {},
      
      // حقن المتغيرات بشكل صريح
      'process.env.API_KEY': JSON.stringify(processEnv.VITE_API_KEY || processEnv.API_KEY || '__GEMINI_API_KEY__'),
      
      '__FIREBASE_CONFIG__': JSON.stringify({
        apiKey: processEnv.VITE_FIREBASE_API_KEY || processEnv.FIREBASE_API_KEY || '',
        authDomain: processEnv.VITE_FIREBASE_AUTH_DOMAIN || processEnv.FIREBASE_AUTH_DOMAIN || '',
        projectId: processEnv.VITE_FIREBASE_PROJECT_ID || processEnv.FIREBASE_PROJECT_ID || '',
        storageBucket: processEnv.VITE_FIREBASE_STORAGE_BUCKET || processEnv.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: processEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || processEnv.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: processEnv.VITE_FIREBASE_APP_ID || processEnv.FIREBASE_APP_ID || '',
        measurementId: processEnv.VITE_FIREBASE_MEASUREMENT_ID || processEnv.FIREBASE_MEASUREMENT_ID || ''
      }),
    },
  };
});