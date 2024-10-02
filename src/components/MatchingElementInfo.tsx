import React from "react"

import "~/style.css"

import { MsgType, type HoverMatchingElementMsg, type Msg } from "~types"

// this function used to be exported from a utils.ts file so that it can be shared, but plasmo dies when i try to run build or dev like that so i have duplicated code now :)
function sendMsgToTab(payload: Msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { ...payload })
  })
}

function MatchingElementInfo(element: String, selectorId: number) {
  function hoverHighlightElement() {
    const payload: HoverMatchingElementMsg = {
      type: MsgType.BEGIN_HOVER_MATCHING_ELEMENT,
      data: {
        selectorId: selectorId
      }
    }

    sendMsgToTab(payload)
  }

  function stopHoverHighlightElement() {
    const payload: HoverMatchingElementMsg = {
      type: MsgType.END_HOVER_MATCHING_ELEMENT,
      data: {
        selectorId: selectorId
      }
    }

    sendMsgToTab(payload)
  }

  return (
    <p
      className="mb-1 border-2 border-gray-400 border-solid hover:cursor-default"
      key={selectorId}
      onMouseEnter={hoverHighlightElement}
      onMouseLeave={stopHoverHighlightElement}>
      {element}
    </p>
  )
}

export default MatchingElementInfo
