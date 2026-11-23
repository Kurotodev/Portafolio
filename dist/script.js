const header = document.querySelector('[data-header]')
const menuToggle = document.querySelector('[data-menu-toggle]')
const navigation = document.querySelector('[data-nav]')
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
  '.site-nav a',
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
