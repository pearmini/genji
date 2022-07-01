import { PinIcon, RunIcon } from "./icon.js";
import { createDescription, createInput, createTable } from "./output.js";

function isDom(output) {
  return output instanceof HTMLElement || output instanceof SVGElement;
}

function normalizeOutput(options, output, vm) {
  const { outputType } = options;
  if (output?.$loading || output?.$error) {
    return output;
  } else if (outputType === "dom") {
    return isDom(output) ? output : createDescription(options, output);
  } else if (outputType === "table") {
    return createTable(options, output);
  } else {
    return createInput(options, output, vm);
  }
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
      {'codeblock__output--builtin': builtin }
    ]" ref="output" v-if="options.executable" :output="output"></div>
    <div class="codeblock__wrapper" ref="code" :style="{
      marginTop: options.executable ? '0px' : '16px',
      display: (options.executable && !pin) ? 'none' : 'block'
    }">
      <li @click="run" class="codeblock__tool-item--run" v-if="options.executable && pin"><run-icon /></li>
      <textarea ref="textarea" :value='code' />
    </div>
  </div>`,
  props: ["options", "output", "variables"],
  data: () => ({
    clear: null,
    currentCode: null,
    currentPin: null,
  }),
  components: {
    PinIcon,
    RunIcon,
  },
  computed: {
    pin: {
      get() {
        return this.currentPin ?? this.options.pin;
      },
      set(newValue) {
        this.currentPin = newValue;
      },
    },
    code: {
      get() {
        return this.currentCode ?? this.options.content;
      },
      set(newValue) {
        this.currentCode = newValue;
      },
    },
    builtin() {
      if (this.output === null) return false;
      if (typeof this.output !== "object") return false;
      return this.output.$loading || this.output.$error;
    },
  },
  updated() {
    if (!this.options.executable) return;
    this.renderOutput();
  },
  mounted() {
    if (!this.$refs.textarea) return;
    const { code } = this.$refs;
    const none = code.style.display === "none";
    if (none) {
      code.style.display = "block";
      code.style.position = "absolute";
      code.style.left = "-1000px";
      code.style.right = "-1000px";
    }
    const editor = CodeMirror.fromTextArea(this.$refs.textarea, {
      readOnly: this.options.executable ? false : "nocursor",
    });
    if (none) {
      code.style.display = "none";
      code.style.position = "static";
    }
    // Bind events and render outputs.
    if (!this.options.executable) return;
    editor.on("change", ({ doc }) => {
      this.code = doc.getValue();
    });
    editor.on("update", () => this.renderUnderline());
    this.renderUnderline();
    this.renderOutput();
  },
  methods: {
    renderUnderline() {
      const spans = this.$refs.code.getElementsByClassName("cm-variable");
      for (const span of spans) {
        const { innerText } = span;
        const { name } = this.options;
        const underline =
          this.variables?.includes(innerText) && name !== innerText;
        span.style.borderBottom = underline ? "1px solid #aaa" : "";
      }
    },
    renderOutput() {
      if (!this.$refs.output) return;
      const output = normalizeOutput(
        this.options,
        this.output,
        this.$emit.bind(this)
      );
      this.$refs.output.innerHTML = "";
      this.$refs.output.appendChild(output);
    },
    async run() {
      this.$emit("updateContent", this.options.id, this.code);
    },
  },
};
