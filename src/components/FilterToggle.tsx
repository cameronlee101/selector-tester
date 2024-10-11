function FilterToggle(
  id: string,
  filterName: string,
  checked: boolean,
  onChange: React.ChangeEventHandler<HTMLInputElement>
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
        className="px-2 text-sm hover:cursor-pointer select-none w-fit">
        {filterName}
      </label>
    </div>
  )
}

export default FilterToggle
