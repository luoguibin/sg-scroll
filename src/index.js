import { SG_SCROLL_TYPE } from './const'
import { isScrollTop, isScrollRight, isScrollBottom, isScrollLeft, isScrollCorner } from './util'

/**
 * 获取最近的滚动元素
 * @param {HTMLElement} el
 */
const getScrollElement = function (el) {
  while (el) {
    if (el.hasAttribute('sg-scroll')) {
      break
    }
    el = el.parentElement
  }

  el && initScroll(el)
  return el
}

/**
 * 重置元素的滚动类型
 * @param {HTMLElement} el
 */
const resetScrollType = function (el) {
  const typeKey = el.getAttribute('sg-scroll') || 'vertical'
  const type = SG_SCROLL_TYPE[typeKey] || SG_SCROLL_TYPE.vertical
  el._sgScrollType = type

  const suffixNum = type % SG_SCROLL_TYPE.vertical
  el._sgIsScrollStop = suffixNum === 1
  el._sgIsScrollBase = suffixNum === 2
  if (el._sgIsScrollStop) {
    // 归并到常规值
    el._sgScrollType -= suffixNum
  }
  if (el._sgIsScrollBase) {
    el._sgIsScrollChange = false
  }
}

/**
 * 初始化滚动元素
 */
const initScroll = function (el) {
  resetScrollType(el)
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
  el.sgStartAnimeScroll = function (valueX, valueY) {
    this._sgAnimeUnit = { valueX, valueY }

    const xCount = Math.ceil(Math.abs(valueX) / 1)
    const yCount = Math.ceil(Math.abs(valueY) / 1)
    switch (this._sgScrollType) {
      case SG_SCROLL_TYPE.vertical:
        this._sgAnimeCount = yCount
        break;
      case SG_SCROLL_TYPE.horizontal:
        this._sgAnimeCount = xCount
        break
      case SG_SCROLL_TYPE.normal:
        this._sgAnimeCount = Math.max(xCount, yCount)
        break
      default:
        break;
    }

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
      const { valueX, valueY } = this._sgAnimeUnit
      switch (this._sgScrollType) {
        case SG_SCROLL_TYPE.vertical:
          this.scrollTop -= valueY * ratio
          break;
        case SG_SCROLL_TYPE.horizontal:
          this.scrollLeft -= valueX * ratio
          break
        case SG_SCROLL_TYPE.normal:
          this.scrollLeft -= valueX * ratio
          this.scrollTop -= valueY * ratio
          break
        default:
          break;
      }
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
    if (this._sgIsScrollStop) {
      return null
    }
    return getScrollElement(this.parentElement)
  }
}

const rootEl = document.body

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
  rootEl.addEventListener('touchmove', touchMoveEvent)

  this._sgPreviousTouch = e.touches[0]
  this._sgScrollEl = scrollEl
}

/**
 * 触摸移动事件
 * @param {TouchEvent} e
 */
const touchMoveEvent = function (e) {
  let scrollEl = this._sgScrollEl
  if (!scrollEl) {
    return
  }

  const touch = e.touches[0]
  const valueX = touch.clientX - this._sgPreviousTouch.clientX
  const valueY = touch.clientY - this._sgPreviousTouch.clientY
  touch.valueX = valueX
  touch.valueY = valueY
  this._sgPreviousTouch = touch

  if (scrollEl._sgIsScrollBase && !scrollEl._sgIsScrollChange) {
    // 检测手势方向
    const isVertical = Math.abs(valueY) > Math.abs(valueX)
    switch (scrollEl._sgScrollType) {
      case SG_SCROLL_TYPE.vertical_base:
        if (isVertical) {
          scrollEl._sgScrollType = SG_SCROLL_TYPE.vertical
          scrollEl._sgIsScrollChange = true
        } else {
          const parentScrollEl = scrollEl.sgGetParentScrollEl()
          if (parentScrollEl) {
            this._sgScrollEl = parentScrollEl
            scrollEl = parentScrollEl
          }
        }
        break;
      case SG_SCROLL_TYPE.horizontal_base:
        if (!isVertical) {
          scrollEl._sgScrollType = SG_SCROLL_TYPE.horizontal
          scrollEl._sgIsScrollChange = true
        } else {
          const parentScrollEl = scrollEl.sgGetParentScrollEl()
          if (parentScrollEl) {
            this._sgScrollEl = parentScrollEl
            scrollEl = parentScrollEl
          }
        }

        break;
      default:
        break;
    }
  }

  switch (scrollEl._sgScrollType) {
    case SG_SCROLL_TYPE.vertical:
      if (valueY > 0) {
        // 向下拖动
        if (isScrollTop(scrollEl)) {
          const parentScrollEl = scrollEl.sgGetParentScrollEl()
          if (parentScrollEl) {
            this._sgScrollEl = parentScrollEl
            scrollEl = parentScrollEl
          }
        }
      } else {
        // 向上拖动
        if (isScrollBottom(scrollEl)) {
          const parentScrollEl = scrollEl.sgGetParentScrollEl()
          if (parentScrollEl) {
            this._sgScrollEl = parentScrollEl
            scrollEl = parentScrollEl
          }
        }
      }
      scrollEl.scrollTop -= valueY
      break;
    case SG_SCROLL_TYPE.horizontal:
      if (valueX > 0) {
        // 向右拖动
        if (isScrollLeft(scrollEl)) {
          const parentScrollEl = scrollEl.sgGetParentScrollEl()
          if (parentScrollEl) {
            this._sgScrollEl = parentScrollEl
          }
        }
      } else {
        // 向左拖动
        if (isScrollRight(scrollEl)) {
          const parentScrollEl = scrollEl.sgGetParentScrollEl()
          if (parentScrollEl) {
            this._sgScrollEl = parentScrollEl
          }
        }
      }
      scrollEl.scrollLeft -= valueX
      break;
    case SG_SCROLL_TYPE.normal:
      if (isScrollCorner(scrollEl)) {
        const parentScrollEl = scrollEl.sgGetParentScrollEl()
        if (parentScrollEl) {
          this._sgScrollEl = parentScrollEl
          scrollEl = parentScrollEl
        }
      }
      scrollEl.scrollTop -= valueY
      scrollEl.scrollLeft -= valueX
      break;
    default:
      break;
  }

  const event = document.createEvent('Event');
  // 定义事件名称myEvent
  event.initEvent('sgScroll', true, true);
  scrollEl.dispatchEvent(event)
}

/**
 * 触摸结束事件
 */
const touchEndEvent = function () {
  if (!this._sgScrollEl) {
    return
  }
  const { valueX, valueY } = this._sgPreviousTouch
  this._sgScrollEl.sgStartAnimeScroll(valueX, valueY)
  this._sgScrollEl = null
  rootEl.removeEventListener('touchmove', touchMoveEvent)
}

/**
 * @description 全局初始化自定义滚动事件
 */
export default function () {
  if (rootEl._sgIsScrollInit) {
    return
  }
  rootEl._sgIsScrollInit = true
  // 阻止浏览器所有默认操作
  rootEl.addEventListener(
    'touchmove',
    function (e) {
      e.preventDefault()
      return false
    },
    { passive: false }
  )

  // 监听滚动的元素
  rootEl.addEventListener('touchstart', touchStartEvent)
  rootEl.addEventListener('touchend', touchEndEvent)
}
