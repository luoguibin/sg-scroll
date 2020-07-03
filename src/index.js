/**
 * 获取最近的滚动元素
 * @param {HTMLElement} el
 */
const getScrollElement = function (el) {
  while (el) {
    if (el.getAttribute('item-type') === 'scroll') {
      break
    }
    el = el.parentElement
  }

  el && initScroll(el)
  return el
}

/**
 * 初始化滚动元素
 */
const initScroll = function (el) {
  if (el._sgIsScrollInit) {
    return
  }
  el._sgIsScrollInit = true

  /**
   * 停止滚动动画
   */
  el.sgStopAnimeScroll = function () {
    if (this._sgScrollTimer) {
      cancelAnimationFrame(this._sgScrollTimer)
      this._sgScrollTimer = null
    }
  }

  /**
   * @description 开始滚动动画
   */
  el.sgStartAnimeScroll = function (valueY) {
    this._sgAnimeUnit = valueY // > 0 ? Math.abs(valueY) : -Math.abs(valueY)
    this._sgAnimeCount = Math.ceil(Math.abs(valueY) / 1)
    this._sgAnimeIndex = 0
    this.sgAnimeLoopStep()
  }

  /**
   * @description 循环滚动动画
   */
  el.sgAnimeLoopStep = function () {
    if (this._sgAnimeIndex < this._sgAnimeCount) {
      this._sgAnimeIndex++
      // 正弦递减
      const ratio = Math.sin(
        ((1 - this._sgAnimeIndex / this._sgAnimeCount) * Math.PI) / 2
      )
      this.scrollTop -= this._sgAnimeUnit * ratio
      this._sgScrollTimer = requestAnimationFrame(() => {
        this.sgAnimeLoopStep()
      })
    } else {
      this._sgScrollTimer = null
    }
  }

  /**
   * 获取父滚动元素
   */
  el.sgGetParentScrollEl = function () {
    return getScrollElement(this.parentElement)
  }
}

/**
 * 触摸开始事件
 * @param {TouchEvent} e
 */
const touchStartEvent = function (e) {
  // 获取最近一个scroll
  const scrollEl = getScrollElement(e.target)
  if (!scrollEl) {
    return
  }
  scrollEl.sgStopAnimeScroll()
  window.addEventListener('touchmove', touchMoveEvent)

  this._sgPreviousTouch = e.touches[0]
  this._sgScrollEl = scrollEl
}

/**
 * 触摸移动事件
 * @param {TouchEvent} e
 */
const touchMoveEvent = function (e) {
  const touch = e.touches[0]
  const valueY = touch.clientY - this._sgPreviousTouch.clientY
  touch.valueY = valueY
  this._sgPreviousTouch = touch

  const scrollEl = this._sgScrollEl
  scrollEl.scrollTop -= valueY
  if (valueY > 0) {
    // 向下拖动
    if (scrollEl.scrollTop === 0) {
      const parentScrollEl = scrollEl.sgGetParentScrollEl()
      if (parentScrollEl) {
        this._sgScrollEl = parentScrollEl
      }
    }
  } else {
    // 向上拖动
    const height = Math.round(scrollEl.scrollTop + scrollEl.clientHeight)
    if (height >= scrollEl.scrollHeight) {
      const parentScrollEl = scrollEl.sgGetParentScrollEl()
      if (parentScrollEl) {
        this._sgScrollEl = parentScrollEl
      }
    }
  }
}

/**
 * 触摸结束事件
 */
const touchEndEvent = function () {
  const scrollEl = this._sgScrollEl
  scrollEl.sgStartAnimeScroll(this._sgPreviousTouch.valueY)
  window.removeEventListener('touchmove', touchMoveEvent)
}

/**
 * @description 全局初始化自定义滚动事件
 */
export default function () {
  if (window._sgIsScrollInit) {
    return
  }
  window._sgIsScrollInit = true
  // 阻止浏览器所有默认操作
  window.addEventListener(
    'touchmove',
    function () {
      return false
    },
    { passive: true }
  )

  // 监听滚动的元素
  window.addEventListener('touchstart', touchStartEvent)
  window.addEventListener('touchend', touchEndEvent)
}
