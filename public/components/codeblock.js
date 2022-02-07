import { md } from "../utils.js";
import { PinIcon, RunIcon } from "./icon.js";

function mayBeBoolean(value) {
  if (value === "false") return false;
  if (value === "true") return true;
  return value;
}

function parseAttributes(string) {
  if (!string) return {};
  const attributes = string.split(";");
  return attributes.reduce((obj, attribute) => {
    const [key, value] = attribute.split(":");
    obj[key.trim()] = mayBeBoolean(value.trim());
    return obj;
  }, {});
}

export const Codeblock = {
  template: `<div class="codeblock">
    <ul class="codeblock__tool" v-if="options.executable">
      <li @click="run" class="codeblock__tool-item"><run-icon /></>
      <li @click="pin = !pin" :class="[
        'codeblock__tool-item',
        pin ? 'codeblock__tool-pin--pinned' : ''
      ]">
        <pin-icon />
      </>
    </ul>
    <div :class="[
      'codeblock__output',
      pin ? '' : 'codeblock__output--only',
    ]" ref="output" v-if="options.executable"></div>
    <pre :class="[
      'codeblock__pre',
      'hljs',
      options.executable ? 'codeblock__pre--executable' : '',
      !options.executable || pin ? '' : 'codeblock__pre--hide'
    ]"><code ref="code">{{options.code}}</code></pre>
  </div>`,
  props: ["content"],
  data: () => ({ pin: false, clear: null }),
  components: {
    PinIcon,
    RunIcon,
  },
  computed: {
    options() {
      const [{ content: code, info }] = md.parse(this.content);
      const [lang, description] = info.split("|");
      if (
        lang === undefined ||
        lang.trim() !== "js" ||
        description === undefined
      ) {
        return { code, executable: false };
      }
      const [type, string] = description.split('"');
      if (type.trim() !== "DOM") return { code, executable: false };
      return {
        code,
        pin: true,
        executable: true,
        ...parseAttributes(string),
      };
    },
  },
  watch: {
    options: {
      handler(newValue = {}) {
        this.pin = newValue.pin;
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.$refs.code) hljs.highlightElement(this.$refs.code);
    if (!this.options.executable) return;
    this.run();
  },
  beforeDestroy() {
    if (typeof this.clear === "function") this.clear();
  },
  methods: {
    run() {
      if (typeof this.clear === "function") this.clear();
      const [value, clear] = this.execute();
      if (value instanceof HTMLElement) {
        this.$refs.output.innerHTML = "";
        this.$refs.output.appendChild(value);
        this.clear = clear;
      }
    },
    execute() {
      try {
        const output = eval(this.options.code);
        return Array.isArray(output) ? output : [output, null];
      } catch (e) {
        const span = document.createElement("span");
        span.innerText = `${e.name}: ${e.message}`;
        span.style.display = "block";
        span.style.background = "#fbf3f3";
        span.style.color = "#fb1716";
        span.style.padding = "0.5rem";
        span.style.borderRadius = "6px";
        span.style.marginBottom = "3px";
        span.style.marginTop = "16px";
        return [span, null];
      }
    },
  },
};
