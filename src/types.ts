export type Msg = {
  type: MsgType
}

export enum MsgType {
  MATCHING_ELEMENTS,
  NEW_SELECTOR,
  BEGIN_HOVER_MATCHING_ELEMENT,
  END_HOVER_MATCHING_ELEMENT
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
    onlyDisplayedElements: boolean
    onlyVisibleElements: boolean
    onlySelectedElements: boolean
    onlyEnabledElements: boolean
  }
}

export type NewSelectorMsg = Msg & NewSelectorData

export type MatchingElementData = {
  data: {
    elements: string[]
  }
}

export type MatchingElementMsg = Msg & MatchingElementData

export type HoverMatchingElementData = {
  data: {
    selectorId: number
  }
}

export type HoverMatchingElementMsg = Msg & HoverMatchingElementData
