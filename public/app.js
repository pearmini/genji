import { Outline } from "./components/outline.js";
import { Notebook } from "./components/notebook.js";

export const App = {
  template: `<div class="app">
    <outline 
      :title="notebook.title" 
      :data="notebook.outline" 
      :logo="notebook.logo"
    />
    <div class="app__main">
      <p v-if="!content">no data</p> 
      <notebook v-else :data="content" /> 
    </div>
  </div>`,
  data: () => ({
    notebook: {},
    context: {
      selectedId: "",
    },
  }),
  provide() {
    return {
      context: this.context,
    };
  },
  components: {
    Outline,
    Notebook,
  },
  computed: {
    content() {
      if (!this.notebook.modules) return undefined;
      const module = this.notebook.modules.find(
        (d) => d.id === this.context.selectedId
      );
      const { notFound } = this.notebook;
      const $404 = `# ${notFound.title}\n${notFound.description}`;
      return module ? module.markdown : $404;
    },
  },
  mounted() {
    fetch("./notebook.json")
      .then((response) => response.json())
      .then((data) => {
        this.notebook = data;
      });
  },
  watch: {
    $route: {
      handler(to) {
        const { id = "" } = to.params;
        this.context.selectedId = id;
      },
      immediate: true,
    },
  },
};
