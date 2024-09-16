export {}
import "./types"
import { MessageType, type PopupMessage, type Request, type ScriptData } from "./types"

chrome.runtime.onMessage.addListener((request:Request, sender, sendResponse) => {
  if (request.type === MessageType.TO_SCRIPT) {
    let castedRequest = request as PopupMessage
    let numOfHighlightedElements:number = highlightElements(castedRequest.data.selector)
    sendData(numOfHighlightedElements)
  }
}) 

const highlightElements = (selector:string) => {
  let matchingElements:HTMLCollectionOf<HTMLElement> = document.getElementsByTagName(selector) as HTMLCollectionOf<HTMLElement>
  for (let i = 0; i < matchingElements.length; i++) {
    matchingElements[i].style.border = "1px solid black"
  }  
  
  return matchingElements.length
}

const sendData = (numOfElements:number) => {
  let payload:ScriptData = {
    type: MessageType.TO_POPUP,
    data: {
      elements: [],
      numOfElements: numOfElements
    }
  }

  chrome.runtime.sendMessage({ 
    ...payload
  });
}