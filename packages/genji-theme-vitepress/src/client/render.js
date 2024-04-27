import { useRoute, useData } from "vitepress";
import { onMounted, watch, onBeforeUnmount } from "vue";
import { dev } from "./dev";
import { onHMR } from "./hmr";

export function useRender({ library, transform }) {
  const route = useRoute();
  const { isDark, site } = useData();

  let page;
  const renderPage = () => setTimeout(() => page.render(), 20);

  onMounted(() => {
    import("genji-runtime").then(({ Page }) => {
      page = new Page({
        library,
        transform,
        isDark: isDark.value,
        path: route.path,
      });

      renderPage();

      // Avoid mount multiple times because of hot reload in development.
      dev(() => {
        if (window.__page__) window.__page__.dispose();
        window.__page__ = page;
      });
    });
  });

  watch(
    () => isDark.value,
    () => {
      page.emit("dark", isDark.value);
    },
  );

  dev(() => {
    onHMR(() => renderPage(), site.value.base);
  });

  watch(
    () => route.path,
    () => renderPage(),
  );

  onBeforeUnmount(() => {
    page.dispose();
  });
}
