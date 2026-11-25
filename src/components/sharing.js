const shareTitle = 'Israel De Los Santos (Kuroto) | Full-Stack Developer'
const shareText = 'Explore Kuroto’s full-stack development portfolio, including storefronts, APIs, payment systems, and secure delivery platforms.'

export function initSharing() {
  const pageUrl = window.location.href.split('#')[0]
  const encodedUrl = encodeURIComponent(pageUrl)

  const linkedin = document.querySelector('[data-share-linkedin]')
  const x = document.querySelector('[data-share-x]')
  const nativeButton = document.querySelector('[data-share-native]')

  if (linkedin) linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  if (x) x.href = `https://x.com/intent/post?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`

  if (!nativeButton || !navigator.share) return

  nativeButton.hidden = false
  nativeButton.addEventListener('click', async () => {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: pageUrl })
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Unable to share the portfolio.', error)
    }
  })
}
