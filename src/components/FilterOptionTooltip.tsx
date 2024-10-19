import classNames from "classnames"
import circleI from "data-base64:~images/circle-with-i.png"
import React, { useState } from "react"

function FilterOptionTooltip(text: string) {
  const [isHoverOver, setHoverOver] = useState<boolean>(false)

  return (
    <div className="relative flex items-center">
      {/* circle i symbol */}
      <img
        src={circleI}
        alt="Info"
        className="w-3 h-3 cursor-pointer"
        onMouseEnter={() => setHoverOver(true)}
        onMouseLeave={() => setHoverOver(false)}
      />
      {/* tooltip text */}
      <div
        className={classNames(
          "absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 w-40 bg-gray-800 text-white text-xs rounded-lg",
          isHoverOver ? "block" : "hidden"
        )}>
        <span>{text}</span>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 -z-10 w-3 h-3 rotate-45 bg-gray-800"></div>
      </div>
    </div>
  )
}

export default FilterOptionTooltip
