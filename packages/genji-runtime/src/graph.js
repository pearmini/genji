import Signal from "./signal.js";

export const SCRIPT_PREFIX = "cell";

function lines(...L) {
  return L.join(`\n`);
}

// Adds an edge n1 -> n2 for every cell n2 that reads the variable declared by n1.
export function createGraph(nodes) {
  const relationById = new Map(nodes.map((n) => [n.id, { from: [], to: [] }]));
  for (const n2 of nodes) {
    for (const n1 of nodes) {
      if (n1 === n2 || n1.name === undefined || !n2.deps.includes(n1.name)) continue;
      relationById.get(n1.id).to.push(n2.id);
      relationById.get(n2.id).from.push(n1.id);
    }
  }
  return relationById;
}

function isCircular(relationById, id) {
  const relation = relationById.get(id);
  const { from, to } = relation;
  return from.some((id) => to.includes(id));
}

export function leavesOf(relationById) {
  return Array.from(relationById.entries())
    .filter(([, d]) => {
      const { from } = d;
      if (from.length === 0) return true;
      if (from.every((d) => isCircular(relationById, d))) return true;
      return false;
    })
    .map(([id]) => id);
}

function execute(id, nodeById, relationById, valueById, countById, disposeById, idByName, hooks) {
  const { loading, success: _success, error } = hooks;

  const node = nodeById.get(id);

  const { expression, name } = node;

  if (name !== undefined && idByName.get(name) !== id) {
    error(new SyntaxError(`Identifier ${name} has already been declared.`), node);
    return;
  }

  const relation = relationById.get(id);
  const { from, to } = relation;
  const names = from.map((id) => nodeById.get(id).name);
  const deps = from.map((id) => valueById.get(id));

  for (const fromId of from) {
    const { from: fromIds } = relationById.get(fromId);
    if (fromIds.includes(id)) {
      error(new SyntaxError(`Circular dependency detected.`), node);
      return;
    }
  }

  const executeDeps = () => {
    for (const toId of to) {
      const count = countById.get(toId);
      if (count - 1 <= 0) {
        countById.set(toId, 0);
        execute(toId, nodeById, relationById, valueById, countById, disposeById, idByName, hooks);
      } else {
        countById.set(toId, count - 1);
      }
    }
  };

  const next = (values) => {
    let dispose = () => {};
    const unsubscribe = (callback) => (dispose = callback);

    let output;
    try {
      const e = expression === "" ? "undefined" : expression;
      output = new Function(
        "unsubscribe",
        ...names,
        lines(`const value = ${e}`, `return value //# sourceURL=${SCRIPT_PREFIX}-${id}.js`),
      )(unsubscribe, ...values);
    } catch (e) {
      error(e, node);
      return;
    }

    const success = (node) => _success(node, { names, values, value: valueById.get(id) });

    if (output instanceof Signal) {
      try {
        let resolved = false;

        // Make sure next is called after view is called.
        const next = (value) => {
          setTimeout(() => {
            // If a node is mounted, there is new need to update the node.
            if (resolved) {
              setTimeout(() => {
                valueById.set(id, value);
                executeDeps();
              }, 0);
            } else {
              valueById.set(id, value);
              executeDeps();
              success(node);
            }
          }, 0);
        };

        const view = (value) => {
          resolved = true;
          valueById.set(id, value);
          success(node);
        };

        const subscription = output.subscribe(next, view);

        const prevDispose = disposeById.get(id);
        prevDispose && prevDispose();

        dispose = () => subscription.unsubscribe();
        disposeById.set(id, dispose);
      } catch (e) {
        error(e, node);
        return;
      }
    } else {
      if (output instanceof Promise) loading(node);

      const promise = Promise.resolve(output).then((value) => {
        const prevDispose = disposeById.get(id);
        prevDispose && prevDispose();

        valueById.set(id, value);
        disposeById.set(id, dispose);
        success(node);
        return Promise.resolve(value);
      });

      // Keep the stored promise rejected, so dependents fail with the same error
      // instead of running with undefined.
      promise.catch((e) => error(e, node));

      valueById.set(id, promise);
      executeDeps();
    }
  };

  if (deps.some((d) => d instanceof Promise)) {
    loading(node);
    Promise.all(deps)
      .then((values) => next(values))
      .catch((e) => error(e, node));
  } else {
    next(deps);
  }
}

// Runs the variables in dependency order and reports each cell through the
// hooks: loading(node), success(node, { names, values, value }) and
// error(error, node). Disposers of signals and unsubscribe callbacks are
// stored in disposeById. Returns the dependency graph.
export function run(variables, { disposeById = new Map(), loading = () => {}, success = () => {}, error = () => {} }) {
  const relationById = createGraph(variables);
  const nodeById = new Map(variables.map((d) => [d.id, d]));
  const valueById = new Map(variables.map((d) => [d.id, undefined]));
  const countById = new Map(variables.map((d) => [d.id, relationById.get(d.id).from.length]));
  const idByName = new Map();
  for (const { name, id } of variables) {
    if (!idByName.has(name) && name !== undefined) idByName.set(name, id);
  }

  for (const root of leavesOf(relationById)) {
    execute(root, nodeById, relationById, valueById, countById, disposeById, idByName, {
      loading,
      success,
      error,
    });
  }

  return relationById;
}
