# Test5

## Data Flow

```js | dom
(() => {
  const div = document.createElement("div");
  div.innerText = content;
  div.style.background = color;
  div.style.height = `${height}px`;
  return div;
})();
```

```js | text "pin: false"
content = new Promise((resolve) =>
  setTimeout(() => resolve("hello world"), 1000)
);
```

```js | number "pin: false"
height = add(50, 50) + sub(30, 20);
```

```js | color "pin: false"
color = "orange";
```

```js
a = function () {
  const div = document.createElement("div");
  div.innerText = content;
  div.style.background = color;
  div.style.height = `${height}px`;
  return div;
};
```

```js
function add(a, b) {
  return a + b;
}
```

```js
sub = (a, b) => a - b;
```

```js
let b = (a, b) => a - b;
```

```js
+height + 1;
```

## Variable

```js
const array = [1, 2, 3];
```

```js
const object = { name: "Jim", age: 24 };
```

```js
sp;
```

```js
const number = 1;
```

```js
const boolean = true;
```

```js
const nil = null;
```

```js
const empty = undefined;
```

```js
const date = new Date();
```

```js
const foo = (a, b) => a + b;
```

## Inputs

```js | text
inputText = "hello world";
```

```js | number "max: 20; min: 10; step: 2"
inputNumber = 16;
```

```js | range "max: 20; min: 10; step: 2"
inputRange = 16;
```

```js | select "options: { labels: ['A', 'B', 'C'], values: ['a', 'b', 'c'] }"
inputSelect = "a";
```

```js
`select: ${inputSelect}`;
```

```js | radio "options: { labels: ['A', 'B', 'C'], values: ['a', 'b', 'c'] }"
inputRatio = "a";
```

```js
`ratio: ${inputRatio}`;
```

## Table

```js | table "maxCount: 5"
data = [
  { year: "1951 年", sale: 38 },
  { year: "1952 年", sale: 52 },
  { year: "1956 年", sale: 61 },
  { year: "1957 年", sale: 145 },
  { year: "1958 年", sale: 48 },
  { year: "1959 年", sale: 38 },
  { year: "1960 年", sale: 38 },
  { year: "1962 年", sale: 38 },
];
```
