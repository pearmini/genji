export function defineConfig(config) {
  if (typeof window === 'object') window.__genjiConfig = config;
  return config;
}
