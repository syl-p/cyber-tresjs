export default class KeyControllerInput {
  public keys: { [s: string]: boolean } = {}
  public mousePosition: { x: number; y: number } = { x: 0, y: 0 }

  constructor(callbackDown: () => void, callbackUp: () => void) {
    document.addEventListener('keydown', (e) => this.onKeyDown(e, callbackDown))
    document.addEventListener('keyup', (e) => this.onKeyUp(e, callbackUp))
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
      this.mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1
    })
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
