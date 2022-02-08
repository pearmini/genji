import { Outline } from "./components/outline.js";
import { Notebook } from "./components/notebook.js";
import {
  GithubIcon,
  LinkIcon,
  MenuIcon,
  CloseIcon,
} from "./components/icon.js";

export const App = {
  template: `<div class="app">
    <div :class="['app__sidebar', {'app__sidebar--show': showSidebar}]">
      <outline 
        :title="notebook.title" 
        :data="notebook.outline" 
        :logo="notebook.logo"
      />
    </div>
    <div class="app__main">
      <div class="app__header">
        <a v-if="notebook.link" :href="notebook.link" target="__blank"><link-icon/></a>
        <a v-if="notebook.github" :href="notebook.github" target="__blank"><github-icon/></a>
      </div>
      <notebook :data="content" /> 
      <div :class="['app__footer', {'app__footer--bottom': empty }]">
        <span>{{copyright}}</span>
        Built with <a href="https://github.com/pearmini/genji-notebook" target="__blank">Genji Notebook</a>.
      </div>
    </div>
    <span class="app__menu-icon" @click="showSidebar = !showSidebar">
      <menu-icon v-if="!showSidebar" />
      <close-icon v-else="showSidebar" />
    </span>
  </div>`,
  data: () => ({
    notebook: {},
    context: {
      selectedId: "",
    },
    showSidebar: false,
  }),
  provide() {
    const hideSidebar = () => (this.showSidebar = false);
    return {
      context: this.context,
      hideSidebar: hideSidebar.bind(this),
    };
  },
  components: {
    Outline,
    Notebook,
    GithubIcon,
    LinkIcon,
    MenuIcon,
    CloseIcon,
  },
  computed: {
    content() {
      if (!this.notebook.modules) return undefined;
      const { notFound } = this.notebook;
      const _404 = `# ${notFound.title}\n${notFound.description}`;
      return this.module ? this.module.markdown : _404;
    },
    module() {
      if (!this.notebook.modules) return undefined;
      return this.notebook.modules.find(
        (d) => d.id === this.context.selectedId
      );
    },
    empty() {
      return this.module === undefined;
    },
    copyright() {
      return this.notebook.title
        ? `Copyright © ${new Date().getFullYear()} ${this.notebook.title},`
        : "";
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
