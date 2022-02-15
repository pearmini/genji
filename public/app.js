import { Outline } from "./components/outline.js";
import { Notebook } from "./components/notebook.js";
import { fetchJSON } from "./utils.js";
import {
  GithubIcon,
  LinkIcon,
  MenuIcon,
  CloseIcon,
} from "./components/icon.js";

export const App = {
  template: `<div class="app">
    <div v-if="loadingMetadata" class="app__loading"></div>
    <template v-else>
      <transition name="app__loading-top-fade">
        <div v-if="!loadingMetadata && loadingNotebook" class="app__loading-top"></div>
      </transition>
      <div :class="['app__sidebar', {'app__sidebar--show': showSidebar}]">
        <outline
          :title="metadata.title" 
          :data="metadata.outline" 
          :logo="metadata.logo"
        />
      </div>
      <div class="app__main">
        <div class="app__header">
          <a v-if="metadata.link" :href="metadata.link" target="__blank"><link-icon/></a>
          <a v-if="metadata.github" :href="metadata.github" target="__blank"><github-icon/></a>
        </div>
        <notebook :data="content" /> 
        <div :class="['app__footer', {'app__footer--bottom': notFound }]">
          <span>{{copyright}}</span>
          Built with <a href="https://github.com/pearmini/genji-notebook" target="__blank">Genji Notebook</a>.
        </div>
      </div>
      <span class="app__menu-icon" @click="showSidebar = !showSidebar">
        <menu-icon v-if="!showSidebar" />
        <close-icon v-else="showSidebar" />
      </span>
    </template>
  </div>`,
  data: () => ({
    metadata: {},
    context: {
      selectedId: "",
    },
    showSidebar: false,
    loadingMetadata: false,
    loadingNotebook: false,
    notebooks: new Map(),
    notFound: false,
    content: "",
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
    copyright() {
      return this.metadata.title
        ? `Copyright © ${new Date().getFullYear()} ${this.metadata.title},`
        : "";
    },
  },
  async mounted() {
    try {
      const delay = setTimeout(() => (this.loadingMetadata = true), 300);
      this.metadata = await fetchJSON("./docs/metadata.json");
      const id = this.getId(this.$route);
      this.context.selectedId = id;
      this.content = await this.loadNotebook(id);
      clearTimeout(delay);
      this.loadingMetadata = false;
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async loadNotebook(id) {
      if (this.notebooks.has(id)) {
        this.notFound = false;
        return this.notebooks.get(id);
      } else {
        const delay = setTimeout(() => (this.loadingNotebook = true), 300);
        try {
          const notebook = await fetchJSON(`./docs/${id}.json`);
          // await new Promise((resolve) => {
          //   setTimeout(resolve, 3000)
          // })
          clearTimeout(delay);
          this.notebooks.set(id, notebook);
          this.loadingNotebook = false;
          this.notFound = false;
          return notebook;
        } catch {
          this.notFound = true;
          clearTimeout(delay);
          this.loadingNotebook = false;
          const { title, description } = this.metadata.notFound;
          return `# ${title}\n${description}`;
        }
      }
    },
    getId(route) {
      const { id = "/" } = route.params;
      const fileId = id === "/" ? this.metadata.first : id;
      return fileId.endsWith(".md") ? fileId.replace(".md", "") : fileId;
    },
  },
  watch: {
    async $route(to) {
      const id = this.getId(to);
      this.context.selectedId = id;
      this.content = await this.loadNotebook(id);
    },
  },
};
