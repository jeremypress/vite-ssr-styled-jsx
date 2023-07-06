export { render }

import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server'
import { PageLayout } from './PageLayout'
import { createStyleRegistry, StyleRegistry } from 'styled-jsx'

const registry = createStyleRegistry()

async function render(pageContext) {
  // flush styles to support the possibility of concurrent rendering
  registry.flush()

  const { Page } = pageContext
  // include the styleregistry in the app render to inject the styles
  const viewHtml = dangerouslySkipEscape(
    renderToString(
      <StyleRegistry registry={registry}>
        <PageLayout>
          <Page />
        </PageLayout>
      </StyleRegistry >
    )
  )

  // extract the styles to add as head tags to the server markup
  const headTags = renderToStaticMarkup(<>{registry.styles()}</>)

  return escapeInject`<!DOCTYPE html>
    <html>
      <head>
        ${dangerouslySkipEscape(headTags)}
      </head>
      <body>
        <div id="page-view">${viewHtml}</div>
      </body>
    </html>`
}