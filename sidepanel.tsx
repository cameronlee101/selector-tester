import React, { useState, type FormEvent } from "react"

import {
  MsgType,
  SelectorType,
  type MatchingElementMsg,
  type Msg,
  type NewSelectorMsg
} from "./types"

function IndexSidePanel() {
  const [selector, setSelector] = useState("")
  const [numOfElements, setNumOfElements] = useState(0)
  const [selectorType, setSelectorType] = useState(SelectorType.NONE)

  chrome.runtime.onMessage.addListener((msg: Msg, sender, sendResponse) => {
    if (msg.type === MsgType.MATCHING_ELEMENTS) {
      const typedMsg = msg as MatchingElementMsg

      setNumOfElements(typedMsg.data.numOfElements)
    }
  })

  function isXPath(selector: string) {
    const xpathPattern = /^(\.\/|\/|\.\.|\/\/)/
    return xpathPattern.test(selector)
  }

  function submitSelector(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    let curSelectorType: SelectorType = SelectorType.NONE
    if (selector != "") {
      curSelectorType = isXPath(selector)
        ? SelectorType.XPATH
        : SelectorType.CSS
    }
    setSelectorType(curSelectorType)

    const payload: NewSelectorMsg = {
      type: MsgType.NEW_SELECTOR,
      data: {
        selectorType: curSelectorType,
        selector: selector
      }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { ...payload })
    })
  }

  return (
    <div
      style={{
        padding: 16
      }}>
      <h2>Welcome Selector-Tester Extension</h2>
      <form onSubmit={submitSelector}>
        <input onChange={(e) => setSelector(e.target.value)} value={selector} />
      </form>
      <p>Detected selector type: {selectorType}</p>
      <p>Num of elements: {numOfElements}</p>
    </div>
  )
}

export default IndexSidePanel
