import { useEffect, useState } from "react"

function IndexPopup() {
  const [data, setData] = useState("")
  const [numOfElements, setNumOfElements] = useState("");

  useEffect(() => {
    chrome.storage.local.get("numOfElements", (result) => {
      console.log("Found " + result.numOfElements + " elements")
      setNumOfElements(result.numOfElements);
    })
  }, [])

  return (
    <div
      style={{
        padding: 16
      }}>
      <h2>
        Welcome to your{" "}
        <a href="https://www.plasmo.com" target="_blank">
          Plasmo
        </a>{" "}
        Extension!
      </h2>
      <input onChange={(e) => setData(e.target.value)} value={data} />
      <a href="https://docs.plasmo.com" target="_blank">
        View Docs
      </a>
      <p>
        Num of elements: {numOfElements}
      </p>
    </div>
  )
}

export default IndexPopup
