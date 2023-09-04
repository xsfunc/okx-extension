import browser from 'webextension-polyfill'

browser.runtime.onInstalled.addListener((details) => {
  // eslint-disable-next-line no-console
  console.log('Extension installed:', details)
})
