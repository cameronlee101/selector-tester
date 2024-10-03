import React, { useState, type FormEvent } from "react"

import "~style.css"

import MatchingElementInfo from "~components/MatchingElementInfo"
import {
  MsgType,
  SelectorType,
  type MatchingElementMsg,
  type Msg,
  type NewSelectorMsg
} from "~types"
import { sendMsgToTab } from "~utils"

type FormData = {
  selector: string
  onlyVisibleElements: boolean
}

function IndexSidePanel() {
  const [formData, setFormData] = useState<FormData>({
    selector: "",
    onlyVisibleElements: false
  })
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
    if (formData.selector) {
      curSelectorType = isXPath(formData.selector)
        ? SelectorType.XPATH
        : SelectorType.CSS
    }
    setSelectorType(curSelectorType)

    const payload: NewSelectorMsg = {
      type: MsgType.NEW_SELECTOR,
      data: {
        selectorType: curSelectorType,
        selector: formData.selector,
        onlyVisibleElements: formData.onlyVisibleElements
      }
    }

    sendMsgToTab(payload)
  }

  function clearAll() {
    setFormData({
      ...formData,
      selector: ""
    })
    setSelectorType(SelectorType.NONE)

    const payload: NewSelectorMsg = {
      type: MsgType.NEW_SELECTOR,
      data: {
        selectorType: SelectorType.NONE,
        selector: "",
        onlyVisibleElements: formData.onlyVisibleElements
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
            type="text"
            className="border-2 border-gray-400 rounded-md p-0.5 focus:border-gray-900 text-sm mr-2"
            onChange={(e) =>
              setFormData({
                ...formData,
                selector: e.target.value
              })
            }
            value={formData.selector}
          />
          <div className="flex mt-2">
            <input
              id="visibleElements"
              name="visibleElements"
              type="checkbox"
              className="mr-2 h-4 w-4 self-center hover:cursor-pointer"
              checked={formData.onlyVisibleElements}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  onlyVisibleElements: e.target.checked
                })
              }
            />
            <label
              htmlFor="visibleElements"
              className="text-sm hover:cursor-pointer select-none">
              Only Visible Elements
            </label>
          </div>
          <div className="mt-4">
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
