import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './src', // Emplacement des fichiers sources de ton application
  build: {
    outDir: path.resolve(__dirname, 'dist'), // Dossier de sortie pour la build
    rollupOptions: {
      input: './src/main.ts', // Point d'entrée de l'application Angular
    },
  },
  server: {
    open: true,  // Ouvre automatiquement le navigateur lors du démarrage
    port: 4200,  // Port du serveur de développement
  },
});
