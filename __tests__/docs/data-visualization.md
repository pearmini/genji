# Data Visualization

## Sparrow

```js | dom "pin:false"
sp.plot({
  data: [
    { genre: "Sports", sold: 275 },
    { genre: "Strategy", sold: 115 },
    { genre: "Action", sold: 120 },
    { genre: "Shooter", sold: 350 },
    { genre: "Other", sold: 150 },
  ],
  element: "interval",
  encode: [
    { channel: "x", field: "genre" },
    { channel: "y", field: "sold" },
    { channel: "fill", field: "genre" },
  ],
});
```
