import circleI from "data-base64:~images/circle-with-i.png"
import React from "react"

function FilterOptionTooltip(text: string) {
  return (
    <div className="relative flex items-center group">
      {/* circle i symbol */}
      <img src={circleI} alt="Info" className="w-3 h-3 cursor-pointer" />
      {/* tooltip text */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 w-40 bg-gray-800 text-white text-xs rounded-lg">
        <span>{text}</span>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 -z-10 w-3 h-3 rotate-45 bg-gray-800"></div>
      </div>
    </div>
  )
}

export default FilterOptionTooltip
