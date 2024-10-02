import {
  MsgType,
  SelectorType,
  type HoverMatchingElementMsg,
  type MatchingElementData,
  type Msg,
  type NewSelectorData,
  type NewSelectorMsg
} from "~/types"

export {}

const highlightAttrStr = "selector-id"

chrome.runtime.onMessage.addListener((msg: Msg, sender, sendResponse) => {
  if (msg.type === MsgType.NEW_SELECTOR) {
    const typedMsg = msg as NewSelectorMsg

    clearHighlightedElements()

    const scriptData: MatchingElementData = highlightElements(typedMsg)

    sendData(scriptData)
  } else if (msg.type === MsgType.BEGIN_HOVER_MATCHING_ELEMENT) {
    const typedMsg = msg as HoverMatchingElementMsg

    hoverHighlightElement(typedMsg.data.selectorId)
  } else if (msg.type === MsgType.END_HOVER_MATCHING_ELEMENT) {
    const typedMsg = msg as HoverMatchingElementMsg

    stopHoverHighlightElement(typedMsg.data.selectorId)
  }
})

// Clears all the elements of outlines in the document
function clearHighlightedElements(): void {
  const elementsToClear: NodeListOf<HTMLElement> = document.querySelectorAll(
    "[" + highlightAttrStr + "]"
  ) as NodeListOf<HTMLElement>

  for (let i = 0; i < elementsToClear.length; i++) {
    elementsToClear[i].style.outline = ""
    elementsToClear[i].removeAttribute(highlightAttrStr)
  }
}

// Gets element using a selector, then sets the selector attribute and gives the elements an outline
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
      elements: matchingElements.map((el) => getOutermostElement(el.outerHTML))
    }
  }
}

// Gets HTML elements by XPath
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

// Gets HTML elements by CSS
function getElementsByCSS(cssSelector: string): HTMLElement[] {
  const matchingElements = document.querySelectorAll(cssSelector)
  return Array.from(matchingElements).filter(
    (node) => node instanceof HTMLElement
  )
}

// Sends data to the sidebar via chrome api
function sendData(scriptData: MatchingElementData) {
  chrome.runtime.sendMessage({
    type: MsgType.MATCHING_ELEMENTS,
    ...scriptData
  })
}

// Changes the color of the outline of HTML element in the document that the user is hovering in the sidebar
function hoverHighlightElement(selectorId: number) {
  const hoverElement: HTMLElement[] = getElementsByCSS(
    "[" + highlightAttrStr + "='" + selectorId + "']"
  )

  if (hoverElement.length != 1) {
    console.error("Something went wrong when highlighting the hovered element")
  }

  hoverElement[0].style.outline = "3px solid red"
}

// Returns the color of the outline of HTML element in the document that the user stopped hoering in the sidebar back to normal
function stopHoverHighlightElement(selectorId: number) {
  const hoverElement: HTMLElement[] = getElementsByCSS(
    "[" + highlightAttrStr + "='" + selectorId + "']"
  )

  if (hoverElement.length != 1) {
    console.error("Something went wrong when highlighting the hovered element")
  }

  hoverElement[0].style.outline = "3px solid orange"
}

// TODO: this currently always returns elements in the form of <div>...</div>, should only happen if there's a closing tag and there's stuff inside
// TODO: check if there's other elements that need special handling, and if there's a more general way to do it
// Given a string containing HTML, returns the outermost element with ... representing the inner elements
function getOutermostElement(html: string): string {
  const trimmedHtml = html.trim()

  // Create a temporary container
  const tempDiv = document.createElement("div")

  // Handle specific cases for table elements by providing an appropriate wrapper
  if (trimmedHtml.startsWith("<td")) {
    tempDiv.innerHTML = `<table><tbody><tr>${trimmedHtml}</tr></tbody></table>`
    const tableElement = tempDiv.querySelector("td")
    return tableElement ? formatElement(tableElement) : ""
  } else if (trimmedHtml.startsWith("<tr")) {
    tempDiv.innerHTML = `<table><tbody>${trimmedHtml}</tbody></table>`
    const tableElement = tempDiv.querySelector("tr")
    return tableElement ? formatElement(tableElement) : ""
  } else if (
    trimmedHtml.startsWith("<thead") ||
    trimmedHtml.startsWith("<tbody")
  ) {
    tempDiv.innerHTML = `<table>${trimmedHtml}</table>`
    const tableSection =
      tempDiv.querySelector("thead") || tempDiv.querySelector("tbody")
    return tableSection ? formatElement(tableSection) : ""
  } else if (trimmedHtml.startsWith("<table")) {
    tempDiv.innerHTML = trimmedHtml
    const tableElement = tempDiv.querySelector("table")
    return tableElement ? formatElement(tableElement) : ""
  } else {
    tempDiv.innerHTML = trimmedHtml
    const outermostElement = tempDiv.firstElementChild
    return outermostElement ? formatElement(outermostElement) : ""
  }
}

// Helper function to format the element into a string with "..."
function formatElement(element: Element): string {
  const tagName = element.tagName.toLowerCase()
  const attributes = Array.from(element.attributes)
    .map((attr) => `${attr.name}="${attr.value}"`)
    .join(" ")

  const openingTag = attributes ? `<${tagName} ${attributes}>` : `<${tagName}>`
  const closingTag = `</${tagName}>`

  return `${openingTag}...${closingTag}`
}
