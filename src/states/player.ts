import MessageType from '@/types/MessageType'
import type { AnimationAction } from 'three'
import * as YUKA from 'yuka'
import * as THREE from 'three'

const IDLE_ANIMATION = 'Idle_Sword'
const RUN_ANIMATION = 'Run'
const WALK_ANIMATION = 'Walk'
const HIT_ANIMATION = 'HitRecieve'
const WALK_BACK_ANIMATION = 'Run_Back'
const CROSS_FADE_DURATION = 0.2

class PlayerObject extends YUKA.MovingEntity {
  object: THREE.Object3D
  actions: { [p: string]: AnimationAction }
  stateMachine: YUKA.StateMachine<PlayerObject> = new YUKA.StateMachine(this)

  constructor(actions: { [p: string]: AnimationAction }, object: THREE.Object3D) {
    super()
    this.actions = actions
    this.name = 'player'
    this.object = object

    this.setRenderComponent(object, (entity, renderComponent) => {
      //@ts-expect-error
      renderComponent.matrix.copy(entity.worldMatrix)
    })

    this.stateMachine.add('Idle', new IdleState())
    this.stateMachine.add('Walk', new WalkState())
    this.stateMachine.add('Run', new RunState())
    this.stateMachine.add('Walk Back', new WalkBackState())
    this.stateMachine.add('Hit', new HitState())
    this.stateMachine.changeTo('Idle')
  }

  handleMessage(telegram: YUKA.Telegram): boolean {
    const message = telegram.message

    switch (message) {
      case MessageType.ATTACK:
        this.stateMachine.changeTo('Hit')
        // console.log('PlayerObject: ATTACK message received.')
        return true

      default:
        console.warn('Collectible: Unknown message.')
    }

    return false
  }

  update(delta: number): this {
    super.update(delta)
    if (this.object && this.object.position) this.position.copy(this.object.position)
    return this
  }
}

class IdleState extends YUKA.State<PlayerObject> {
  get name() {
    return IDLE_ANIMATION
  }

  enter(owner: PlayerObject | null) {
    const currAction = owner.actions[IDLE_ANIMATION]
    currAction.enabled = true
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()

    // if (previousState) {
    //   const previousAction = owner.actions[previousState.name]
    //   // console.log(previousState.name + ' to ' + IDLE_ANIMATION)

    //   currAction.time = 0.0
    //   currAction.setEffectiveTimeScale(1.0)
    //   currAction.setEffectiveWeight(1.0)
    //   currAction.crossFadeFrom(previousAction, CROSS_FADE_DURATION, true)
    //   currAction.play()
    // } else {
    //   currAction.play()
    // }
  }

  execute(owner: PlayerObject) {}

  exit(owner: PlayerObject) {
    const idle = owner.actions[IDLE_ANIMATION]
    idle?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class WalkState extends YUKA.State<PlayerObject> {
  get name() {
    return WALK_ANIMATION
  }

  enter(owner: PlayerObject) {
    const currAction = owner.actions[WALK_ANIMATION]
    currAction.enabled = true
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()

    // if (previousState) {
    //   const prevAction = owner.actions[previousState.name]
    //   // console.log(previousState.name + ' to ' + WALK_ANIMATION)

    //   if (previousState.name === RUN_ANIMATION) {
    //     const ratio = currAction.getClip().duration / prevAction.getClip().duration
    //     currAction.time = prevAction.time * ratio + 1
    //   } else {
    //     currAction.time = 0.0
    //     currAction.setEffectiveTimeScale(1.0)
    //     currAction.setEffectiveWeight(1.0)
    //   }

    //   currAction.crossFadeFrom(prevAction, CROSS_FADE_DURATION, true)
    //   currAction.play()
    // } else {
    //   currAction.play()
    // }
  }

  execute() {}

  exit(owner: PlayerObject) {
    const walk = owner.actions[WALK_ANIMATION]
    walk?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class WalkBackState extends YUKA.State<PlayerObject> {
  get name() {
    return WALK_BACK_ANIMATION
  }

  enter(owner: PlayerObject) {
    const currAction = owner.actions[WALK_BACK_ANIMATION]
    currAction.enabled = true
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
    // if (previousState) {
    //   const prevAction = owner.actions[previousState.name]
    //   // console.log(previousState.name + ' to ' + WALK_BACK_ANIMATION)

    //   if (previousState.name === RUN_ANIMATION) {
    //     const ratio = currAction.getClip().duration / prevAction.getClip().duration
    //     currAction.time = prevAction.time * ratio + 1
    //   } else {
    //     currAction.time = 0.0
    //     currAction.setEffectiveTimeScale(1.0)
    //     currAction.setEffectiveWeight(1.0)
    //   }

    //   currAction.crossFadeFrom(prevAction, CROSS_FADE_DURATION, true)
    //   currAction.play()
    // } else {
    //   currAction.play()
    // }
  }

  execute() {}

  exit(owner: PlayerObject) {
    const walkBack = owner.actions[WALK_BACK_ANIMATION]
    walkBack?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class RunState extends YUKA.State<PlayerObject> {
  get name() {
    return RUN_ANIMATION
  }

  enter(owner: PlayerObject) {
    const currAction = owner.actions[RUN_ANIMATION]
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
    currAction.enabled = true
    // if (previousState) {
    //   const prevAction = owner.actions[previousState.name]
    //   // console.log(previousState.name + ' to ' + RUN_ANIMATION)

    //   if (previousState.name === WALK_ANIMATION) {
    //     const ratio = currAction.getClip().duration / prevAction.getClip().duration
    //     currAction.time = prevAction.time * ratio + 3

    //     // console.log('currAction.time : ' + currAction.time)
    //   } else {
    //     currAction.time = 0.0
    //     currAction.setEffectiveTimeScale(1.0)
    //     currAction.setEffectiveWeight(1.0)
    //   }

    //   currAction.crossFadeFrom(prevAction, CROSS_FADE_DURATION, true)
    //   currAction.play()
    // } else {
    //   currAction.play()
    // }
  }

  execute() {}

  exit(owner: PlayerObject) {
    const run = owner.actions[RUN_ANIMATION]
    run?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class HitState extends YUKA.State<PlayerObject> {
  private onFinished: (() => void) | null = null

  enter(owner: PlayerObject) {
    const currAction = owner.actions[HIT_ANIMATION]
    currAction
      .reset()
      .setLoop(THREE.LoopRepeat, 1)
      .fadeIn(CROSS_FADE_DURATION * 0.8)
      .play()

    this.onFinished = () => {
      owner.stateMachine.changeTo('Idle')
    }

    currAction.getMixer().addEventListener('finished', this.onFinished)
  }
  execute() {}
  exit() {}
}

export { PlayerObject, IdleState, WalkState, WalkBackState, RunState, HitState }
