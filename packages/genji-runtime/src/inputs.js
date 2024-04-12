import {
  button as _button,
  radio as _radio,
  toggle as _toggle,
  color as _color,
  range as _range,
  search as _search,
  select as _select,
  table as _table,
  text as _text,
  // TODO
  // checkbox as _checkbox,
  // date as _date,
  // datetime as _datetime,
  // fileOf as _fileOf,
  // number as _number,
  // searchFilter as _searchFilter,
  // email as _email,
  // tel as _tel,
  // url as _url,
  // password as _password,
  // textarea as _textarea,
} from "@observablehq/inputs";
import Signal from "./signal.js";

export function fromElement(element) {
  return new Signal((next, view) => {
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
export const radio = input(_radio);
export const search = input(_search);
export const toggle = input(_toggle);
