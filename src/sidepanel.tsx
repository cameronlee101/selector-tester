import React, { useState, type FormEvent, type KeyboardEvent } from "react"

import "~style.css"

import { Button, Input, NextUIProvider } from "@nextui-org/react"
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
  onlySelectedElements: boolean
  onlyEnabledElements: boolean
}

function IndexSidePanel() {
  const [formData, setFormData] = useState<FormData>({
    selector: "",
    onlyDisplayedElements: false,
    onlySelectedElements: false,
    onlyEnabledElements: false
  })
  const [matchingElements, setMatchingElements] = useState<string[]>([])
  const [selectorType, setSelectorType] = useState<SelectorType>(
    SelectorType.NONE
  )
  const [matchElCountBGTailwind, setMatchElCountBGTailwind] =
    useState<string>("")

  chrome.runtime.onMessage.addListener((msg: Msg, sender, sendResponse) => {
    if (msg.type === MsgType.MATCHING_ELEMENTS) {
      const typedMsg: MatchingElementMsg = msg as MatchingElementMsg
      const elements: string[] = typedMsg.data.elements

      setMatchingElements(elements)
      if (elements.length === 1) {
        setMatchElCountBGTailwind("bg-green-300")
      } else if (elements.length === 0 && formData.selector === "") {
        setMatchElCountBGTailwind("")
      } else if (
        elements.length > 2 ||
        (elements.length === 0 && formData.selector !== "")
      ) {
        setMatchElCountBGTailwind("bg-red-300")
      }
    }
  })

  function isXPath(selector: string) {
    const xpathPattern = /^(\.\/|\/|\.\.|\/\/)/
    return xpathPattern.test(selector)
  }

  function submitSelector() {
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
          "Displayed",
          formData.onlyDisplayedElements,
          (e) =>
            setFormData({
              ...formData,
              onlyDisplayedElements: e.target.checked
            }),
          "Only find elements that are displayed on this page, similar to Selenium's isDisplayed() function"
        )}
        {FilterToggle(
          "Selected",
          formData.onlySelectedElements,
          (e) =>
            setFormData({
              ...formData,
              onlySelectedElements: e.target.checked
            }),
          "Only find elements that have been selected, similar to Selenium's isSelected() function"
        )}
        {FilterToggle(
          "Enabled",
          formData.onlyEnabledElements,
          (e) =>
            setFormData({
              ...formData,
              onlyEnabledElements: e.target.checked
            }),
          "Only find elements that are enabled, similar to Selenium's isEnabled() function"
        )}
      </>
    )
  }

  return (
    <NextUIProvider>
      <main className="p-3 h-screen flex flex-col">
        <div className="mb-3">
          <form
            className="flex flex-col mb-2"
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault()
              submitSelector()
            }}>
            <Input
              type="text"
              label="Selector"
              variant="faded"
              description={"Detected selector type: " + selectorType}
              className="text-gray-700"
              onValueChange={(e) =>
                setFormData({
                  ...formData,
                  selector: e.valueOf()
                })
              }
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  submitSelector()
                }
              }}
              value={formData.selector}
            />
            <div className="flex mt-2 w-full">
              <div className="flex flex-col w-1/2">
                <p className="text-sm mb-0.5 underline ml-7">Filters</p>
                {renderFilterList()}
              </div>
              <div className="flex w-1/2 justify-end gap-x-2">
                <Button
                  type="submit"
                  size="sm"
                  radius="md"
                  className="text-sm"
                  variant="shadow">
                  Search
                </Button>
                <Button
                  onClick={clearAll}
                  type="button"
                  size="sm"
                  radius="md"
                  className="text-sm"
                  variant="shadow">
                  Clear
                </Button>
              </div>
            </div>
          </form>
          <p
            className={classNames(
              "text-sm px-1 w-fit rounded-md",
              matchElCountBGTailwind
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
    </NextUIProvider>
  )
}

export default IndexSidePanel
