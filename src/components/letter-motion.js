function prepareLetters(element) {
  const readableCopy = element.cloneNode(true)
  readableCopy.querySelectorAll('br').forEach((breakElement) => breakElement.replaceWith(' '))
  const readableText = readableCopy.textContent.replace(/\s+/g, ' ').trim()
  if (!readableText) return false

  element.setAttribute('aria-label', readableText)

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) textNodes.push(walker.currentNode)

  let letterIndex = 0
  for (const textNode of textNodes) {
    const fragment = document.createDocumentFragment()
    for (const part of textNode.nodeValue.split(/(\s+)/)) {
      if (!part) continue
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part))
        continue
      }

      const word = document.createElement('span')
      word.className = 'letter-word'
      word.setAttribute('aria-hidden', 'true')

      for (const letter of Array.from(part)) {
        const character = document.createElement('span')
        character.className = 'letter-char'
        character.style.setProperty('--letter-index', String(letterIndex++))
        character.textContent = letter
        word.appendChild(character)
      }
      fragment.appendChild(word)
    }
    textNode.replaceWith(fragment)
  }

  element.classList.add('is-prepared')
  return true
}

export function initLetterMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const headings = [...document.querySelectorAll('[data-letter-reveal]')]
    .filter(prepareLetters)

  const reveal = (heading) => {
    heading.classList.add('is-visible')
    window.setTimeout(() => heading.classList.add('is-complete'), 1200)
  }

  if (!('IntersectionObserver' in window)) {
    headings.forEach(reveal)
    return
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      reveal(entry.target)
      observer.unobserve(entry.target)
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -24px' })

  headings.forEach((heading) => observer.observe(heading))
}
