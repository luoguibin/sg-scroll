import { SG_SCROLL_TYPE } from './const'
import { isScrollTop, isScrollRight, isScrollBottom, isScrollLeft } from './util'

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
  const type = SG_SCROLL_TYPE[el.getAttribute('sg-scroll')] || SG_SCROLL_TYPE.vertical
  el._sgScrollType = type

  const suffixNum = type % SG_SCROLL_TYPE.vertical
  el._sgIsScrollStop = suffixNum === 1
  el._sgIsScrollBase = suffixNum === 2
  el._sgIsScrollChange = !el._sgIsScrollBase // 只对base有效

  if (el._sgIsScrollStop) {
    el._sgScrollType -= suffixNum // 归并到常规值
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

    const xCount = Math.ceil(Math.abs(valueX) / 0.8)
    const yCount = Math.ceil(Math.abs(valueY) / 0.8)
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

  // 循环遍历找到最近的可进行滚动的元素，包括自身
  let loopCount = 1
  let tempScrollEl = scrollEl
  while (loopCount && loopCount < 10) {
    // console.log("loopCount=" + loopCount)
    // console.log('1', scrollEl, scrollEl._sgScrollType, scrollEl._sgIsScrollBase, scrollEl._sgIsScrollChange)
    
    // base类型判断
    if (scrollEl._sgIsScrollBase && !scrollEl._sgIsScrollChange) {
      // 检测手势方向
      const isVertical = Math.abs(valueY) > Math.abs(valueX)
      switch (scrollEl._sgScrollType) {
        case SG_SCROLL_TYPE.vertical_base:
          if (isVertical) {
            scrollEl._sgIsScrollChange = true
            scrollEl._sgScrollType = SG_SCROLL_TYPE.vertical
          } else {
            const parentScrollEl = scrollEl.sgGetParentScrollEl()
            if (parentScrollEl) {
              this._sgScrollEl = parentScrollEl
              scrollEl = parentScrollEl
              tempScrollEl = scrollEl
              continue
            } else {
              scrollEl._sgIsScrollChange = true
            }
          }
          break;
        case SG_SCROLL_TYPE.horizontal_base:
          if (!isVertical) {
            scrollEl._sgIsScrollChange = true
            scrollEl._sgScrollType = SG_SCROLL_TYPE.horizontal
          } else {
            const parentScrollEl = scrollEl.sgGetParentScrollEl()
            if (parentScrollEl) {
              this._sgScrollEl = parentScrollEl
              scrollEl = parentScrollEl
              tempScrollEl = scrollEl
              continue
            } else {
              scrollEl._sgIsScrollChange = true
            }
          }
          break;
        case SG_SCROLL_TYPE.normal_base:
          scrollEl._sgIsScrollChange = true
          if (isVertical) {
            scrollEl._sgScrollType = SG_SCROLL_TYPE.vertical
          } else {
            scrollEl._sgScrollType = SG_SCROLL_TYPE.horizontal
          }
          break
        default:
          scrollEl._sgIsScrollChange = true
          scrollEl._sgScrollType = SG_SCROLL_TYPE.vertical
          break;
      }
    }

    // console.log('2', scrollEl, scrollEl._sgScrollType, scrollEl._sgIsScrollBase, scrollEl._sgIsScrollChange)
    // 基础类型判断
    switch (scrollEl._sgScrollType) {
      case SG_SCROLL_TYPE.vertical:
        if (valueY > 0) {
          // 向下拖动
          if (isScrollTop(scrollEl)) {
            const parentScrollEl = scrollEl.sgGetParentScrollEl()
            if (parentScrollEl) {
              this._sgScrollEl = parentScrollEl
              scrollEl = parentScrollEl
              tempScrollEl = scrollEl
              loopCount++
            } else {
              loopCount = 0
            }
          } else {
            loopCount = 0
          }
        } else {
          // 向上拖动
          if (isScrollBottom(scrollEl)) {
            const parentScrollEl = scrollEl.sgGetParentScrollEl()
            if (parentScrollEl) {
              this._sgScrollEl = parentScrollEl
              scrollEl = parentScrollEl
              tempScrollEl = scrollEl
              loopCount++
            } else {
              loopCount = 0
            }
          } else {
            loopCount = 0
          }
        }
        break;
      case SG_SCROLL_TYPE.horizontal:
        if (valueX > 0) {
          // 向右拖动
          if (isScrollLeft(scrollEl)) {
            const parentScrollEl = scrollEl.sgGetParentScrollEl()
            if (parentScrollEl) {
              this._sgScrollEl = parentScrollEl
              scrollEl = parentScrollEl
              tempScrollEl = scrollEl
              loopCount++
            } else {
              loopCount = 0
            }
          } else {
            loopCount = 0
          }
        } else {
          // 向左拖动
          if (isScrollRight(scrollEl)) {
            const parentScrollEl = scrollEl.sgGetParentScrollEl()
            if (parentScrollEl) {
              this._sgScrollEl = parentScrollEl
              scrollEl = parentScrollEl
              tempScrollEl = scrollEl
              loopCount++
            } else {
              loopCount = 0
            }
          } else {
            loopCount = 0
          }
        }
        break;
      case SG_SCROLL_TYPE.normal:
        if (valueX > 0 && valueY > 0) {
          // 左上滚动
          if (isScrollTop(scrollEl) && isScrollLeft(scrollEl)) {
            const parentScrollEl = scrollEl.sgGetParentScrollEl()
            if (parentScrollEl) {
              this._sgScrollEl = parentScrollEl
              scrollEl = parentScrollEl
              tempScrollEl = scrollEl
              loopCount++
            } else {
              loopCount = 0
            }
          } else {
            loopCount = 0
          }
        } else if (valueX > 0 && valueY < 0) {
          // 左下滚动
          if (isScrollBottom(scrollEl) && isScrollLeft(scrollEl)) {
            const parentScrollEl = scrollEl.sgGetParentScrollEl()
            if (parentScrollEl) {
              this._sgScrollEl = parentScrollEl
              scrollEl = parentScrollEl
              tempScrollEl = scrollEl
              loopCount++
            } else {
              loopCount = 0
            }
          } else {
            loopCount = 0
          }
        } else if (valueX < 0 && valueY > 0) {
          // 右上滚动
          if (isScrollTop(scrollEl) && isScrollRight(scrollEl)) {
            const parentScrollEl = scrollEl.sgGetParentScrollEl()
            if (parentScrollEl) {
              this._sgScrollEl = parentScrollEl
              scrollEl = parentScrollEl
              tempScrollEl = scrollEl
              loopCount++
            } else {
              loopCount = 0
            }
          } else {
            loopCount = 0
          }
        } else {
          // 右下滚动
          if (isScrollBottom(scrollEl) && isScrollRight(scrollEl)) {
            const parentScrollEl = scrollEl.sgGetParentScrollEl()
            if (parentScrollEl) {
              this._sgScrollEl = parentScrollEl
              scrollEl = parentScrollEl
              tempScrollEl = scrollEl
              loopCount++
            } else {
              loopCount = 0
            }
          } else {
            loopCount = 0
          }
        }
        break;
      default:
        break;
    }

    // 防止自身循环
    if (tempScrollEl === scrollEl) {
      loopCount = 0
    }
  }

  // 累加滚动值
  switch (scrollEl._sgScrollType) {
    case SG_SCROLL_TYPE.vertical:
      scrollEl.scrollTop -= valueY
      break;
    case SG_SCROLL_TYPE.horizontal:
      scrollEl.scrollLeft -= valueX
      break;
    case SG_SCROLL_TYPE.normal:
      scrollEl.scrollTop -= valueY
      scrollEl.scrollLeft -= valueX
      break;
    default:
      break;
  }
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

const rootTouchMoveEvent = function (e) {
  e.preventDefault()
  return false
}

export default {
  /**
   * @description 全局初始化自定义滚动事件
   */
  init: function () {
    if (rootEl._sgIsScrollInit) {
      return
    }
    rootEl._sgIsScrollInit = true
    // 阻止浏览器所有默认操作
    rootEl.addEventListener(
      'touchmove',
      rootTouchMoveEvent,
      { passive: false }
    )
  
    // 监听滚动的元素
    rootEl.addEventListener('touchstart', touchStartEvent)
    rootEl.addEventListener('touchend', touchEndEvent)
    rootEl.addEventListener('touchcancel', touchEndEvent)
  },

  /**
   * 移除滚动
   */
  release: function() {
    if (!rootEl._sgIsScrollInit) {
      return
    }

    rootEl.removeEventListener(
      'touchmove',
      rootTouchMoveEvent,
      { passive: false }
    )

    // 移除滚动的元素监听
    rootEl.removeEventListener('touchstart', touchStartEvent)
    rootEl.removeEventListener('touchend', touchEndEvent)
    rootEl.removeEventListener('touchcancel', touchEndEvent)
    rootEl._sgIsScrollInit = false
  }
}
