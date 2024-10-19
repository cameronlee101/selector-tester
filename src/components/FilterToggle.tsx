import { Checkbox } from "@nextui-org/react"
import React, { type ReactNode } from "react"

import FilterOptionTooltip from "./FilterOptionTooltip"

function FilterToggle(
  filterName: string,
  checked: boolean,
  onChange: React.ChangeEventHandler<HTMLInputElement>,
  tooltipText: string
): ReactNode {
  return (
    <div className="flex items-center my-0.5">
      <Checkbox
        checked={checked}
        onChange={onChange}
        color="default"
        className="p-0 m-0">
        <div className="flex gap-x-1">
          {filterName}
          {FilterOptionTooltip(tooltipText)}
        </div>
      </Checkbox>
    </div>
  )
}

export default FilterToggle
