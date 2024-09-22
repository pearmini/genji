import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

export function defineConfig(config) {
  if (ExecutionEnvironment.canUseDOM) {
    window.__genjiConfig = config;
  }
  return config;
}
