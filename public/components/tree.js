export const Tree = {
  template: `<li @click="$emit('select', data.data.file)">
    {{data.data.name}}
  </li>`,
  props: ["data"],
};
