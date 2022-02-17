// TODO: 注意：此处使用的应该是 对于 ...children 的剩余操作符号，用来搜集所有的子项元素，不能直接使用 children，那样只能拿到第一个
/**
 *
 * @param type 元素类型
 * @param props 元素属性
 * @param children 子元素数组
 * @returns {{children: *[], type, props}}
 */
function createElement(type, props, ...children) {
  const childrenElements  =[].concat(...children).reduce((result, child)=>{
  if (child !== false && child !== true && child !== null){
    if (child instanceof Object){
      result.push(child)
    }else{
      result.push(createElement('text', {textContent: child}))
    }
    }
return result
  },[])

  return { type, props , children:childrenElements};
}

export default {
  createElement,
};
