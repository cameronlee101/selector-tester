import {
  MsgType,
  SelectorType,
  type HoverMatchingElementMsg,
  type MatchingElementData,
  type Msg,
  type NewSelectorData,
  type NewSelectorMsg
} from "~types"

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

  // Filtering by displayed elements if enabled
  if (newSelectorData.data.onlyDisplayedElements) {
    matchingElements = matchingElements.filter((el) => {
      // Check if element is part of the DOM and visible (offsetWidth and offsetHeight > 0)
      const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0

      // Check for computed styles: 'display' and 'visibility'
      const computedStyle = window.getComputedStyle(el)
      const isDisplayed =
        computedStyle.display !== "none" &&
        computedStyle.visibility !== "hidden"

      // Check if the element can be clicked: Not disabled and pointer-events are not set to none
      const isClickable =
        computedStyle.pointerEvents !== "none" && !el.hasAttribute("disabled")

      // Element is considered displayed and clickable if all conditions are met
      return isVisible && isDisplayed && isClickable
    })
  }

  // Filtering by selected elements if enabled
  if (newSelectorData.data.onlySelectedElements) {
    matchingElements = matchingElements.filter((el) => {
      return el.getAttribute("selected") === "selected"
    })
  }

  // Filtering by enabled elements if enabled
  if (newSelectorData.data.onlyEnabledElements) {
    matchingElements = matchingElements.filter((el) => {
      return !(el.getAttribute("disabled") === "disabled")
    })
  }

  // Outlining matching elements
  for (let i = 0; i < matchingElements.length; i++) {
    matchingElements[i].style.outline = "3px solid orange"
    matchingElements[i].setAttribute(highlightAttrStr, i.toString())
  }

  // Return matching element data in the form of <>...</>
  return {
    data: {
      elements: matchingElements.map((el) => getOutermostElementStr(el))
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

// Given an HTML element, returns a string representation of that element with ... representing the inner elements
function getOutermostElementStr(htmlElement: HTMLElement): string {
  if (htmlElement == null) {
    return ""
  } else {
    const tagName: string = htmlElement.tagName.toLowerCase()
    const attributes: string = Array.from(htmlElement.attributes)
      .map((attr) => `${attr.name}="${attr.value}"`)
      .join(" ")

    const openingTag: string = attributes
      ? `<${tagName} ${attributes}>`
      : `<${tagName}>`
    const closingTag: string = `</${tagName}>`

    if (htmlElement.innerHTML === "") {
      return `${openingTag}${closingTag}`
    } else {
      return `${openingTag}...${closingTag}`
    }
  }
}
