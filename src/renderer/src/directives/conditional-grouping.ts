import { DirectiveBinding, RendererElement } from 'vue'

export const conditionalGrouping = {
  inserted(el: HTMLElement, binding: DirectiveBinding, vnode: RendererElement) {
    if (binding.value) {
      wrap(el)
    } else {
      unwrap(el)
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    if (binding.value) {
      wrap(el)
    } else {
      unwrap(el)
    }
  }
}

function wrap(el: HTMLElement) {
  const pageNumber = parseInt(el.getAttribute('data-page') || '0', 10)

  if (!pageNumber) {
    return
  }
  const isEvenPage = pageNumber % 2 == 0
  if (!isEvenPage) return
  const previousSibling = el.previousElementSibling
  if (previousSibling && previousSibling.classList.contains('page-container')) {
    const group = document.createElement('div')
    group.classList.add('page-group')

    group.appendChild(previousSibling.cloneNode(true))
    group.appendChild(el.cloneNode(true))

    const parent = previousSibling.parentElement
    if (parent) {
      parent.replaceChild(group, el)
      parent.removeChild(previousSibling)
    }
  }
}

function unwrap(el: HTMLElement) {
  const container = el.querySelector('.page-group')
  if (container) {
    while (container.firstChild) {
      el.insertBefore(container.firstChild, el.firstChild)
    }
    el.removeChild(container)
  }
}
