export default class KeyControllerInput {
  public keys: { [s: string]: boolean } = {}

  constructor(callbackDown: () => void, callbackUp: () => void) {
    document.addEventListener('keydown', (e) => this.onKeyDown(e, callbackDown))
    document.addEventListener('keyup', (e) => this.onKeyUp(e, callbackUp))
  }

  private onKeyDown(e: KeyboardEvent, callback: () => void) {
    this.keys[e.key.toLowerCase()] = true
    callback()
  }

  private onKeyUp(e: KeyboardEvent, callback: () => void) {
    this.keys[e.key.toLowerCase()] = false
    callback()
  }
}
