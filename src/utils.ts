import type { Msg } from "~types"

export function sendMsgToTab(payload: Msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { ...payload })
  })
}
