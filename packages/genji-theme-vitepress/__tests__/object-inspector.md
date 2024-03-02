# Object Inspector

## Number

```js | dom
a = 1;
```

## Boolean

```js | dom
a = true;
```

## Array

```js | dom
a = ["Apple", null, Promise];
```

## Function

```js | dom
function add(x, y) {
  return x + y;
}
```

## Object

```js | dom
a = {
  string: "a",
  add(x, y) {
    return x + y;
  },
  array: ["Apple", null, Promise],
};
```

## Class

```js | dom
display(() => {
  class N {
    add(x, y) {
      return x + y;
    }
    minus(x, y) {
      return x - y;
    }
  }
  return new N();
});
```
