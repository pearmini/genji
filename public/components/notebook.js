import { Codeblock } from "./codeblock.js";
import { Markdown } from "./markdown.js";

export const Notebook = {
  template: `<div class="notebook">
    <template v-for="block in blocks">
      <codeblock v-if="block.type === 'code'" :content="block.content" :key="block.content"/>
      <markdown v-else :content="block.content"  :key="block.content"/>
    </template>
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
  computed: {
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
