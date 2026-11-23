const header = document.querySelector('[data-header]')
const menuToggle = document.querySelector('[data-menu-toggle]')
const navigation = document.querySelector('[data-nav]')
const navigationWheel = document.querySelector('[data-nav-wheel]')
const wheelOrbit = document.querySelector('[data-wheel-orbit]')
const wheelLinks = Array.from(document.querySelectorAll('[data-wheel-link]'))
const wheelGo = document.querySelector('[data-wheel-go]')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 24)
}

function closeMenu() {
  menuToggle?.setAttribute('aria-expanded', 'false')
  menuToggle?.setAttribute('aria-label', 'Open menu')
  navigation?.classList.remove('open')
}

menuToggle?.addEventListener('click', () => {
  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true'
  menuToggle.setAttribute('aria-expanded', String(willOpen))
  menuToggle.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu')
  navigation?.classList.toggle('open', willOpen)
})

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))
window.addEventListener('scroll', updateHeader, { passive: true })
updateHeader()

if (navigationWheel && wheelOrbit && wheelLinks.length) {
  let wheelRotation = 0
  let selectedWheelIndex = 0
  let dragStartAngle = 0
  let dragStartRotation = 0
  let isDraggingWheel = false
  let wheelFrame = 0

  const normalizedAngle = (angle) => ((angle % 360) + 360) % 360
  const shortestAngle = (angle) => ((angle + 540) % 360) - 180

  function pointerAngle(event) {
    const bounds = navigationWheel.getBoundingClientRect()
    const centerX = bounds.left + bounds.width / 2
    const centerY = bounds.top + bounds.width / 2
    return Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI)
  }

  function renderNavigationWheel() {
    wheelFrame = 0
    const size = wheelOrbit.getBoundingClientRect().width
    const radius = size * 0.39

    wheelOrbit.style.setProperty('--wheel-rotation', `${wheelRotation}deg`)

    wheelLinks.forEach((link, index) => {
      const angle = normalizedAngle(index * 90 + wheelRotation)
      const radians = angle * (Math.PI / 180)
      const x = Math.sin(radians) * radius
      const y = -Math.cos(radians) * radius
      link.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
    })

    selectedWheelIndex = ((Math.round(-wheelRotation / 90) % wheelLinks.length) + wheelLinks.length) % wheelLinks.length
    wheelLinks.forEach((link, index) => {
      const isSelected = index === selectedWheelIndex
      link.classList.toggle('is-selected', isSelected)
      if (isSelected) link.setAttribute('aria-current', 'true')
      else link.removeAttribute('aria-current')
    })
  }

  function queueWheelRender() {
    if (!wheelFrame) wheelFrame = window.requestAnimationFrame(renderNavigationWheel)
  }

  function rotateWheelBy(delta) {
    wheelRotation += delta
    queueWheelRender()
  }

  function openSelectedWheelLink() {
    wheelLinks[selectedWheelIndex]?.click()
  }

  navigationWheel.addEventListener('wheel', (event) => {
    event.preventDefault()
    rotateWheelBy(Math.sign(event.deltaY) * 12)
  }, { passive: false })

  navigationWheel.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a, button')) return
    isDraggingWheel = true
    dragStartAngle = pointerAngle(event)
    dragStartRotation = wheelRotation
    navigationWheel.classList.add('is-dragging')
    navigationWheel.setPointerCapture(event.pointerId)
  })

  navigationWheel.addEventListener('pointermove', (event) => {
    if (!isDraggingWheel) return
    wheelRotation = dragStartRotation + shortestAngle(pointerAngle(event) - dragStartAngle)
    queueWheelRender()
  })

  function stopWheelDrag(event) {
    if (!isDraggingWheel) return
    isDraggingWheel = false
    navigationWheel.classList.remove('is-dragging')
    if (navigationWheel.hasPointerCapture(event.pointerId)) navigationWheel.releasePointerCapture(event.pointerId)
    wheelRotation = Math.round(wheelRotation / 90) * 90
    queueWheelRender()
  }

  navigationWheel.addEventListener('pointerup', stopWheelDrag)
  navigationWheel.addEventListener('pointercancel', stopWheelDrag)
  navigationWheel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      rotateWheelBy(-90)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      rotateWheelBy(90)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openSelectedWheelLink()
    }
  })

  wheelGo?.addEventListener('click', openSelectedWheelLink)
  window.addEventListener('resize', queueWheelRender)
  renderNavigationWheel()
}

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear())
})

const currentAge = new Date().getFullYear() - 2004

document.querySelectorAll('[data-age]').forEach((element) => {
  element.textContent = String(currentAge)
})

const letterMotionSelector = [
  'h1',
  'h2',
  'h3',
  'p',
  'dt',
  'dd',
  '.brand',
  '.nav-wheel-link',
  '.button',
  '.passport-document-header > span',
  '.passport-document-footer span',
  '.signal-track span',
  '.stack-group span'
].join(',')

function splitTextIntoLetters(element) {
  const readableText = element.textContent.replace(/\s+/g, ' ').trim()
  if (!readableText || element.closest('svg, [aria-hidden="true"]')) return

  if (!element.hasAttribute('aria-label')) element.setAttribute('aria-label', readableText)

  let letterIndex = 0
  const textNodes = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)

  while (walker.nextNode()) textNodes.push(walker.currentNode)

  textNodes.forEach((textNode) => {
    if (!textNode.nodeValue.trim()) return

    const fragment = document.createDocumentFragment()
    textNode.nodeValue.split(/(\s+)/).forEach((part) => {
      if (!part) return
      if (/^\s+$/.test(part)) {
        if (element.matches('.button')) {
          const space = document.createElement('span')
          space.className = 'letter-space'
          space.setAttribute('aria-hidden', 'true')
          space.textContent = '\u00A0'
          fragment.appendChild(space)
        } else {
          fragment.appendChild(document.createTextNode(' '))
        }
        return
      }

      const word = document.createElement('span')
      word.className = 'letter-word'
      word.setAttribute('aria-hidden', 'true')

      Array.from(part).forEach((letter) => {
        const character = document.createElement('span')
        character.className = 'letter-char'
        character.style.setProperty('--letter-index', String(Math.min(letterIndex, 24)))
        character.textContent = letter
        word.appendChild(character)
        letterIndex += 1
      })

      fragment.appendChild(word)
    })

    textNode.replaceWith(fragment)
  })

  element.classList.add('letter-motion')
}

const letterMotionElements = Array.from(document.querySelectorAll(letterMotionSelector))

if (!reduceMotion) {
  letterMotionElements.forEach(splitTextIntoLetters)

  const showLetters = (element) => {
    element.classList.add('letters-visible')
    window.setTimeout(() => element.classList.add('letters-settled'), 850)
  }

  if ('IntersectionObserver' in window) {
    const letterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        showLetters(entry.target)
        letterObserver.unobserve(entry.target)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -24px' })

    document.querySelectorAll('.letter-motion').forEach((element) => letterObserver.observe(element))
  } else {
    document.querySelectorAll('.letter-motion').forEach(showLetters)
  }
}

const revealElements = document.querySelectorAll('.reveal')

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('visible'))
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' })

  revealElements.forEach((element) => observer.observe(element))
}

const portrait = document.querySelector('[data-tilt]')
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

if (portrait && supportsHover && !reduceMotion) {
  portrait.addEventListener('pointermove', (event) => {
    const bounds = portrait.getBoundingClientRect()
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5
    portrait.style.transform = `perspective(900px) rotateX(${vertical * -3}deg) rotateY(${horizontal * 4}deg) translateY(-3px)`
  })

  portrait.addEventListener('pointerleave', () => {
    portrait.style.transform = ''
  })
}
