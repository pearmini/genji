import { createTheme } from "../../../src";

function display(fn) {
  return fn();
}

const Theme = createTheme({
  global: { display },
});

export default {
  extends: Theme,
};
