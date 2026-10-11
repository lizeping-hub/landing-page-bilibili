import { defineConfig } from 'vite';

// Actions supplies the repository name; username.github.io sites use root paths.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base =
  process.env.VITE_BASE_PATH ??
  (repository && !repository.endsWith('.github.io') ? `/${repository}/` : '/');

export default defineConfig({
  base,
  build: { assetsInlineLimit: 0, chunkSizeWarningLimit: 350 },
});
