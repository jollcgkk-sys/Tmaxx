import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We use process.cwd() to get the root directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Merge process.env with loaded env to capture system variables too
  // This ensures variables set in the terminal/shell are also picked up
  const processEnv = { ...process.env, ...env };

  return {
    plugins: [react()],
    base: './', // Ensures paths work correctly on GitHub Pages
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      // 1. Gemini API Key
      'process.env.API_KEY': JSON.stringify(processEnv.VITE_API_KEY || processEnv.API_KEY || '__GEMINI_API_KEY__'),

      // 2. Firebase Configuration - Injected as a single global object
      // We look for VITE_ prefixed variables first, then standard ones
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