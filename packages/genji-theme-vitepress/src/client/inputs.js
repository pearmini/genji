import {
  button as _button,
  // checkbox as _checkbox,
  // radio as _radio,
  // toggle as _toggle,
  color as _color,
  // date as _date,
  // datetime as _datetime,
  // fileOf as _fileOf,
  range as _range,
  // number as _number,
  // search as _search,
  // searchFilter as _searchFilter,
  select as _select,
  table as _table,
  text as _text,
  // email as _email,
  // tel as _tel,
  // url as _url,
  // password as _password,
  // textarea as _textarea,
} from "@observablehq/inputs";
import { define } from "./signal";

export function fromElement(element) {
  return define((next, view) => {
    const onInput = () => next(element.value);
    element.addEventListener("input", onInput);
    view(element);
    next(element.value);
    return () => element.removeEventListener("input", onInput);
  });
}

function input(element) {
  return function (...params) {
    return fromElement(element(...params));
  };
}

export const button = input(_button);
export const color = input(_color);
export const range = input(_range);
export const select = input(_select);
export const table = input(_table);
export const text = input(_text);
