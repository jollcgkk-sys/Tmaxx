import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Merge process.env with loaded env
  const processEnv = { ...process.env, ...env };

  return {
    plugins: [react()],
    base: './', // Ensures paths work correctly on GitHub Pages (subpath)
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false, // Disable sourcemaps in production for cleaner build
    },
    define: {
      // Polyfill 'process.env' object to prevent crashes if libraries access it directly
      'process.env': {},
      
      // 1. Gemini API Key - Replace specifically
      'process.env.API_KEY': JSON.stringify(processEnv.VITE_API_KEY || processEnv.API_KEY || '__GEMINI_API_KEY__'),

      // 2. Firebase Configuration
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