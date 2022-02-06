import { Outline } from "./components/outline.js";
import { Notebook } from "./components/notebook.js";

{
  /* <p v-if="content === null">no data</p> */
}
{
  /* <notebook v-else :data="content" /> */
}
export const App = {
  template: `<div class="app">
    <outline 
      :title="notebook.title" 
      :data="notebook.outline" 
      :logo="notebook.logo"
    />

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
    content() {},
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
