/**
 * @description 元素是否滚动到顶边
 * @param {HTMLElement} el 
 */
export const isScrollTop = function (el) {
  return el.scrollTop <= 0
}

/**
 * @description 元素是否滚动到底边
 * @param {HTMLElement} el 
 */
export const isScrollBottom = function (el) {
  return el.scrollHeight <= Math.round(el.scrollTop + el.clientHeight)
}

/**
 * @description 元素是否滚动到左边
 * @param {HTMLElement} el 
 */
export const isScrollLeft = function (el) {
  return el.scrollLeft <= 0
}

/**
 * @description 元素是否滚动到右边
 * @param {HTMLElement} el 
 */
export const isScrollRight = function (el) {
  return el.scrollWidth <= Math.round(el.scrollLeft + el.clientWidth)
}


/**
 * @description 元素是否滚动到某一边
 * @param {HTMLElement} el 
 */
export const isScrollCorner = function (el) {
  const isTop = isScrollTop(el)
  const isLeft = isScrollLeft(el)

  let isCorner = isTop && isLeft
  if (!isCorner) {
    const isRight = isScrollRight(el)
    const isBottom = isScrollBottom(el)
    isCorner = isCorner || (isTop && isRight)
    isCorner = isCorner || (isLeft && isBottom)
    isCorner = isCorner || (isRight && isBottom)
  }

  return isCorner
}