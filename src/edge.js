
/**
 * 获取边框左右圆角的比例值
 * @param {Number} value 
 */
const getRadiusRatio = function(value) {
  return Math.max(Math.min(value * 100, 90), 10)
}

/**
 * 获取边缘元素的高度
 * @param {Number} value 
 */
const getEdgeHeight = function(value) {
  return Math.max(Math.min(Math.abs(value), 100), 0)
}

/**
 * @param {TouchEvent} e
 */
const handleTouchMove = function (e) {
  const touch = e.touches[0];
  this.sgTransFormY += touch.clientY - this.sgTouch.clientY;
  const ratio = getRadiusRatio(touch.clientX / this.clientWidth)
  this.sgTouch = touch;
  const edgeEl = this.sgEdgeElement
  const edgeStyle = edgeEl.style
  const edgeHeight = getEdgeHeight(this.sgTransFormY)
  
  if (this.sgTransFormY > 0 && this.scrollTop === 0) {
    // 下拉
    this.sgTransFormY = edgeHeight
    edgeEl.classList.add('sg-edge-top')
    edgeEl.classList.remove('sg-edge-bottom')
    edgeStyle.height = edgeHeight + 'px'
    edgeStyle.borderRadius = `0% 0% ${100 - ratio}% ${ratio}% / 0 0 100% 100%`
  } else if (this.sgTransFormY < 0 && (this.scrollTop + this.clientHeight + 0.5 >= this.scrollHeight)) {
    // 上拉
    this.sgTransFormY = -edgeHeight
    edgeEl.classList.add('sg-edge-bottom')
    edgeEl.classList.remove('sg-edge-top')
    edgeStyle.height = edgeHeight + 'px'
    edgeStyle.borderRadius = `${ratio}% ${100 - ratio}% 0% 0% / 100% 100% 0 0`
  } else {
    this.sgTransFormY = 0
    edgeStyle.height = '0px'
  }
}

/**
 * 触摸结束
 */
const handleTouchEnd = function () {
  this.sgTransFormY = 0;
  const edgeEl = this.sgEdgeElement
  edgeEl.style.height = this.sgTransFormY + 'px'

  this.removeEventListener("touchmove", handleTouchMove);
}

/**
 * @param {TouchEvent} e
 */
const handleTouchStart = function (e) {
  this.sgTouch = e.touches[0]
  this.sgTransFormY = 0
  this.addEventListener("touchmove", handleTouchMove);
  if (!this.sgEdgeElement) {
    const edgeEl = document.createElement('DIV')
    edgeEl.classList.add('sg-edge')
    this.sgEdgeElement = edgeEl

    // 设置滚动容器的父元素布局定位为relative，并添加边缘元素
    this.parentElement.style.position = 'relative'
    this.parentElement.appendChild(edgeEl)
  }
}

const rootEl = document.body

export default function () {
  if (rootEl._sgIsEdgeInit) {
    return
  }
  rootEl._sgIsEdgeInit = true

  const actionStartEvent = function (e) {
    let scrollEl = e.target
    while(scrollEl) {
      if (scrollEl.hasAttribute("sg-edge")) {
        if (scrollEl._sgIsEdgeInit) {
          return
        }
        scrollEl._sgIsEdgeInit = true
        handleTouchStart.bind(scrollEl)(e)
        scrollEl.addEventListener('touchstart', handleTouchStart)
        scrollEl.addEventListener('touchend', handleTouchEnd)
        break
      }
      scrollEl = scrollEl.parentElement
    }
  }
  rootEl.addEventListener('touchstart', actionStartEvent)
}