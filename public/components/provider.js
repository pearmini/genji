import { Notebook } from "./notebook.js";

export const Provider = {
  template: `<div>
    <p v-if="content === null">no data</p>
    <notebook v-else :data="content" />
  </div>`,
  components: {
    Notebook,
  },
  data: () => ({ content: null }),
};
