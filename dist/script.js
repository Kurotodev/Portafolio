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
