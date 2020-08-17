
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
  return Math.max(Math.min(Math.abs(value), 42), 0)
}

/**
 * @param {TouchEvent} e
 */
const handleTouchMove = function (e) {
  const touch = e.touches[0];
  const yRatio = getRadiusRatio(touch.clientX / this.clientWidth)
  const xRatio = 100 - getRadiusRatio(touch.clientY / this.clientHeight)

  this.sgTransFormY += touch.clientY - this.sgTouch.clientY;
  this.sgTransFormX += touch.clientX - this.sgTouch.clientX;
  this.sgTouch = touch;

  const yEdgeEl = this.sgYEdgeElement
  const yEdgeStyle = yEdgeEl.style
  const edgeHeight = getEdgeHeight(this.sgTransFormY)

  const xEdgeEl = this.sgXEdgeElement
  const xEdgeStyle = xEdgeEl.style
  const edgeWidth = getEdgeHeight(this.sgTransFormX)
  
  const edgeType = this.sgEdgeType
  if (edgeType & 1) {
    if (this.sgTransFormY > 0 && this.scrollTop === 0) {
      // 下拉
      this.sgTransFormY = edgeHeight
      yEdgeEl.classList.add('sg-edge-top')
      yEdgeEl.classList.remove('sg-edge-bottom')
      yEdgeStyle.height = edgeHeight + 'px'
      yEdgeStyle.borderRadius = `0% 0% ${100 - yRatio}% ${yRatio}% / 0 0 100% 100%`
    } else if (this.sgTransFormY < 0 && (this.scrollTop + this.clientHeight + 0.5 >= this.scrollHeight)) {
      // 上拉
      this.sgTransFormY = -edgeHeight
      yEdgeEl.classList.add('sg-edge-bottom')
      yEdgeEl.classList.remove('sg-edge-top')
      yEdgeStyle.height = edgeHeight + 'px'
      yEdgeStyle.borderRadius = `${yRatio}% ${100 - yRatio}% 0% 0% / 100% 100% 0 0`
    } else {
      this.sgTransFormY = 0
      yEdgeStyle.height = '0px'
    }
  }

  if (edgeType & 2) {
    if (this.sgTransFormX > 0 && this.scrollLeft === 0) {
      // 左拉
      this.sgTransFormX = edgeWidth
      xEdgeEl.classList.add('sg-edge-left')
      xEdgeEl.classList.remove('sg-edge-right')
      xEdgeStyle.width = edgeWidth + 'px'
      xEdgeStyle.borderRadius = `0 100% 100% 0 / 0% ${100 - xRatio}% ${xRatio}% 0%`
    } else if (this.sgTransFormX < 0 && (this.scrollLeft + this.clientWidth + 0.5 >= this.scrollWidth)) {
      // 右拉
      this.sgTransFormX = -edgeWidth
      xEdgeEl.classList.add('sg-edge-right')
      xEdgeEl.classList.remove('sg-edge-left')
      xEdgeStyle.width = edgeWidth + 'px'
      xEdgeStyle.borderRadius = `100% 0 0 100% / ${xRatio}% 0% 0% ${100 - xRatio}%`
    } else {
      this.sgTransFormX = 0
      xEdgeStyle.width = '0px'
    }
  }
}

/**
 * 触摸结束
 */
const handleTouchEnd = function () {
  this.sgTransFormY = 0;
  this.sgTransFormX = 0
  this.sgYEdgeElement.style.height = this.sgTransFormY + 'px'
  this.sgXEdgeElement.style.width = this.sgTransFormX + 'px'

  this.removeEventListener("touchmove", handleTouchMove);
}

/**
 * @param {TouchEvent} e
 */
const handleTouchStart = function (e) {
  this.sgTouch = e.touches[0]
  this.sgTransFormY = 0
  this.sgTransFormX = 0
  this.addEventListener("touchmove", handleTouchMove);
  if (!this.sgYEdgeElement) {
    const yEdgeEl = document.createElement('DIV')
    yEdgeEl.classList.add('sg-edge', 'sg-edge-column')
    this.sgYEdgeElement = yEdgeEl

    const xEdgeEl = document.createElement('DIV')
    xEdgeEl.classList.add('sg-edge', 'sg-edge-row')
    this.sgXEdgeElement = xEdgeEl

    // 设置滚动容器的父元素布局定位为relative，并添加边缘元素
    this.parentElement.style.position = 'relative'
    this.parentElement.appendChild(yEdgeEl)
    this.parentElement.appendChild(xEdgeEl)
  }
}

const rootEl = document.body
const EDGE_TYPE = {
  vertical: 1,
  horizontal: 2,
  normal: 3
}

export default {
  init: function () {
    if (rootEl._sgIsEdgeInit) {
      return
    }
    rootEl._sgIsEdgeInit = true
  
    const actionStartEvent = function (e) {
      let scrollEl = e.target
      while(scrollEl) {
        if (scrollEl.hasAttribute("sg-edge")) {
          const edgeType = EDGE_TYPE[scrollEl.getAttribute("sg-edge")] || EDGE_TYPE.vertical
          scrollEl.sgEdgeType = edgeType
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
}