import { Codeblock } from "./codeblock.js";
import { Markdown } from "./markdown.js";
import { href } from "../utils.js";

export const Notebook = {
  template: `<div class="notebook">
    <div class="notebook__content">
      <template v-for="block in blocks">
        <codeblock v-if="block.type === 'code'" :content="block.content" :key="block.content"/>
        <markdown v-else :content="block.content"  :key="block.content"/>
      </template>
    </div>
    <div class="notebook__outline" ref="outline">
      <div class="notebook__outline-content">
        <p v-for="h in headers" :style="{
          paddingLeft: (h.type - 2) * 16 + 'px'
        }">
          <a :href="href(h.content)">{{h.content}}</a>
        </p>
      </div>
    </div>
  </div>`,
  components: {
    Codeblock,
    Markdown,
  },
  props: {
    data: {
      default: "",
    },
  },
  methods: {
    href(text) {
      console.log("href");
      return "#" + href(text);
    },
  },
  computed: {
    headers() {
      const H = [];
      for (const line of this.data.split("\n")) {
        if (line.startsWith("#")) {
          const charts = line.split("");
          const startIndex = charts.findIndex(
            (d, i, a) => d === "#" && a[i - 1] !== "#"
          );
          const endIndex = charts.findIndex(
            (d, i, a) => d === "#" && a[i + 1] !== "#"
          );
          H.push({
            type: endIndex - startIndex + 1,
            content: line.slice(endIndex + 1).trim(),
          });
        }
      }
      console.log(H);
      return H.filter((d) => d.type > 1);
    },
    blocks() {
      const blocks = [];
      const lines = [];
      let inCode = false;
      for (const line of this.data.split("\n")) {
        const isCode = line.trimStart().startsWith("```");
        if (inCode && isCode) {
          inCode = false;
          blocks.push({ type: "code", lines: [...lines, line] });
          lines.length = 0;
        } else if (!inCode && isCode) {
          inCode = true;
          blocks.push({ type: "markdown", lines: [...lines] });
          lines.length = 0;
          lines.push(line);
        } else {
          lines.push(line);
        }
      }

      if (lines.length) {
        blocks.push({
          type: inCode ? "code" : "markdown",
          lines: [...lines],
        });
      }

      return blocks
        .map(({ type, lines }, index) => ({
          id: index,
          type,
          content: lines.join("\n"),
        }))
        .filter((d) => d.content !== "");
    },
  },
};
