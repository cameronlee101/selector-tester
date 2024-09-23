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
import { sendMsgToTab } from "~utils"

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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Selector-Tester Extension</h2>
      <div className="my-6 space-y-2">
        <form onSubmit={submitSelector}>
          <input
            className="border-2 border-gray-400 rounded-md p-0.5 focus:border-gray-900 text-sm mr-2"
            onChange={(e) => setSelector(e.target.value)}
            value={selector}
          />
          <button
            className="bg-gray-200 p-1 py-0.5 rounded-lg border-gray-500 border-2 active:bg-gray-500"
            type="submit">
            Search
          </button>
        </form>
        <p className="text-sm">Detected selector type: {selectorType}</p>
        <p className="text-sm">
          Number of matching elements: {matchingElements.length}
        </p>
      </div>
      <div>
        {matchingElements.map((el, selectorId) =>
          MatchingElementInfo(el, selectorId)
        )}
      </div>
    </div>
  )
}

export default IndexSidePanel