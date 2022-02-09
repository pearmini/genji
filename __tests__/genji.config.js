module.exports = {
  input: "docs",
  output: "dist",
  title: "Genji Notebook",
  logo: "https://s2.loli.net/2022/02/05/QvfOBrE4p6PgRxI.png",
  github: "https://github.com/pearmini/genji-notebook",
  link: "https://github.com/pearmini",
  notFound: {
    title: "Page Not Found",
    description: "We could not find what you were looking for.",
  },
  scripts: ["lib/sparrow.min.js"],
  outline: {
    Introduction: "introduction",
    "Get Started": "",
    Showcase: {
      "Data Visualization": "data-visualization",
      "Render Engine": "",
    },
    "API Reference": "",
  },
  theme: {
    mainColor: "#28DF99",
  },
};
