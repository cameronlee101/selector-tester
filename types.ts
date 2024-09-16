export type Request = {
  type: MessageType
}

export enum MessageType {
  TO_POPUP,
  TO_SCRIPT
}

export type PopupMessage = Request & {
  data: {
    selector: string
  }
}

export type ScriptData = Request & {
  data: {
    elements: string[]
    numOfElements: number
  }
}
