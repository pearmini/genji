export const Tree = {
  template: `<template>
    <ul :class="root ? 'tree__list--root' : 'tree__list'" v-if="Array.isArray(data)">
      <tree v-for="d in data" :data="d" :key="d.name"/>
    </ul>
    <li v-else 
      :class="[
        'tree__list-item',
        data.children && !showChildren ? 'tree__list-item--collapsed' : '',
      ]" 
      @click="onClickListItem"
    >
      <router-link 
        :to="to" 
        :class="[
          'tree__link', 
          data.children ? 'tree__link--sublist' : '',
          selected? 'tree__link--active' : '',
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
  computed: {
    to() {
      const { fileId } = this.data.data;
      return fileId ? "/docs/" + fileId : "/docs";
    },
    selected() {
      const { selectedId } = this.$store.state;
      const { id } = this.data.data;
      return selectedId === id && !this.data.children;
    },
  },
  data: () => ({ showChildren: true }),
  methods: {
    onClickListItem(e) {
      if (this.data.children) {
        this.showChildren = !this.showChildren;
      }
      e.stopPropagation();
    },
  },
};
