import "./types"

import {
  MsgType,
  type MatchingElementData,
  type MatchingElementMsg,
  type Msg,
  type NewSelectorMsg
} from "./types"

export {}

const highlightAttrStr = "selector-id"

chrome.runtime.onMessage.addListener((request: Msg, sender, sendResponse) => {
  if (request.type === MsgType.NEW_SELECTOR) {
    let castedRequest = request as NewSelectorMsg
    clearHighlightedElements()
    let scriptData: MatchingElementData = highlightElements(
      castedRequest.data.selector
    )
    sendData(scriptData)
  }
})

const clearHighlightedElements = () => {
  let elementsToClear: NodeListOf<HTMLElement> = document.querySelectorAll(
    "[" + highlightAttrStr + "]"
  ) as NodeListOf<HTMLElement>

  for (let i = 0; i < elementsToClear.length; i++) {
    elementsToClear[i].style.outline = ""
    elementsToClear[i].removeAttribute(highlightAttrStr)
  }
}

const highlightElements = (selector: string): MatchingElementData => {
  try {
    let matchingElements: NodeListOf<HTMLElement> = document.querySelectorAll(
      selector
    ) as NodeListOf<HTMLElement>

    for (let i = 0; i < matchingElements.length; i++) {
      matchingElements[i].style.outline = "3px solid orange"
      matchingElements[i].setAttribute(highlightAttrStr, i.toString())
    }

    return {
      data: {
        elements: [],
        numOfElements: matchingElements.length
      }
    }
  } catch {
    return {
      data: {
        elements: [],
        numOfElements: 0
      }
    }
  }
}

const sendData = (scriptData: MatchingElementData) => {
  let payload: MatchingElementMsg = {
    type: MsgType.MATCHING_ELEMENTS,
    ...scriptData
  }

  chrome.runtime.sendMessage({
    ...payload
  })
}
