import type State from '@/types/State.ts'

export default class FSM {
  currentState: State | null = null
  states: Record<string, State> = {}
  previous: State | null = null

  constructor() {}

  addState(name: string, state: State) {
    this.states[name] = state
  }

  setState(name: string) {
    if (this.states[name]) {
      if (this.currentState && this.currentState.exit) {
        this.currentState.exit()
        this.previous = this.currentState
      }

      this.currentState = this.states[name]

      if (this.currentState.enter) {
        this.currentState.enter(this.previous)
      }
    }
  }

  update() {
    if (this.currentState && this.currentState.execute) {
      this.currentState.execute()
    }
  }
}
