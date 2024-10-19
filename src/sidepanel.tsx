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
          "Only find elements that are visible and clickable on this page, similar to Selenium's isDisplayed() function"
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
        <div className="my-3 space-y-2">
          <form
            className="flex flex-col mb-2"
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault()
              submitSelector()
            }}>
            <Input
              type="text"
              label="Selector"
              variant="bordered"
              description={"Detected selector type: " + selectorType}
              className="text-gray-700"
              classNames={{
                inputWrapper: ["bg-gray-100"],
                label: ["text-gray-600"],
                mainWrapper: ["border-gray-700"]
              }}
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
                <p className="text-sm mb-0.5">Filters:</p>
                {renderFilterList()}
              </div>
              <div className="flex w-1/2 justify-end gap-x-2">
                <Button
                  type="submit"
                  size="sm"
                  radius="md"
                  data-focus="false"
                  data-focus-visible="false">
                  Search
                </Button>
                <Button
                  onClick={clearAll}
                  type="button"
                  size="sm"
                  radius="md"
                  color="default">
                  Clear
                </Button>
              </div>
            </div>
          </form>
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
    </NextUIProvider>
  )
}

export default IndexSidePanel
