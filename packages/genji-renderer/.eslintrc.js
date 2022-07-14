module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    quotes: [2, "double"],
    "import/prefer-default-export": 0,
    "import/no-extraneous-dependencies": 0,
    "no-param-reassign": 0,
    "no-new-func": 0,
    "no-shadow": 0,
    "no-unused-vars": 1,
  },
};
