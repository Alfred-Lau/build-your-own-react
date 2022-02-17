import TianGongReact from "./TianGongReact";
import TianGongReactDOM from './TianGongReact/TIanGongReactDOM'
const trueFlag= true
const falseFlag= false
const nullFlag = null

const ele = <div>hello,world
    {trueFlag && <div>true flag</div>}
    {falseFlag && <div>false flag</div>}
    {nullFlag && <div>null flag</div>}
    <p>我是文本元素</p>
    <input type="text"/>我是表单元素，用来测试 点击事件
    <img src="../public/img.jpg" alt=""/>我是图片元素什么都不测试
    <span>我来测试一个行内元素</span>
    <ul>
        <li>我来测试千淘元素</li>
        <li>我来测试千淘元素</li>
        <li>我来测试千淘元素</li>
    </ul>
</div>;

console.log('vdom',ele);


const container = document.getElementById('app')
TianGongReactDOM.render(ele, container)



