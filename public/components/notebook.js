import { GH1, GCode } from "./block.js";

export const Notebook = {
  template: `<div>
    <template v-for="block in data.blocks">
      <g-h1 v-if="block.type === 'h1'" :content="block.content" />
      <g-code v-if="block.type === 'code'" :content="block.content" />
    </template>
  </div>`,
  components: {
    GH1,
    GCode,
  },
  props: ["data"],
  data: () => ({
    styles: {},
  }),
};
