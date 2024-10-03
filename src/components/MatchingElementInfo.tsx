import React from "react"

import "~style.css"

import { MsgType, type HoverMatchingElementMsg, type Msg } from "~types"
import { sendMsgToTab } from "~utils"

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
      className="mb-1 border-2 border-gray-400 border-solid hover:cursor-default hover:border-gray-500"
      key={selectorId}
      onMouseEnter={hoverHighlightElement}
      onMouseLeave={stopHoverHighlightElement}>
      {element}
    </p>
  )
}

export default MatchingElementInfo
