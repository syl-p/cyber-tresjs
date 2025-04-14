import { useAnimations } from '@tresjs/cientos'
import type { AnimationAction, AnimationClip, Scene } from 'three'
import type State from '@/types/State.ts'
import * as YUKA from 'yuka'
import { GameEntity } from 'yuka'

const IDLE_ANIMATION = 'Idle_Sword'
const RUN_ANIMATION = 'Run'
const WALK_ANIMATION = 'Walk'
const WALK_BACK_ANIMATION = 'Run_Back'
const CROSS_FADE_DURATION = 0.2

class PlayerObject {
  actions: { [p: string]: AnimationAction }

  constructor(animations: AnimationClip[], scene: Scene) {
    const { actions } = useAnimations(animations, scene)
    this.actions = actions
    this.name = 'player'
  }
}

class IdleState implements State {
  player: PlayerObject

  constructor(player: PlayerObject) {
    this.player = player
  }

  get name() {
    return IDLE_ANIMATION
  }

  enter(previousState: State | null) {
    const currAction = this.player.actions[IDLE_ANIMATION]
    currAction.enabled = true
    // idle?.reset().fadeIn(CROSS_FADE_DURATION).play()
    if (previousState) {
      const previousAction = this.player.actions[previousState.name]
      // console.log(previousState.name + ' to ' + IDLE_ANIMATION)

      currAction.time = 0.0
      currAction.setEffectiveTimeScale(1.0)
      currAction.setEffectiveWeight(1.0)
      currAction.crossFadeFrom(previousAction, CROSS_FADE_DURATION, true)
      currAction.play()
    } else {
      currAction.play()
    }
  }

  execute() {}

  exit() {
    // const idle = this.player.actions[IDLE_ANIMATION]
    // idle?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class WalkState implements State {
  player: PlayerObject

  constructor(player: PlayerObject) {
    this.player = player
  }

  get name() {
    return WALK_ANIMATION
  }

  enter(previousState: State) {
    const currAction = this.player.actions[WALK_ANIMATION]
    currAction.enabled = true
    //currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
    if (previousState) {
      const prevAction = this.player.actions[previousState.name]
      // console.log(previousState.name + ' to ' + WALK_ANIMATION)

      if (previousState.name === RUN_ANIMATION) {
        const ratio = currAction.getClip().duration / prevAction.getClip().duration
        currAction.time = prevAction.time * ratio + 1
      } else {
        currAction.time = 0.0
        currAction.setEffectiveTimeScale(1.0)
        currAction.setEffectiveWeight(1.0)
      }

      currAction.crossFadeFrom(prevAction, CROSS_FADE_DURATION, true)
      currAction.play()
    } else {
      currAction.play()
    }
  }

  execute() {}

  exit() {
    // const walk = this.player.actions[WALK_ANIMATION]
    // walk?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class WalkBackState implements State {
  player: PlayerObject

  constructor(player: PlayerObject) {
    this.player = player
  }

  get name() {
    return WALK_BACK_ANIMATION
  }

  enter(previousState: State) {
    const currAction = this.player.actions[WALK_BACK_ANIMATION]
    currAction.enabled = true

    // walkBack?.reset().fadeIn(CROSS_FADE_DURATION).play()
    if (previousState) {
      const prevAction = this.player.actions[previousState.name]
      // console.log(previousState.name + ' to ' + WALK_BACK_ANIMATION)

      if (previousState.name === RUN_ANIMATION) {
        const ratio = currAction.getClip().duration / prevAction.getClip().duration
        currAction.time = prevAction.time * ratio + 1
      } else {
        currAction.time = 0.0
        currAction.setEffectiveTimeScale(1.0)
        currAction.setEffectiveWeight(1.0)
      }

      currAction.crossFadeFrom(prevAction, CROSS_FADE_DURATION, true)
      currAction.play()
    } else {
      currAction.play()
    }
  }

  execute() {}

  exit() {
    // const walkBack = this.player.actions[WALK_BACK_ANIMATION]
    // walkBack?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class RunState implements State {
  player: PlayerObject

  constructor(player: PlayerObject) {
    this.player = player
  }

  get name() {
    return RUN_ANIMATION
  }

  enter(previousState: State) {
    const currAction = this.player.actions[RUN_ANIMATION]
    // currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
    currAction.enabled = true
    if (previousState) {
      const prevAction = this.player.actions[previousState.name]
      // console.log(previousState.name + ' to ' + RUN_ANIMATION)

      if (previousState.name === WALK_ANIMATION) {
        const ratio = currAction.getClip().duration / prevAction.getClip().duration
        currAction.time = prevAction.time * ratio + 3

        // console.log('currAction.time : ' + currAction.time)
      } else {
        currAction.time = 0.0
        currAction.setEffectiveTimeScale(1.0)
        currAction.setEffectiveWeight(1.0)
      }

      currAction.crossFadeFrom(prevAction, CROSS_FADE_DURATION, true)
      currAction.play()
    } else {
      currAction.play()
    }
  }

  execute() {}

  exit() {
    // const run = this.player.actions[RUN_ANIMATION]
    // run?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

export { PlayerObject, IdleState, WalkState, WalkBackState, RunState }
