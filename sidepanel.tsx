import React, { useState, type FormEvent } from "react"

import "./style.css"

import {
  MsgType,
  SelectorType,
  type MatchingElementMsg,
  type Msg,
  type NewSelectorMsg
} from "./types"

function IndexSidePanel() {
  const [selector, setSelector] = useState<string>("")
  const [matchingElements, setMatchingElements] = useState<String[]>([])
  const [selectorType, setSelectorType] = useState<SelectorType>(
    SelectorType.NONE
  )

  chrome.runtime.onMessage.addListener((msg: Msg, sender, sendResponse) => {
    if (msg.type === MsgType.MATCHING_ELEMENTS) {
      const typedMsg: MatchingElementMsg = msg as MatchingElementMsg
      const elements: String[] = typedMsg.data.elements

      setMatchingElements(elements)
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
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Selector-Tester Extension</h2>
      <form className="mb-2" onSubmit={submitSelector}>
        <input
          className="border-2 border-gray-400 rounded-md focus:border-gray-900 text-sm mr-2"
          onChange={(e) => setSelector(e.target.value)}
          value={selector}
        />
        <button
          className="bg-gray-200 p-1 py-0.5 rounded-lg border-gray-800 border-2"
          type="submit">
          Search
        </button>
      </form>
      <p className="mb-2 text-sm">Detected selector type: {selectorType}</p>
      <p className="mb-2 text-sm">Num of elements: {matchingElements.length}</p>
      <div>
        {matchingElements.map((el) => (
          <p className="mb-1">{el}</p>
        ))}
      </div>
    </div>
  )
}

export default IndexSidePanel
