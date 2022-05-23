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

function isBetween(x, a, b) {
  return x >= a && x < b;
}

// @see: https://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
  } else if ((sel = doc.selection) && sel.type != "Control") {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
}

function setCaretCharacterOffsetWithin(element, caretPosition) {
  // Find the insert node.
  let insertNode = null;
  let currentPosition = 0;
  for (const node of element.childNodes) {
    const text = textOf(node);
    const length = text.length;
    const start = currentPosition;
    const end = currentPosition + length;
    if (isBetween(caretPosition, start, end)) {
      insertNode = node;
      break;
    }
    currentPosition += length;
  }

  // Insert caret to insert node;
  const selection = document.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  const insertOffset = caretPosition - currentPosition;
  const insertTextNode = textNodeOf(insertNode);
  range.setStart(insertTextNode, insertOffset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function innerCodeOf(node) {
  let code = "";
  for (const child of node.childNodes) {
    if (isNewline(child)) code += "\n";
    const text = textOf(child);
    code += text;
  }
  return code;
}

// <div><br/><div> which already have a \n.
function isNewline(node) {
  return node.nodeName === "DIV" && node.childNodes[0].nodeName !== "BR";
}

/**
 * @todo More narrow assets.
 */
function isUndoKeycode(e) {
  const {
    keyCode,
    metaKey, // For Mac.
    ctrlKey, // For Windows.
  } = e;
  return keyCode === 90 && (metaKey || ctrlKey);
}

function insert(target, position, source) {
  const charts = target.split("");
  charts.splice(position, 0, source);
  return charts.join("");
}

function textOf(node) {
  return node.nodeName === "#text" ? node.nodeValue : node.innerText;
}

function textNodeOf(node) {
  return node.nodeName === "#text" ? node : node.childNodes[0];
}

/**
 * @todo More short cuts for programming such comment, redo.
 * @todo Format code.
 * @todo Details.
 * @todo Keydown should update code too.
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
    <div class="codeblock__wrapper">
      <li @click="run" class="codeblock__tool-item--run" v-if="options.executable && pin"><run-icon /></li>
      <pre :class="[
        'codeblock__pre',
        'hljs',
        options.lang ? options.lang : '',
        {'codeblock__pre--executable': options.executable},
        {'codeblock__pre--hide': options.executable && !pin}
      ]"
      ><code ref="code" 
        :contenteditable="options.executable ? true : false"
        spellcheck="false"
        autocorrect="false"
        autocapitalize="false"
        translate="no"
        @input="input"
        @keydown="keydown"
        @keyup="keyup"
      >{{code}}</code></pre>
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
      const [{ content: code, info }] = md.parse(this.content);
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
    if (this.$refs.code) hljs.highlightElement(this.$refs.code);
    if (!this.options.executable) return;
    this.run();
  },
  beforeDestroy() {
    if (this.timer) clearTimeout(this.timer);
    if (typeof this.clear === "function") this.clear();
  },
  methods: {
    updateCode(code, caretPosition) {
      this.$refs.code.innerHTML = code;
      hljs.highlightElement(this.$refs.code);
      setCaretCharacterOffsetWithin(this.$refs.code, caretPosition);
    },
    undo() {
      if (this.history.length === 0) return;
      const { code, caretPosition } = this.history.pop();
      this.code = code;
      this.updateCode(code, caretPosition);
    },
    input() {
      this.code = innerCodeOf(this.$refs.code);
    },
    keydown(e) {
      // Save pre state.
      const caretPosition = getCaretCharacterOffsetWithin(this.$refs.code);
      this.preCode = `${this.code}`;
      this.preCaretPosition = caretPosition;

      // Cmd + Z
      if (isUndoKeycode(e)) {
        this.undo();
        return;
      }

      // Prevent default tab event to jump between controls.
      if (e.keyCode === 9) e.preventDefault();
    },
    keyup(e) {
      // Skip undo cause it will update code already.
      if (isUndoKeycode(e)) return;

      // Initial position for caret which will change as followed.
      let caretPosition = getCaretCharacterOffsetWithin(this.$refs.code);

      // Enter should add 1.
      if (e.keyCode === 13) caretPosition += 1;

      // Update code for tab because it prevents default behavior.
      if (e.keyCode === 9) {
        this.code = insert(this.code, caretPosition, "\t");
        caretPosition += 1;
      }

      // Store changed state for undo.
      if (
        this.code !== this.preCode ||
        caretPosition !== this.preCaretPosition
      ) {
        this.history.push({
          code: `${this.preCode}`,
          caretPosition: this.preCaretPosition,
        });
      }

      // Update codeblocks.
      this.updateCode(this.code, caretPosition);
    },
    async run() {
      // Clear function may have error either.
      try {
        if (typeof this.clear === "function") this.clear();
      } catch (e) {
        // Noop.
      }

      // Execute code.
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(async () => {
        this.$refs.output.innerHTML = "";
        const [value, clear] = await this.execute();
        if (this.$refs.output === undefined) return;
        if (value instanceof HTMLElement || value instanceof SVGElement) {
          this.$refs.output.appendChild(value);
          this.clear = clear;
          this.$emit("rendered");
        }
      }, 0);
    },
    async execute() {
      try {
        const output = await eval(this.code);
        return Array.isArray(output) ? output : [output, null];
      } catch (e) {
        console.error(e);
        const span = document.createElement("span");
        span.innerText = `${e.name}: ${e.message}`;
        span.style.display = "block";
        span.style.background = "#fbf3f3";
        span.style.color = "#fb1716";
        span.style.padding = "0.5rem";
        span.style.borderRadius = "6px";
        span.style.marginBottom = "3px";
        return [span, null];
      }
    },
  },
};
