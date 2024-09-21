import "./types"

import {
  MsgType,
  SelectorType,
  type MatchingElementData,
  type Msg,
  type NewSelectorData,
  type NewSelectorMsg
} from "./types"

export {}

const highlightAttrStr = "selector-id"

chrome.runtime.onMessage.addListener((msg: Msg, sender, sendResponse) => {
  if (msg.type === MsgType.NEW_SELECTOR) {
    const typedMsg = msg as NewSelectorMsg

    clearHighlightedElements()

    const scriptData: MatchingElementData = highlightElements(typedMsg)

    sendData(scriptData)
  }
})

function clearHighlightedElements(): void {
  const elementsToClear: NodeListOf<HTMLElement> = document.querySelectorAll(
    "[" + highlightAttrStr + "]"
  ) as NodeListOf<HTMLElement>

  for (let i = 0; i < elementsToClear.length; i++) {
    elementsToClear[i].style.outline = ""
    elementsToClear[i].removeAttribute(highlightAttrStr)
  }
}

function highlightElements(
  newSelectorData: NewSelectorData
): MatchingElementData {
  const selector = newSelectorData.data.selector

  let matchingElements: HTMLElement[]
  if (newSelectorData.data.selectorType === SelectorType.XPATH) {
    matchingElements = getElementsByXPath(selector)
  } else if (newSelectorData.data.selectorType === SelectorType.CSS) {
    matchingElements = getElementsByCSS(selector)
  } else {
    return {
      data: {
        elements: []
      }
    }
  }

  for (let i = 0; i < matchingElements.length; i++) {
    matchingElements[i].style.outline = "3px solid orange"
    matchingElements[i].setAttribute(highlightAttrStr, i.toString())
  }

  return {
    data: {
      elements: matchingElements.map((el) => el.outerHTML)
    }
  }
}

function getElementsByXPath(xpath: string): HTMLElement[] {
  const results: HTMLElement[] = []
  const query = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  )
  for (let i = 0; i < query.snapshotLength; i++) {
    const node = query.snapshotItem(i)
    if (node instanceof HTMLElement) {
      results.push(node)
    }
  }
  return results
}

function getElementsByCSS(cssSelector: string): HTMLElement[] {
  const matchingElements = document.querySelectorAll(cssSelector)
  return Array.from(matchingElements).filter(
    (node) => node instanceof HTMLElement
  )
}

function sendData(scriptData: MatchingElementData) {
  console.log({
    type: MsgType.MATCHING_ELEMENTS,
    ...scriptData
  })
  chrome.runtime.sendMessage({
    type: MsgType.MATCHING_ELEMENTS,
    ...scriptData
  })
}
