// 注意：此处使用的应该是 对于 ...children 的剩余操作符号，用来搜集所有的子项元素，不能直接使用 children，那样只能拿到第一个
function createElement(element, props, ...children) {
  return { element, props , children};
}

export default {
  createElement,
};
