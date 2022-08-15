import { Codeblock } from "./codeblock.js";
import { Markdown } from "./markdown.js";
import { href, md, fromVue } from "../utils.js";

function parseNodes(markdown) {
  const nodes = [];
  const lines = [];
  let inCode = false;
  for (const line of markdown.split("\n")) {
    const isCode = line.trimStart().startsWith("```");
    if (inCode && isCode) {
      inCode = false;
      nodes.push({ type: "code", lines: [...lines, line] });
      lines.length = 0;
    } else if (!inCode && isCode) {
      inCode = true;
      nodes.push({ type: "markdown", lines: [...lines] });
      lines.length = 0;
      lines.push(line);
    } else {
      lines.push(line);
    }
  }
  if (lines.length) {
    nodes.push({
      type: inCode ? "code" : "markdown",
      lines: [...lines],
    });
  }

  return nodes
    .filter((d) => !isEmpty(d))
    .map(({ lines, ...rest }, index) => ({
      ...rest,
      id: index,
      content: lines.join("\n"),
    }))
    .map((node) => (node.type === "code" ? parseCodeNode(node) : node))
    .map((node) => (isExecutableNode(node) ? parseExecutableNode(node) : node));
}

function parseAttributes(string) {
  if (!string) return {};
  const attributes = string.split(";");
  return attributes.reduce((obj, attribute) => {
    const index = attribute.split("").indexOf(":");
    const key = attribute.slice(0, index);
    const value = attribute.slice(index + 1);
    obj[key.trim()] = new Function(`return ${value}`)();
    return obj;
  }, {});
}

function parseExecutableNode(node) {
  const { content } = node;
  const tokens = esprima.tokenize(content);
  const ast = esprima.parseScript(content);
  const [name, expression, params = []] = createVariable(ast, node);
  const paramNames = params.map((d) => d.name);
  return { ...node, name, expression, tokens, ast, params: paramNames };
}

function createVariable(ast, node) {
  if (isAssignment(ast)) return createAssignmentNode(node, ast);
  if (isCall(ast)) return createCallNode(node);
  if (isFunctionDeclaration(ast)) return createFunctionNode(node, ast);
  if (isVariableDeclaration(ast)) return createVariableNode(node, ast);
  if (isExpression(ast)) return createExpressionNode(node, ast);
  return [undefined, ""];
}

function createAssignmentNode(node, ast) {
  const { content } = node;
  const [name, value] = splitByEqual(content);
  const params = ast.body[0]?.expression?.right?.params || [];
  return [name.trim(), value.trim(), params];
}

function createVariableNode(node, ast) {
  const { content } = node;
  const [prefix, value] = splitByEqual(content);
  const name = prefix.trim().split(" ").pop();
  const params = ast.body[0]?.declarations[0]?.init?.params || [];
  return [name.trim(), value.trim(), params];
}

function createCallNode(node, ast) {
  const { content } = node;
  return [, content];
}

function createExpressionNode(node, ast) {
  const { content } = node;
  return [, content];
}

function splitByEqual(content) {
  const index = content.split("").findIndex((d) => d === "=");
  const before = content.slice(0, index);
  const after = content.slice(index + 1, content.length);
  return [before, after];
}

function createFunctionNode(node, ast) {
  const { name } = ast.body[0].id;
  const { params } = ast.body[0];
  const { content } = node;
  const value = content.replace(name, "");
  return [name, value, params];
}

function typeOfExpression(ast) {
  return ast.body[0]?.expression?.type;
}

function typeOfBody(ast) {
  return ast.body[0]?.type;
}

function isAssignment(ast) {
  return typeOfExpression(ast) === "AssignmentExpression";
}

function isCall(ast) {
  return typeOfExpression(ast) === "CallExpression";
}

function isVariableDeclaration(ast) {
  return typeOfBody(ast) === "VariableDeclaration";
}

function isFunctionDeclaration(ast) {
  return typeOfBody(ast) === "FunctionDeclaration";
}

function isExpression(ast) {
  return typeOfBody(ast) === "ExpressionStatement";
}

function isEmpty(node) {
  const { lines } = node;
  if (lines.length === 0) return true;
  if (lines.length === 1 && lines[0] === "") return true;
  return false;
}

function isExecutableNode(node) {
  return node.type === "code" && node.executable;
}

function buildGraph(nodes) {
  const idRelation = new Map(nodes.map((n) => [n.id, { from: [], to: [] }]));
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];
      const r1 = idRelation.get(n1.id);
      const r2 = idRelation.get(n2.id);
      const ref1 = isReference(n1, n2);
      const ref2 = isReference(n2, n1);
      if (ref1 && ref2) {
        throw new Error(`Circular Reference for ${n1.name} and ${n2.name}`);
      }
      if (ref1) {
        r1.to.push(n2.id);
        r2.from.push(n1.id);
      } else if (ref2) {
        r1.from.push(n2.id);
        r2.to.push(n1.id);
      }
    }
  }
  return idRelation;
}

function isReference(n1, n2) {
  const { name } = n1;
  const { tokens, params } = n2;
  return tokens
    .filter((d) => !params.includes(d.value))
    .some((d) => d.type === "Identifier" && d.value === name);
}

function execute(id, idNode, idRelation, idValue, idCount, hooks) {
  const { loading, success, error } = hooks;
  const node = idNode.get(id);
  loading(node);
  const { expression } = node;
  const relation = idRelation.get(id);
  const { from, to } = relation;
  const names = from.map((id) => idNode.get(id).name);
  const deps = from.map((id) => idValue.get(id));
  Promise.all(deps)
    .then((values) => {
      const output = new Function(...names, `return ${expression}`)(...values);
      const promise = Promise.resolve(output)
        .then((value) => {
          idValue.set(id, value);
          success(node);
          return Promise.resolve(value);
        })
        .catch((e) => error(e, node));
      idValue.set(id, promise);
      for (const toId of to) {
        const count = idCount.get(toId);
        if (count - 1 <= 0) {
          idCount.set(toId, 0);
          execute(toId, idNode, idRelation, idValue, idCount, hooks);
        } else {
          idCount.set(toId, count - 1);
        }
      }
    })
    .catch((e) => error(e, node));
}

function rootsOf(idRelation) {
  return Array.from(idRelation.entries())
    .filter(([, d]) => d.from.length === 0)
    .map(([id]) => id);
}

function descentsOf(id, idRelation) {
  const discoverd = [id];
  const descents = [];
  while (discoverd.length) {
    const node = discoverd.pop();
    const { to } = idRelation.get(node);
    discoverd.push(...to);
    descents.push(...to);
  }
  return descents;
}

function parseCodeNode(node) {
  const { content } = node;
  const [{ content: code, info }] = md.parse(content);
  const newCode = code.slice(0, code.length - 1);
  const [lang, description] = info.split("|");

  // For non JavaScript, do not render it.
  if (lang === undefined || lang.trim() !== "js") {
    return {
      ...node,
      content: newCode,
      executable: false,
      lang: `language-${lang}`,
    };
  }

  // For JavaScript without options, render it by default.
  if (description === undefined) {
    return {
      ...node,
      outputType: "dom",
      content: newCode,
      pin: true,
      executable: true,
      lang: `language-${lang}`,
    };
  }

  // For JavaScript with options, do not render pure code blocks.
  const [type, string] = description.split('"');
  const outputType = type.trim();
  if (outputType === "pure") {
    return {
      ...node,
      outputType,
      executable: false,
      lang: `language-${lang}`,
      content: newCode,
    };
  }
  return {
    ...node,
    outputType,
    pin: true,
    executable: true,
    lang: `language-${lang}`,
    content: newCode,
    ...parseAttributes(string),
  };
}

function createLoading() {
  const node = fromVue({
    template: `<span :style='{
      display: "block",
      padding: "0.25rem 0",
      borderLeft: "5px solid var(--genji-main-color)",
      paddingLeft: "12px",
    }'><span style="opacity: 0">loading...</span></span>`,
  });
  node.$loading = true;
  return node;
}

function createError(e) {
  const node = fromVue({
    template: `<span :style='{
      display: "block",
      color: "#fb1716",
      padding: "0.25rem 0",
      borderLeft: "5px solid #ff0000",
      paddingLeft: "12px",
    }'>${e.name}: ${e.message}. Open console for more details.
    </span>`,
  });
  node.$error = true;
  return node;
}

function diff(a, b) {
  const bs = new Set(b);
  return a.filter((d) => !bs.has(d));
}

export const Notebook = {
  template: `<div class="notebook" ref="container">
    <div class="notebook__main">
      <div class="notebook__content">
        <template v-for="node in nodes">
          <codeblock v-if="node.type === 'code'" 
            ref="code"
            :options="node" 
            :output="output[node.id]"
            :variables="variables"
            :key="node.content"
            @updateValue="updateNodeValue"
            @updateContent="updateNodeContent"
          />
          <markdown v-else :content="node.content"  :key="node.content"/>
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
    </div>
  </div>`,
  components: {
    Codeblock,
    Markdown,
  },
  props: {
    content: {
      default: "",
    },
  },
  inject: ["baseURL"],
  data: () => ({
    output: {},
    nodes: [],
    shouldJumpToAnchor: false,
  }),
  updated() {
    this.enableHashLinks();
    if (this.shouldJumpToAnchor) {
      this.jumpToAnchor();
      this.shouldJumpToAnchor = false;
    }
  },
  methods: {
    href(text) {
      return "#" + href(text);
    },
    jumpToAnchor() {
      const { hash } = this.$route;
      const id = hash.replace("#", "");
      const h = document.getElementById(id);
      if (h && h.scrollIntoView) {
        h.scrollIntoView();
      }
    },
    enableHashLinks() {
      const A = this.$refs.container.getElementsByTagName("a");
      const notebookLink = (a) => {
        const href = a.getAttribute("href");
        return (
          !href.startsWith("#") &&
          !href.startsWith("http") &&
          a._notebookLink !== true
        );
      };
      for (const a of A) {
        if (notebookLink(a)) {
          a.onclick = (e) => {
            e.preventDefault();
            const href = a.getAttribute("href");
            // Avoid NavigationDuplicated.
            const relativeHref = href.replace(this.baseURL, "");
            if (!this.$route.fullPath.includes(relativeHref)) {
              this.$router.push(relativeHref);
            }
            this.jumpToAnchor();
          };
          a._notebookLink = true;
        }
      }
    },
    execute(id) {
      execute(
        id,
        this.idNode,
        this.idRelation,
        this.idValue,
        this.idCount,
        this.hooks
      );
    },
    updateNodeContent(id, content) {
      const index = this.nodes.findIndex((d) => d.id === id);
      const node = this.nodes[index];
      const newNode = parseExecutableNode({ ...node, content });
      const { to } = this.idRelation.get(id);
      this.nodes.splice(index, 1, newNode);
      this.execute(id);

      // There maybe reduce some deps, execute these
      // deps to throw a error.
      const { to: newTo } = this.idRelation.get(id);
      const reduceTo = diff(to, newTo);
      for (const id of reduceTo) {
        this.execute(id);
      }
    },
    updateNodeValue(id, value) {
      this.idValue.set(id, value);
      const { to } = this.idRelation.get(id);
      for (const toId of to) {
        this.execute(toId);
      }
    },
  },
  watch: {
    content: {
      // This is very important.
      // Remove this exactable part of page will not execute.
      immediate: true,
      handler() {
        this.shouldJumpToAnchor = true;
        this.nodes = parseNodes(this.content);
        this.idValue = new Map(this.nodes.map((d) => [d.id, undefined]));
        this.idCount = new Map(
          this.nodes
            .filter(isExecutableNode)
            .map((d) => [d.id, this.idRelation.get(d.id).from.length])
        );
        this.hooks = {
          loading: (node) => {
            const { id } = node;
            const loading = createLoading();
            this.$set(this.output, id, loading);
          },
          success: (node) => {
            const { id } = node;
            const value = this.idValue.get(id);
            this.$set(this.output, id, value);
          },
          error: (e, node) => {
            const { id } = node;
            const E = [...descentsOf(id, this.idRelation), id];
            for (const eid of E) {
              const error = createError(e);
              this.$set(this.output, eid, error);
            }
            console.error(e);
          },
        };
        const roots = rootsOf(this.idRelation);
        for (const id of roots) {
          this.execute(id);
        }
      },
    },
  },
  computed: {
    headers() {
      return this.content
        .split("\n")
        .filter((d) => d.startsWith("#"))
        .map((line) => {
          const chars = line.split("");
          const start = (d, i, a) => d === "#" && a[i - 1] !== "#";
          const end = (d, i, a) => d === "#" && a[i + 1] !== "#";
          const startIndex = chars.findIndex(start);
          const endIndex = chars.findIndex(end);
          return {
            type: endIndex - startIndex + 1,
            content: line.slice(endIndex + 1).trim(),
          };
        })
        .filter((d) => d.type > 1);
    },
    idRelation() {
      const executableNodes = this.nodes.filter(isExecutableNode);
      return buildGraph(executableNodes);
    },
    idNode() {
      return new Map(this.nodes.map((d) => [d.id, d]));
    },
    variables() {
      return this.nodes
        .filter(isExecutableNode)
        .map((d) => d.name)
        .filter((d) => d !== undefined);
    },
  },
};
