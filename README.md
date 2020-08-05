# sg-scroll简介
> 1、移动端自定义滚动（旨在禁用Wap端浏览器的默认事件）
> 2、粘滞性滚动（旨在解决position:sticky兼容性问题）

# 使用
## npm
npm install sg-scroll

```
import sgScroll from 'sg-scroll'
sgScroll.sgScrollInit()
sgScroll.sgSticky()

<div class="scroll-wrapper" sg-scroll="vertical" sg-sticky="sg-sticky-item">
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
```

## [演示地址](https://www.sghen.cn/vue-test/index.html#/demo/sg-scroll-demo "演示地址")
