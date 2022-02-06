import { md } from "../utils.js";
export const Markdown = {
  template: `<div class="markdown" v-html="html"></div>`,
  props: ["content"],
  computed: {
    html() {
      return md.render(this.content);
    },
  },
};
