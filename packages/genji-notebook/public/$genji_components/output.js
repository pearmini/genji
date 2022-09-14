import { normalizeCSSColor, fromVue } from "../utils.js";

export function createInput(options, output, $emit) {
  const value = isColor(options) ? normalizeCSSColor(output) : output;
  const { outputType } = options;
  const registry = {
    number: createNumberInput,
    range: createRangeInput,
    select: createSelectInput,
    radio: createRadioInput,
  };
  const inputFactory = registry[outputType] || createBasicInput;
  return inputFactory(options, value, $emit);
}

export function createDescription(options, output) {
  const { name } = options;
  const value = valueOf(options, output);
  typeof output === "function"
    ? output.toString()
    : typeof output === "object"
    ? JSON.stringify(output)
    : output;
  const description = name === undefined ? value : `${name} = ${value}`;
  return fromVue({
    template: `<div :style="{
      overflow: 'auto',
      whiteSpace: 'nowrap',
      padding: '0.5em 0',
      fontSize: '85%',
      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace !important'
    }">${description}</div>`,
  });
}

export function createTable(options, output, vm) {
  const { maxCount = 10 } = options;
  if (!Array.isArray(output) || output.length === 0) {
    return fromVue({ template: "<div>No Data</div>" });
  }
  return fromVue({
    template: `<table class="genji__output--table" >
      <thead>
        <th v-for="key in keys">{{key}}</th>
      </thead>
      <tbody>
        <tr v-for="datum in data">
          <td v-for="key in keys">{{datum[key]}}</td>
        </tr>
      </tbody>
    </table>`,
    data: () => ({ output }),
    computed: {
      data() {
        if (maxCount > this.output.length) return this.output;
        const head = this.output.slice(0, maxCount);
        const tail = Object.fromEntries(this.keys.map((key) => [key, "..."]));
        return [...head, tail];
      },
      keys() {
        const [datum] = this.output;
        return Object.keys(datum);
      },
    },
  });
}

function createNumberInput(options, value, $emit) {
  const template = `<input :type="type" :value="value" :min="min" :max="max" :step="step"/>`;
  const defaults = {
    min: -Infinity,
    max: Infinity,
    step: 1,
  };
  return createBasicInput(options, value, $emit, template, defaults);
}

function isNumeric(options) {
  const { outputType } = options;
  return outputType === "number" || outputType === "range";
}

function isOnChange(options) {
  const { outputType } = options;
  switch (outputType) {
    case "select":
    case "radio":
      return true;
    default:
      return false;
  }
}

function isColor(options) {
  const { outputType } = options;
  return outputType === "color";
}

function createBasicInput(
  options,
  value,
  $emit,
  slot = '<input :type="type" :value="value"></input>',
  defaults = {},
  valueOf = valueOfInput
) {
  const { outputType, name, label = name, ...rest } = options;
  const input = fromVue({
    template: `<div style="display: flex; align-items: center">
      <label :style="{
        marginRight: '1rem',
        fontWeight: 'bold'
      }">{{label}}</label>
      ${slot}
    </div>`,
    data: () => ({
      ...defaults,
      ...rest,
      type: outputType,
      value,
      label,
    }),
  });
  const createOnInput = () => (e) => {
    const value = valueOf(e);
    const v = isNumeric(options) ? +value : value;
    $emit("updateValue", options.id, v);
    if (input.$oninput) input.$oninput(e);
  };

  if (isOnChange(options)) {
    input.onchange = createOnInput();
  } else {
    input.oninput = createOnInput();
  }
  return input;
}

function createRangeInput(options, value, $emit) {
  const template = `<input :type="type" :value="value" :min="min" :max="max" :step="step"/>
  <output style="margin-left: 1em;">{{value}}</output>`;
  const defaults = {
    min: -Infinity,
    max: Infinity,
    step: 1,
  };
  const node = createBasicInput(options, value, $emit, template, defaults);
  node.$oninput = (e) => {
    const { value } = e.target;
    const [output] = node.getElementsByTagName("output");
    output.textContent = value;
  };
  return node;
}

function createSelectInput(options, value, $emit) {
  const template = `<select>
    <option v-for="label, index in options.labels" :value="options.values[index]">{{label}}</option>
  </select>`;
  const defaults = {
    options: [],
  };
  const node = createBasicInput(options, value, $emit, template, defaults);
  return node;
}

function createRadioInput(options, value, $emit) {
  const { name } = options;
  const template = `<label v-for="label, index in options.labels" >
    {{label}}
    <input type="radio" name="${name}" :checked="index === 0 ? true: false" :id="options.values[index]"/>
    &ensp;
  </label>`;
  const defaults = {
    options: [],
  };
  const valueOf = (e) => e.target.id;
  const node = createBasicInput(
    options,
    value,
    $emit,
    template,
    defaults,
    valueOf
  );
  return node;
}

function stringify(output) {
  const withFunction = (_, v) => (typeof v === "function" ? `${v}` : v);
  return JSON.stringify(output, withFunction)
    .replaceAll("\\n", "")
    .replaceAll('\\"', '"')
    .replaceAll("\\'", "'");
}

function valueOfInput(e) {
  return e.target.value;
}

function valueOf(options, output) {
  if (output === null) return output;
  if (output === undefined) return undefined;
  if (Array.isArray(output)) return `Array ${stringify(output)}`;
  const type = typeof output;
  if (output instanceof Date) return output;
  if (type === "object") return `Object ${stringify(output)}`;
  if (type === "function") return `f(${options.params.join(",")})`;
  return output;
}
