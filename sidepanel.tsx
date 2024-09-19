import React, { useState, type FormEvent } from "react"

import {
  MsgType,
  type MatchingElementMsg,
  type Msg,
  type NewSelectorMsg
} from "./types"

function IndexSidePanel() {
  const [selector, setSelector] = useState("")
  const [numOfElements, setNumOfElements] = useState(0)

  chrome.runtime.onMessage.addListener((request: Msg, sender, sendResponse) => {
    if (request.type === MsgType.MATCHING_ELEMENTS) {
      let castedRequest = request as MatchingElementMsg

      setNumOfElements(castedRequest.data.numOfElements)
    }
  })

  const submitSelector = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let payload: NewSelectorMsg = {
      type: MsgType.NEW_SELECTOR,
      data: {
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
      <p>Num of elements: {numOfElements}</p>
    </div>
  )
}

export default IndexSidePanel
