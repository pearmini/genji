// @see https://github.com/vuejs/vitepress/blob/main/src/client/app/router.ts#L292
function shouldHotReload(payload, base) {
  const payloadPath = payload.path.replace(/(?:(^|\/)index)?\.md$/, "$1");
  const locationPath = location.pathname.replace(/(?:(^|\/)index)?\.html$/, "").slice(base.length - 1);
  return payloadPath === locationPath;
}

export function onHMR(callback, base) {
  if (!import.meta.hot) return;
  import.meta.hot.on("vitepress:pageData", (payload) => {
    if (shouldHotReload(payload, base)) callback(payload);
  });
}
