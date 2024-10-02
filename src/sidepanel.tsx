import React, { useState, type FormEvent } from "react"

import "~/style.css"

import MatchingElementInfo from "~/components/MatchingElementInfo"
import {
  MsgType,
  SelectorType,
  type MatchingElementMsg,
  type Msg,
  type NewSelectorMsg
} from "~/types"

// this function used to be exported from a utils.ts file so that it can be shared, but plasmo dies when i try to run build or dev like that so i have duplicated code now :)
function sendMsgToTab(payload: Msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { ...payload })
  })
}

function IndexSidePanel() {
  const [selector, setSelector] = useState<string>("")
  const [matchingElements, setMatchingElements] = useState<string[]>([])
  const [selectorType, setSelectorType] = useState<SelectorType>(
    SelectorType.NONE
  )

  chrome.runtime.onMessage.addListener((msg: Msg, sender, sendResponse) => {
    if (msg.type === MsgType.MATCHING_ELEMENTS) {
      const typedMsg: MatchingElementMsg = msg as MatchingElementMsg
      const elements: string[] = typedMsg.data.elements

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

    sendMsgToTab(payload)
  }

  function clearAll() {
    setSelector("")
    setSelectorType(SelectorType.NONE)

    const payload: NewSelectorMsg = {
      type: MsgType.NEW_SELECTOR,
      data: {
        selectorType: SelectorType.NONE,
        selector: ""
      }
    }

    sendMsgToTab(payload)
  }

  return (
    <main className="p-3 h-screen flex flex-col">
      <h2 className="text-2xl font-semibold">Selector-Tester Extension</h2>
      <div className="my-6 space-y-2">
        <form onSubmit={submitSelector} className="flex flex-col mb-4">
          <input
            className="border-2 border-gray-400 rounded-md p-0.5 focus:border-gray-900 text-sm mr-2"
            onChange={(e) => setSelector(e.target.value)}
            value={selector}
          />
          <div className="mt-2">
            <button
              className="bg-gray-200 p-1 py-0.5 rounded-lg border-gray-500 border-2 active:bg-gray-500 mr-2"
              type="submit">
              Search
            </button>
            <button
              className="bg-gray-200 p-1 py-0.5 rounded-lg border-gray-500 border-2 active:bg-gray-500"
              onClick={clearAll}
              type="button">
              Clear
            </button>
          </div>
        </form>
        <p className="text-sm">Detected selector type: {selectorType}</p>
        <p className="text-sm">
          Number of matching elements: {matchingElements.length}
        </p>
      </div>
      <div className="overflow-y-scroll overflow-x-clip">
        {matchingElements.map((el, selectorId) =>
          MatchingElementInfo(el, selectorId)
        )}
      </div>
    </main>
  )
}

export default IndexSidePanel
