import { Tree } from "./tree.js";

export const Outline = {
  template: `<div class="outline">
    <div class="outline__header">
      <img v-if="logo" :src="logo" class="outline__logo" alt="logo"/>
      <h1>{{title}}</h1>
    </div>
    <div class="outline__tree">
       <tree v-if="data !== undefined" :data="data" :root="true"/>
    </div>
  </div>`,
  props: ["title", "data", "logo"],
  components: {
    Tree,
  },
};
