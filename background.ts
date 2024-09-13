export {}
 
console.log(
  "background.ts successfully loaded"
)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
  {
    chrome.storage.local.set({ numOfElements: request.payload.totalElements });
  }
);