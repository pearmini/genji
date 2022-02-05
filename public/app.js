import { Outline } from "./components/outline.js";
import { Notebook } from "./components/notebook.js";

export const App = {
  template: `<div class="app">
    <outline 
      :title="notebook.title" 
      :data="notebook.outline" 
      :logo="notebook.logo"
    />
    <router-view></router-view>
  </div>`,
  data: () => ({
    notebook: {},
    module: {},
  }),
  components: {
    Outline,
    Notebook,
  },
  mounted() {
    fetch("./notebook.json")
      .then((response) => response.json())
      .then((data) => {
        this.notebook = data;
        this.$router.push("/docs/");
      });
  },
  watch: {
    $route: {
      handler(to, from) {
        const { id } = to.params;
        this.$store.commit("setSelectedId", id || "");
      },
      immediate: true,
    },
  },
};
