# Object Inspector

## Number

```js eval
a = 1;
```

## Boolean

```js eval
a = true;
```

## Array

```js eval
a = ["Apple", null, Promise];
```

## Function

```js eval
function add(x, y) {
  return x + y;
}
```

## Object

```js eval
a = {
  string: "a",
  add(x, y) {
    return x + y;
  },
  array: ["Apple", null, Promise],
};
```

## Class

```js eval
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
