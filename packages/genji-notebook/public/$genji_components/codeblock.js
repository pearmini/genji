import { md } from "../utils.js";
import { PinIcon, RunIcon } from "./icon.js";

function maybeBoolean(value) {
  if (value === "false") return false;
  if (value === "true") return true;
  return value;
}

function parseAttributes(string) {
  if (!string) return {};
  const attributes = string.split(";");
  return attributes.reduce((obj, attribute) => {
    const [key, value] = attribute.split(":");
    obj[key.trim()] = maybeBoolean(value.trim());
    return obj;
  }, {});
}

/**
 * @todo Format code.
 */
export const Codeblock = {
  template: `<div class="codeblock">
    <ul class="codeblock__tool" v-if="options.executable">
      <li @click="pin = !pin" :class="[
        'codeblock__tool-item',
        {'codeblock__tool-pin--pinned': pin}
      ]">
        <pin-icon />
      </>
    </ul>
    <div :class="[
      'codeblock__output',
      {'codeblock__output--only': !pin},
    ]" ref="output" v-if="options.executable"></div>
    <div class="codeblock__wrapper" :style="{
      marginTop: options.executable ? '0px' : '16px',
      display: (options.executable && !pin) ? 'none' : 'block'
    }">
      <li @click="run" class="codeblock__tool-item--run" v-if="options.executable && pin"><run-icon /></li>
      <textarea ref="textarea" :value='code' />
    </div>
  </div>`,
  props: ["content"],
  data: () => ({
    pin: false,
    clear: null,
    currentCode: null,
    history: [],
  }),
  components: {
    PinIcon,
    RunIcon,
  },
  computed: {
    options() {
      const [{ content, info }] = md.parse(this.content);
      const code = content.slice(0, content.length - 1);
      const [lang, description] = info.split("|");

      // For non JavaScript, do not render it.
      if (lang === undefined || lang.trim() !== "js") {
        return { code, executable: false, lang: `language-${lang}` };
      }

      // For JavaScript without options, render it by default.
      if (description === undefined) {
        return {
          code,
          pin: true,
          executable: true,
          lang: `language-${lang}`,
        };
      }

      // For JavaScript with options, do not render pure code blocks.
      const [type, string] = description.split('"');
      if (type.trim() === "pure") {
        return { code, executable: false, lang: `language-${lang}` };
      }
      return {
        code,
        pin: true,
        executable: true,
        lang: `language-${lang}`,
        ...parseAttributes(string),
      };
    },
    code: {
      get() {
        return this.currentCode ?? this.options.code;
      },
      set(newValue) {
        this.currentCode = newValue;
      },
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
    if (this.$refs.textarea) {
      const editor = CodeMirror.fromTextArea(this.$refs.textarea, {
        lineWrapping: true,
        readOnly: this.options.executable ? false : "nocursor",
      });
      editor.on("change", ({ doc }) => {
        this.code = doc.getValue();
      });
    }
    if (!this.options.executable) return;
    this.run(false);
  },
  beforeDestroy() {
    if (this.timer) clearTimeout(this.timer);
    if (typeof this.clear === "function") this.clear();
  },
  methods: {
    async run(byClick) {
      // Clear function may have error either.
      // Only throw errors related code execution.
      try {
        if (typeof this.clear === "function") this.clear();
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(async () => {
          this.$refs.output.innerHTML = "";
          const [value, clear] = await this.execute();
          if (this.$refs.output === undefined) return;
          if (value instanceof HTMLElement || value instanceof SVGElement) {
            this.$refs.output.appendChild(value);
            this.clear = clear;
            this.$emit("rendered", byClick);
          }
        }, 0);
      } catch (e) {}
    },
    async execute() {
      try {
        const output = await new Function(`return ${this.code}`)();
        return Array.isArray(output) ? output : [output, null];
      } catch (e) {
        console.error(e);
        const span = document.createElement("span");
        span.innerText = `${e.name}: ${e.message}. Open console for more details.`;
        span.style.display = "block";
        span.style.background = "#fbf3f3";
        span.style.color = "#fb1716";
        span.style.padding = "0.5rem";
        span.style.borderRadius = "6px";
        return [span, null];
      }
    },
  },
};
