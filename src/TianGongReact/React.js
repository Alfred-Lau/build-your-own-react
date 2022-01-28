function createElement(element, props, callback) {
  return { type: "div" };
}

function useState(state) {
  function setState(nextState) {}
  return [state, setState];
}

const React = {
  createElement,
  useState,
};

export default React;
