import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        questionPage: 'questionPage.html',
        moviePage: 'moviePage.html',
      },
    },
  },
});
