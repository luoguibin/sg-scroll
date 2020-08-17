/**
 * @param {Event} e
 */
const sgScroll = function ({ target }) {
  // 判断滚动容器的top内边距是否缓存
  if (target.sgPaddingTop === undefined) {
    target.sgPaddingTop =
      parseInt(getComputedStyle(target).paddingTop) || 0;
  }
  const paddingTop = target.sgPaddingTop;
  const scrollTop = target.scrollTop;

  // 暂不考虑一开始设置到滚动容器的内联样式
  target.style.paddingTop = "";

  // 重置元素的内联样式
  let stickyEl = target.sgStickyEl;
  if (stickyEl) {
    stickyEl.style.width = "";
    stickyEl.style.position = "";
    stickyEl.style.top = "";
    stickyEl.classList.remove("sg-sticking");
  }

  // 获取所有能够粘滞的元素
  const children = [...target.children].filter((el) => {
    return el.classList.contains("sg-sticky-item");
  });

  // 找到最后一个产生粘滞的元素
  let index = -1;
  for (let i = children.length - 1; i >= 0; i--) {
    if (children[i].offsetTop - scrollTop < paddingTop) {
      index = i;
      break;
    }
  }
  if (index === -1) {
    return;
  }

  stickyEl = children[index];
  const stickyClientHeight = stickyEl.clientHeight;

  // 判断下一个即将粘滞的元素，用于粘滞元素过渡计算
  const nextIndex = index + 1;
  let nextPadding = 0;
  if (nextIndex < children.length) {
    const offset = children[nextIndex].offsetTop - scrollTop - paddingTop;
    if (offset < stickyClientHeight) {
      nextPadding = stickyClientHeight - offset;
    }
  }

  // 先获取高度后再设置定位
  stickyEl.style.width = stickyEl.clientWidth + "px";
  stickyEl.style.position = "absolute";
  // stickyEl.style.top = paddingTop + scrollTop - nextPadding + "px";
  stickyEl.style.top = paddingTop - nextPadding + "px";
  stickyEl.classList.add("sg-sticking");
  target.sgStickyEl = stickyEl;

  // 判断缓存元素的上下间隔
  if (target.sgStickElMargin === undefined) {
    const style = getComputedStyle(stickyEl);
    target.sgStickElMargin =
      parseInt(style.marginTop) + parseInt(style.marginBottom);
  }

  // 设置滚动容器的top边距
  target.style.paddingTop =
    paddingTop + stickyClientHeight + target.sgStickElMargin + "px";
}

const rootEl = document.body

export default {
  init: function () {
    if (rootEl._sgIsStickyInit) {
      return
    }
    rootEl._sgIsStickyInit = true
  
    const actionStartEvent = function (e) {
      let scrollEl = e.target
      while(scrollEl) {
        if (scrollEl.getAttribute("sg-sticky") === "sg-sticky-item") {
          if (scrollEl._sgIsStickyInit) {
            return
          }
          scrollEl._sgIsStickyInit = true
          scrollEl.parentElement.style.position = 'relative'
          scrollEl.addEventListener('scroll', sgScroll)
          break
        }
        scrollEl = scrollEl.parentElement
      }
    }
    rootEl.addEventListener('touchstart', actionStartEvent)
    rootEl.addEventListener('mousedown', actionStartEvent)
  }
}