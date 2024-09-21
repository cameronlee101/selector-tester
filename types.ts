export type Msg = {
  type: MsgType
}

export enum MsgType {
  MATCHING_ELEMENTS,
  NEW_SELECTOR
}

export enum SelectorType {
  NONE = "None",
  XPATH = "XPath",
  CSS = "CSS"
}

export type NewSelectorData = {
  data: {
    selectorType: SelectorType
    selector: string
  }
}

export type NewSelectorMsg = Msg & NewSelectorData

export type MatchingElementData = {
  data: {
    elements: String[]
  }
}

export type MatchingElementMsg = Msg & MatchingElementData
