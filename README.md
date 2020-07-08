# sg-scroll简介
> 移动端自定义滚动（旨在禁用Wap端浏览器的默认事件）

# 使用
## npm
npm install sg-scroll

```
import sgScroll from 'sg-scroll'
sgScroll.sgScrollInit()

<div class="scroll-wrapper" sg-scroll="vertical"></div>
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
```

## [演示地址](https://www.sghen.cn/vue-test/index.html#/demo/sg-scroll-demo "演示地址")
