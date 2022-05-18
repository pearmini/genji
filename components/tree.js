export const Tree = {
  template: `<template>
    <ul :class="root ? 'tree__list--root' : 'tree__list'" v-if="Array.isArray(data)">
      <tree v-for="d in data" :data="d" :key="d.name"/>
    </ul>
    <li v-else 
      :class="[
        'tree__list-item',
        {'tree__list-item--collapsed': data.children && !showChildren }
      ]" 
      @click="onClickListItem"
    >
      <router-link 
        :to="to" 
        :class="[
          'tree__link', 
          {'tree__link--sublist': data.children},
          {'tree__link--active': selected}
        ]"
      >
        {{data.data.name}}
      </router-link>
      <collapse-transition>
        <tree v-if="data.children && showChildren" :data="data.children" :root="false"/>
      </collapse-transition>
    </li>
  </template>`,
  props: ["data", "root"],
  name: "Tree",
  inject: ["context", "hideSidebar"],
  computed: {
    to() {
      const { id, file } = this.data.data;
      if (file === undefined) return "";
      return `/${id}` || "";
    },
    selected() {
      return (
        this.context.selectedId === this.data.data.id && !this.data.children
      );
    },
  },
  data: () => ({ showChildren: true }),
  methods: {
    onClickListItem(e) {
      if (this.data.children) {
        this.showChildren = !this.showChildren;
      }
      this.hideSidebar();
      e.stopPropagation();
    },
  },
};
