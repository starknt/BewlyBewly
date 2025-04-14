import browser from 'webextension-polyfill'

import { setupApiMsgLstnrs } from './messageListeners/api'
import { setupTabMsgLstnrs } from './messageListeners/tabs'

browser.runtime.onInstalled.addListener(async () => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

function isExtensionUri(url: string) {
  return new URL(url).origin === new URL(browser.runtime.getURL('')).origin
}

// eslint-disable-next-line node/prefer-global/process
if (process.env.FIREFOX) {
  browser.webRequest.onBeforeSendHeaders.addListener(
    async (details: any) => {
      const requestHeaders: browser.WebRequest.HttpHeaders = []
      if (details.documentUrl) {
        const url = new URL(details.documentUrl)
        const extensionUri = isExtensionUri(details.documentUrl)
        details.requestHeaders = details.requestHeaders || []
        for (let i = 0; i < details.requestHeaders.length; i++) {
          if (details.requestHeaders[i].name.toLowerCase() === 'origin' || details.requestHeaders[i].name.toLowerCase() === 'referer')
            requestHeaders.push({ name: details.requestHeaders[i].name, value: extensionUri ? 'https://www.bilibili.com' : url.origin })
          else
            requestHeaders.push(details.requestHeaders[i])

          if (details.requestHeaders[i].name === 'firefox-multi-account-cookie') {
            requestHeaders.push({ name: 'cookie', value: details.requestHeaders[i].value })
          }
        }

        return { ...details, requestHeaders }
      }
    },
    { urls: ['<all_urls>'] },
    ['blocking', 'requestHeaders'],
  )

  // Block all scripts and styles files
  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (!details.documentUrl?.startsWith('https://www.bilibili.com/') || details.documentUrl?.startsWith('https://www.bilibili.com/video')) {
        return { cancel: false }
      }

      // ignore document requests
      if (details.type === 'main_frame' || details.type === 'sub_frame')
        return { cancel: false }
      // ignore extension requests
      if (details.type === 'script' && details.url.startsWith(browser.runtime.getURL('')))
        return { cancel: false }
      if (details.url.includes(`#${browser.runtime.id}`)) {
        return { cancel: false }
      }
      if (details.type !== 'xmlhttprequest')
        return { cancel: true }
    },
    { urls: ['<all_urls>'] },
    ['blocking'],
  )
}

// Block all scripts file

// Setup all message listeners
setupApiMsgLstnrs()
setupTabMsgLstnrs()
