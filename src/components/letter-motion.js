export function initLetterMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const headings = [...document.querySelectorAll('[data-letter-reveal]')]

  const reveal = (heading) => {
    heading.classList.add('is-visible')
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
