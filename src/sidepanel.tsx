import React, { useState, type FormEvent } from "react"

import "~style.css"

import classNames from "classnames"

import FilterToggle from "~components/FilterToggle"
import MatchingElementInfo from "~components/MatchingElementInfo"
import {
  MsgType,
  SelectorType,
  type MatchingElementMsg,
  type Msg,
  type NewSelectorMsg
} from "~types"
import { sendMsgToTab } from "~utils"

export type FormData = {
  selector: string
  onlyDisplayedElements: boolean
  onlyVisibleElements: boolean
  onlySelectedElements: boolean
  onlyEnabledElements: boolean
}

function IndexSidePanel() {
  const [formData, setFormData] = useState<FormData>({
    selector: "",
    onlyDisplayedElements: false,
    onlyVisibleElements: false,
    onlySelectedElements: false,
    onlyEnabledElements: false
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
        ...formData,
        selectorType: curSelectorType
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
        ...formData,
        selectorType: SelectorType.NONE,
        selector: ""
      }
    }

    sendMsgToTab(payload)
  }

  function renderFilterList(): React.JSX.Element {
    return (
      <>
        {FilterToggle(
          "displayedElements",
          "Displayed",
          formData.onlyDisplayedElements,
          (e) =>
            setFormData({
              ...formData,
              onlyDisplayedElements: e.target.checked
            })
        )}
        {FilterToggle(
          "visibleElements",
          "Visible",
          formData.onlyVisibleElements,
          (e) =>
            setFormData({
              ...formData,
              onlyVisibleElements: e.target.checked
            })
        )}
        {FilterToggle(
          "selectedElements",
          "Selected",
          formData.onlySelectedElements,
          (e) =>
            setFormData({
              ...formData,
              onlySelectedElements: e.target.checked
            })
        )}
        {FilterToggle(
          "enabledElements",
          "Enabled",
          formData.onlyEnabledElements,
          (e) =>
            setFormData({
              ...formData,
              onlyEnabledElements: e.target.checked
            })
        )}
      </>
    )
  }

  return (
    <main className="p-3 h-screen flex flex-col">
      <h2 className="text-2xl font-semibold">Selector-Tester Extension</h2>
      <div className="my-6 space-y-2">
        <form onSubmit={submitSelector} className="flex flex-col mb-4">
          <input
            type="text"
            className="border-2 border-gray-400 rounded-md p-0.5 focus:border-gray-900 text-sm"
            onChange={(e) =>
              setFormData({
                ...formData,
                selector: e.target.value
              })
            }
            value={formData.selector}
          />
          <div className="flex mt-2 w-full">
            <div className="flex flex-col w-1/2">
              <p className="text-sm mb-0.5">Filters:</p>
              {renderFilterList()}
            </div>
            <div className="flex w-1/2 justify-end gap-x-2">
              <button
                className="bg-gray-200 p-1.5 py-0.5 w-fit h-fit rounded-lg text-sm border-gray-500 border-2 active:bg-gray-500"
                type="submit">
                Search
              </button>
              <button
                className="bg-gray-200 p-1.5 py-0.5 w-fit h-fit rounded-lg text-sm border-gray-500 border-2 active:bg-gray-500"
                onClick={clearAll}
                type="button">
                Clear
              </button>
            </div>
          </div>
        </form>
        <p className="px-1">Detected selector type: {selectorType}</p>
        <p
          className={classNames(
            "text-sm px-1 w-fit rounded-md",
            matchingElements.length === 1
              ? "bg-green-300"
              : matchingElements.length === 0
                ? ""
                : "bg-red-300"
          )}>
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
