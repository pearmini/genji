import { Tree } from "./tree.js";

export const Outline = {
  template: `<div>
    <div>
      <h1>{{title}}</h1>
    </div>
    <div>
      <tree v-for="tree in data" :data="tree" :key="tree.name" @select="$emit('select', $event)"/>
    </div>
  </div>`,
  props: ["title", "data"],
  components: {
    Tree,
  },
};
