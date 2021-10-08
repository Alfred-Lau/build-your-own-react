/* 
const element = <h1 title="foo">Hello</h1>
const container = document.getElementById("root")
ReactDOM.render(element, container)
*/

let nextUnitOfWork = null;
let wipRoot = null;
let wipFiber = null;
let currentRoot = null;
let deletions = null;
let hookIndex = null;

// 模拟 React 核心类库
const React = {
    createTextElement(text) {
        return {
            type: "TEXT_ELEMENT",
            props: {
                nodeValue: text,
                children: [],
            },
        };
    },
    createElement(type, props, ...children) {
        let element;
        element = {
            type,
            props: {
                ...props,
                children: children.map((child) =>
                    typeof child === "object"
                        ? child
                        : this.createTextElement(child)
                ),
            },
        };
        return element;
    },
};

// 模拟 ReactDOM 浏览器渲染层
const ReactDOM = {
    render(element, container) {
        //   In the render function we set nextUnitOfWork to the root of the fiber tree.
        wipRoot = {
            dom: container,
            props: {
                children: [element],
            },
            alternate: currentRoot,
        };
        deletions = [];
        nextUnitOfWork = wipRoot;
    },
    /**
     *依据fiber渲染dom
     *
     * @param {*} fiber
     */
    createDom(fiber) {
        const dom =
            fiber.type === "TEXT_ELEMENT"
                ? document.createTextNode("")
                : document.createElement(fiber.type);
        // 过滤children,只留下 props
        this.updateDom(dom, {}, fiber.props);
        return dom;
    },

    updateDom(dom, prevProps, nextProps) {
        // TODO: update dom
        const isEvent = (key) => key.startsWith("on");
        const isProperty = (key) => key !== "children" && !isEvent(key);
        const isNew = (prev, next) => (key) => prev[key] !== next[key];
        const isGone = (prev, next) => (key) => !(key in next);
        //Remove old or changed event listeners
        Object.keys(prevProps)
            .filter(isEvent)
            .filter(
                (key) => !(key in nextProps) || isNew(prevProps, nextProps)(key)
            )
            .forEach((name) => {
                const eventType = name.toLowerCase().substring(2);
                dom.removeEventListener(eventType, prevProps[name]);
            });
        // Remove old properties

        Object.keys(prevProps)
            .filter(isProperty)
            .filter(isGone(prevProps, nextProps))
            .forEach((name) => {
                dom[name] = "";
            });
        // Set new or changed properties
        Object.keys(nextProps)
            .filter(isProperty)
            .filter(isNew(prevProps, nextProps))
            .forEach((name) => {
                dom[name] = nextProps[name];
            });
        // Add event listeners
        Object.keys(nextProps)
            .filter(isEvent)
            .filter(isNew(prevProps, nextProps))
            .forEach((name) => {
                const eventType = name.toLowerCase().substring(2);
                dom.addEventListener(eventType, nextProps[name]);
            });
    },
    commitRoot() {
        // TODO: add nodes to dom
        deletions.forEach(this.commitWork);
        this.commitWork(wipRoot.child);
        currentRoot = wipRoot;
        wipRoot = null;
    },

    commitWork(fiber) {
        if (!fiber) {
            return;
        }
        let domParentFiber = fiber.parent;
        while (!domParentFiber.dom) {
            domParentFiber = domParentFiber.parent;
        }
        const domParent = domParentFiber.dom;
        // domParent.appendChild(fiber.dom);
        if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
            domParent.appendChild(fiber.dom);
        } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
            this.updateDom(fiber.dom, fiber.alternate.props, fiber.props);
        } else if (fiber.effectTag === "DELETION") {
            this.commitDeletion(fiber, domParent);
        }
        this.commitWork(fiber.child);
        this.commitWork(fiber.sibling);
    },
    commitDeletion(fiber, domParent) {
        if (fiber.dom) {
            domParent.removeChild(fiber.dom);
        } else {
            this.commitDeletion(fiber.child, domParent);
        }
    },

    updateFunctionComponent(fiber) {
        // TODO
        wipFiber = fiber;
        hookIndex = 0;
        wipFiber.hooks = [];
        const children = [fiber.type(fiber.props)];
        this.reconcileChildren(fiber, children);
    },
    updateHostComponent(fiber) {
        if (!fiber.dom) {
            fiber.dom = this.createDom(fiber);
        }
        this.reconcileChildren(fiber, fiber.props.children);
    },

    /**
     *diff 算法：we will reconcile the old fibers with the new elements.
     *
     * @param {*} wipFiber
     * @param {*} elements
     */
    reconcileChildren(wipFiber, elements) {
        let index = 0;
        let prevSibling = null;
        let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

        while (index < elements.length || oldFiber != null) {
            const element = elements[index];
            let newFiber = null;

            const sameType =
                oldFiber && element && element.type === oldFiber.type;
            if (sameType) {
                // TODO update the node
                newFiber = {
                    type: oldFiber.type,
                    props: element.props,
                    dom: oldFiber.dom,
                    parent: wipFiber,
                    alternate: oldFiber,
                    effectTag: "UPDATE",
                };
            }
            if (element && !sameType) {
                // TODO add this node
                newFiber = {
                    type: element.type,
                    props: element.props,
                    dom: null,
                    parent: wipFiber,
                    alternate: null,
                    effectTag: "PLACEMENT",
                };
            }
            if (oldFiber && !sameType) {
                // TODO delete the oldFiber's node
                oldFiber.effectTag = "DELETION";
                deletions.push(oldFiber);
            }

            if (oldFiber) {
                oldFiber = oldFiber.sibling;
            }

            if (index === 0) {
                wipFiber.child = newFiber;
            } else {
                prevSibling.sibling = newFiber;
            }

            prevSibling = newFiber;
            index++;
        }
    },
    /* hooks */
    useState(initial) {
        const oldHook =
            wipFiber.alternate &&
            wipFiber.alternate.hooks &&
            wipFiber.alternate.hooks[hookIndex];
        const hook = {
            state: oldHook ? oldHook.state : initial,
            queue: [],
        };
        const actions = oldHook ? oldHook.queue : [];
        actions.forEach((action) => {
            hook.state = action(hook.state);
        });
        const setState = (action) => {
            hook.queue.push(action);
            wipRoot = {
                dom: currentRoot.dom,
                props: currentRoot.props,
                alternate: currentRoot,
            };
            nextUnitOfWork = wipRoot;
            deletions = [];
        };
        wipFiber.hooks.push(hook);
        hookIndex++;
        return [hook.state, setState];
    },
};

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        ReactDOM.commitRoot();
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
function performUnitOfWork(fiber) {
    // TODO add dom node

    // TODO create new fibers

    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) {
        ReactDOM.updateFunctionComponent(fiber);
    } else {
        ReactDOM.updateHostComponent(fiber);
    }
    // TODO return next unit of work

    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

// version 01
/** @jsx React.createElement */
/* const element = (
    <div style="background: salmon">
        <h1>Hello World</h1>
        <h2 style="text-align:right">from Didact</h2>
        <div>
            我需要深度试用一下<span style="color: #fff">测试一下功能</span>
        </div>
    </div>
);
const container = document.getElementById("root");
ReactDOM.render(element, container);
 */

// version 02
/** @jsx React.createElement */
/* const container = document.getElementById("root");
const updateValue = (e) => {
    draw(e.target.value);
};

const draw = (value) => {
    const element = (
        <div>
            <input onInput={updateValue} value={value} />
            <h2>Hello {value}</h2>
        </div>
    );
    ReactDOM.render(element, container);
};

draw("world");
 */

// version 03 functional component

/** @jsx React.createElement */
/* function App(props) {
    return <h1>Hi {props.name}</h1>;
}
const element = <App name="foo" />;
const container = document.getElementById("root");
ReactDOM.render(element, container);
 */

// version 04 hooks

/** @jsx React.createElement */
function Counter() {
    const [state, setState] = ReactDOM.useState(1);
    return <h1 onClick={() => setState((c) => c + 1)}>Count: {state}</h1>;
}
const element = <Counter />;
const container = document.getElementById("root");
ReactDOM.render(element, container);
