import React, { useState, type FormEvent } from "react"
import { MessageType, type PopupMessage, type Request, type ScriptData } from "./types";

function IndexSidePanel() {
  const [selector, setSelector] = useState("")
  const [numOfElements, setNumOfElements] = useState(0);

  chrome.runtime.onMessage.addListener((request:Request, sender, sendResponse) =>{ 
    if (request.type === MessageType.TO_POPUP) {
      let castedRequest = request as ScriptData

      setNumOfElements(castedRequest.data.numOfElements)
    }
  });

  const submitSelector = (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let payload:PopupMessage = {
      type: MessageType.TO_SCRIPT,
      data: {
        selector: selector
      }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {...payload});
    });
  }

  return (
    <div
      style={{
        padding: 16
      }}>
      <h2>
        Welcome Selector-Tester Extension
      </h2>
      <form onSubmit={submitSelector}>
        <input onChange={(e) => setSelector(e.target.value)} value={selector} />
      </form>
      <p>
        Num of elements: {numOfElements}
      </p>
    </div>
  )
}

export default IndexSidePanel
