const navigationWheel = document.querySelector('[data-nav-wheel]')
const wheelOrbit = document.querySelector('[data-wheel-orbit]')
const wheelLinks = Array.from(document.querySelectorAll('[data-wheel-link]'))
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (navigationWheel && wheelOrbit && wheelLinks.length) {
  const wheelSections = wheelLinks.map((link) => document.querySelector(link.getAttribute('href')))
  const wheelStep = 360 / wheelLinks.length
  let wheelRotation = 270
  let selectedWheelIndex = 0
  let wheelFrame = 0
  let wheelScrollLocked = false

  const normalizedAngle = (angle) => ((angle % 360) + 360) % 360
  const shortestAngle = (angle) => ((angle + 540) % 360) - 180

  function renderNavigationWheel() {
    wheelFrame = 0
    const bounds = wheelOrbit.getBoundingClientRect()
    const radiusX = bounds.width * 0.46
    const radiusY = bounds.height * 0.36

    wheelLinks.forEach((link, index) => {
      const angle = normalizedAngle(index * wheelStep + wheelRotation)
      const radians = angle * (Math.PI / 180)
      const x = Math.sin(radians) * radiusX - 8
      const y = -Math.cos(radians) * radiusY
      link.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
      const isSelected = index === selectedWheelIndex
      link.classList.toggle('is-selected', isSelected)
      if (isSelected) link.setAttribute('aria-current', 'true')
      else link.removeAttribute('aria-current')
    })
  }

  function queueWheelRender() {
    if (!wheelFrame) wheelFrame = window.requestAnimationFrame(renderNavigationWheel)
  }

  function syncWheelToPage() {
    const checkpoint = window.scrollY + window.innerHeight * 0.46
    let nextIndex = 0

    wheelSections.forEach((section, index) => {
      if (section && section.offsetTop <= checkpoint) nextIndex = index
    })

    if (nextIndex === selectedWheelIndex) return
    selectedWheelIndex = nextIndex
    const targetRotation = 270 - selectedWheelIndex * wheelStep
    wheelRotation += shortestAngle(targetRotation - wheelRotation)
    queueWheelRender()
  }

  navigationWheel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      wheelLinks[Math.min(selectedWheelIndex + 1, wheelLinks.length - 1)]?.click()
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      wheelLinks[Math.max(selectedWheelIndex - 1, 0)]?.click()
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      wheelLinks[selectedWheelIndex]?.click()
    }
  })

  navigationWheel.addEventListener('wheel', (event) => {
    event.preventDefault()

    if (wheelScrollLocked || Math.abs(event.deltaY) < 8) return

    const direction = event.deltaY > 0 ? 1 : -1
    const nextIndex = Math.max(0, Math.min(wheelLinks.length - 1, selectedWheelIndex + direction))

    if (nextIndex === selectedWheelIndex) return

    wheelScrollLocked = true
    wheelLinks[nextIndex].click()
    window.setTimeout(() => {
      wheelScrollLocked = false
    }, 650)
  }, { passive: false })

  window.addEventListener('resize', queueWheelRender)
  window.addEventListener('scroll', syncWheelToPage, { passive: true })
  renderNavigationWheel()
  syncWheelToPage()
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
