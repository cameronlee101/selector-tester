export {}
window.addEventListener("load", () => {
  console.log(
    "content.ts successfully loaded"
  )

  let divs = document.getElementsByTagName("div")
  for (let i = 0; i < divs.length; i++) {
    divs[i].style.border = "1px solid black"
  }  

  chrome.runtime.sendMessage({ 
    payload: {totalElements: divs.length}
  });
})