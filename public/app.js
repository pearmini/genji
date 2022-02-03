import { Outline } from "./components/outline.js";
import { Notebook } from "./components/notebook.js";

export const App = {
  template: `<div :style="styles.container">
    <outline :title="notebook.title" :data="notebook.outline" @select="onSelect" />
    <notebook :data="module"/>
  </div>`,
  data: () => ({
    notebook: {},
    module: {},
    styles: {
      container: {
        display: "flex",
      },
    },
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
      });
  },
  methods: {
    onSelect(e) {
      this.module = this.notebook.modules.find((d) => d.id === e);
    },
  },
};
