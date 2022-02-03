export const GH1 = {
  template: `<h1>{{content}}</h1>`,
  props: ["content"],
};

export const GCode = {
  template: `<div>
    <pre>{{content}}</pre>
    <div ref="output"></div>
  </div>`,
  props: ["content"],
  mounted() {
    const output = eval(this.content);
    if (output instanceof HTMLElement) {
      this.$refs.output.appendChild(output);
    }
  },
};
