export function initProfileDates() {
  const currentYear = new Date().getFullYear()

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = String(currentYear)
  })

  const currentAge = currentYear - 2004

  document.querySelectorAll('[data-age]').forEach((element) => {
    element.textContent = String(currentAge)
  })
}
