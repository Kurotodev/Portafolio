import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig, normalizePath } from 'vite'

const componentRoot = new URL('./src/components/', import.meta.url)
const componentDirectory = normalizePath(fileURLToPath(componentRoot))
const componentMarker = /^([ \t]*)<!-- component: ([a-z-]+) -->[ \t]*\r?$/gm

export default defineConfig({
  base: './',
  plugins: [{
    name: 'portfolio-html-components',
    handleHotUpdate({ file, server }) {
      if (!normalizePath(file).startsWith(componentDirectory) || !file.endsWith('.html')) return
      server.ws.send({ type: 'full-reload', path: '*' })
      return []
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const components = await Promise.all(
          [...html.matchAll(componentMarker)].map(async ([marker, indent, name]) => {
            const file = new URL(`${name}.html`, componentRoot)
            const markup = (await readFile(file, 'utf8')).trimEnd()
            return [marker, markup.replace(/^(?=[^\r\n])/gm, indent)]
          })
        )
        return components.reduce((page, [marker, markup]) => page.replace(marker, () => markup), html)
      }
    }
  }]
})
