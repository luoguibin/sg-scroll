# sg-scroll简介
> 1、移动端自定义滚动（旨在禁用Wap端浏览器的默认事件）
> 2、粘滞性滚动（旨在解决position:sticky兼容性问题）
> 3、滚动边缘效果

# 使用
## npm
npm install sg-scroll

```
import { sgScroll, sgSticky, sgEdge } from 'sg-scroll'
sgScroll.init() // 可调用sgScroll.release()释放滚动
sgSticky.init()
sgEdge.init() // 需要导入目录下的/style/edge.css样式文件

<div class="scroll-wrapper" sg-scroll="vertical" sg-sticky="sg-sticky-item" sg-edge>
    <div class="sg-sticky-item">我是sticky元素</div>
    <p style="height: 300px;">a long long long long text...</p>
    <div class="sg-sticky-item">我是sticky元素</div>
    <p style="height: 300px;">a long long long long text...</p>
</div>
```
```
sg-scroll可选值：
    vertical
    vertical_stop
    vertical_base
    horizontal
    horizontal_stop
    horizontal_base
    normal
    normal_stop
    normal_base

    其中stop表示子节点滚动完后不可冒泡至父元素滚动
    base表示根据当前手势方式，判断是否进行当前滚动还是进入父级滚动

sg-sticky：固定值sg-sticky-item，用于收集需要粘滞的滚动元素，所以需要在对应粘滞元素添加sg-sticky-item样式类;
    同时滚动容器的父容器布局定位自动设置为relative

sg-edge可选值：
    vertical
    horizontal
    normal

    其父容器布局定位自动设置为relative
```

## [演示地址](https://www.sghen.cn/vue-test/index.html#/demo/sg-scroll-demo "演示地址")
