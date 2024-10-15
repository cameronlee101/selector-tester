import React from "react"

import FilterOptionTooltip from "./FilterOptionTooltip"

function FilterToggle(
  id: string,
  filterName: string,
  checked: boolean,
  onChange: React.ChangeEventHandler<HTMLInputElement>,
  tooltipText: string
) {
  return (
    <div className="flex items-center h-full my-0.5">
      <input
        id={id}
        name={id}
        type="checkbox"
        className="h-4 w-4 hover:cursor-pointer"
        checked={checked}
        onChange={onChange}
      />
      <label
        htmlFor={id}
        className="flex pl-2 pr-1 text-sm hover:cursor-pointer select-none w-fit">
        {filterName}
      </label>
      <span>{FilterOptionTooltip(tooltipText)}</span>
    </div>
  )
}

export default FilterToggle
