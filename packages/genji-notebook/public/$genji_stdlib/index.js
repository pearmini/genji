function fromVue(component) {
  const Component = Vue.extend(component);
  return new Component().$mount().$el;
}

function preview(thumbnails, options) {
  return fromVue({
    template: `<div class="preview__container">
        <a v-for="d in thumbnails" :href="d.path">
          <div class="preview__container--image" :style="{
            backgroundImage: 'url(' + d.thumbnail + ')'
          }"></div>
          <div class="preview__container--title">{{d.title}}</div>
        </a>
    </div>`,
    data() {
      return {
        thumbnails,
      };
    },
  });
}

const genji = {
  preview,
};
