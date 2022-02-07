import { md } from "../utils.js";
export const Markdown = {
  template: `<article class="markdown-body" v-html="html"></article>`,
  props: ["content"],
  computed: {
    html() {
      return md.render(this.content);
    },
  },
};
