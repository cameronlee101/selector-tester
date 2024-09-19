export type Msg = {
  type: MsgType
}

export enum MsgType {
  MATCHING_ELEMENTS,
  NEW_SELECTOR
}

export type NewSelectorData = {
  data: {
    selector: string
  }
}

export type NewSelectorMsg = Msg & NewSelectorData

export type MatchingElementData = {
  data: {
    elements: string[]
    numOfElements: number
  }
}

export type MatchingElementMsg = Msg & MatchingElementData
