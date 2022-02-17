function createTextNode(node) {
    return document.createTextNode(node)

}

function createNativeElement(node) {
    const {type} = node
    return document.createElement(type, {})

}

/**
 * vdom 挂载到 真实dom
 * @param compoent
 * @param container
 * @param callback
 */
function render(component, container, callback) {
    console.log('render', component, container, callback)
    // 原生挂载
    const root = createNativeElement(component)

    // 【递归调用】 ，创建子节点
    component.children.map(child => {
        if (child.type === 'text'){
            return createTextNode(child)
        }
    })

    // 组件挂载

    console.log('root', root)

    container.appendChild(root)

}


export default {render}
