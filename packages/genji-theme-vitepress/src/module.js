export class Module {
  constructor() {
    this._variables = [];
  }
  add(code, observer) {
    const node = new Function(`return ${code}`)();
    observer.next(node);
    this._variables.push({ value: node, observer });
  }
  dispose() {
    for (const variable of this._variables) {
      const { value, observer } = variable;
      if (observer.dispose) observer.dispose(value);
    }
    this._variables = [];
  }
}
