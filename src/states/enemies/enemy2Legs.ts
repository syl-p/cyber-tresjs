import { LoopRepeat, type AnimationAction, type Object3D } from 'three'
import type { setEmitFlags } from 'typescript'
import { MovingEntity, State } from 'yuka'
import * as YUKA from 'yuka'

const ATTACK_ANIMATION = 'Attack'
const RUN_ANIMATION = 'Run'
const WALK_ANIMATION = 'Walk'
const IDLE_ANIMATION = 'Idle'
const CROSS_FADE_DURATION = 0.5

class Enemy2Legs extends YUKA.Vehicle {
  actions: { [p: string]: AnimationAction }
  attack: MovingEntity | undefined
  stateMachine = new YUKA.StateMachine(this)
  steeringBehaviors: {
    followPath: YUKA.FollowPathBehavior
    onPathBehavior: YUKA.OnPathBehavior
    pursuitBehavior: YUKA.PursuitBehavior
    wantedBehavior: YUKA.WanderBehavior
  } = {}
  path = new YUKA.Path()
  entityManager: YUKA.EntityManager | null = null
  wantedTimeOut: number | null = null

  constructor(actions: { [p: string]: AnimationAction }, object: Object3D) {
    super()
    this.actions = actions
    object.matrixAutoUpdate = false
    this.setRenderComponent(object, (entity, renderComponent) => {
      //@ts-expect-error
      renderComponent.matrix.copy(entity.worldMatrix)
    })

    this.initVehicle()
    this.initPursuitBehavior()

    this.stateMachine.add('PATROL', new PatrolState())
    this.stateMachine.add('IDLE', new IdleState())
    this.stateMachine.add('PURSUIT', new PursuitState())
    this.stateMachine.add('COOLDOWN', new CoolDownState())
    this.stateMachine.add('ATTACK', new AttackState())
    this.stateMachine.changeTo('IDLE')
  }

  setEntityManager(entityManager: YUKA.EntityManager) {
    this.entityManager = entityManager
    this.entityManager.add(this)
  }

  initVehicle() {
    this.maxSpeed = 2
    this.path.add(new YUKA.Vector3(0, 0, 5))
    this.path.add(new YUKA.Vector3(0, 0, 10))
    this.path.add(new YUKA.Vector3(10, 0, 10))
    this.path.add(new YUKA.Vector3(10, 0, 0))
    this.path.loop = true

    this.position.copy(this.path.current())

    this.steeringBehaviors.followPath = new YUKA.FollowPathBehavior(this.path, 0.5)
    this.steering.add(this.steeringBehaviors.followPath)

    this.steeringBehaviors.onPathBehavior = new YUKA.OnPathBehavior(this.path)
    this.steering.add(this.steeringBehaviors.onPathBehavior)
  }

  initPursuitBehavior() {
    this.steeringBehaviors.pursuitBehavior = new YUKA.PursuitBehavior()
    this.steeringBehaviors.pursuitBehavior.predictionFactor = 2
    this.steeringBehaviors.pursuitBehavior.active = false
    this.steering.add(this.steeringBehaviors.pursuitBehavior)
  }

  lookAndDetect() {
    if (!this.entityManager) return

    if (this.wantedTimeOut) {
      clearTimeout(this.wantedTimeOut)
    }

    const player: YUKA.MovingEntity = this.entityManager.getEntityByName('player')
    if (player) {
      const distance = player.position.distanceTo(
        new YUKA.Vector3(this.position.x, this.position.y, this.position.z),
      )

      if (distance < 5) {
        this.attack = player
        this.stateMachine.changeTo('PURSUIT')
      } else {
        this.attack = undefined
      }
    }
  }

  startWantedTarget() {
    this.wantedTimeOut = setTimeout(() => {
      this.stateMachine.changeTo('PATROL')
    }, 5000)
  }

  update(delta: number) {
    super.update(delta)
    this.stateMachine.update()
    this.lookAndDetect()
    return this
  }
}

class PatrolState extends State<Enemy2Legs> {
  enter(enemy: Enemy2Legs) {
    enemy.maxSpeed = 2
    enemy.steeringBehaviors.followPath.active = true
    enemy.steeringBehaviors.onPathBehavior.active = true
    const currAction = enemy.actions[WALK_ANIMATION]
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
  }

  execute(enemy: Enemy2Legs) {}

  exit(enemy: Enemy2Legs) {
    enemy.steeringBehaviors.followPath.active = false
    enemy.steeringBehaviors.onPathBehavior.active = false
    enemy.velocity.set(0, 0, 0)
    const idle = enemy.actions[WALK_ANIMATION]
    idle?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class IdleState extends State<Enemy2Legs> {
  enter(enemy: Enemy2Legs) {
    const currAction = enemy.actions[IDLE_ANIMATION]
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
  }
  execute(enemy: Enemy2Legs) {}
  exit(enemy: Enemy2Legs) {
    const idle = enemy.actions[IDLE_ANIMATION]
    idle?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class PursuitState extends State<Enemy2Legs> {
  enter(enemy: Enemy2Legs) {
    if (enemy?.attack) {
      enemy.maxSpeed = 6
      enemy.steeringBehaviors.pursuitBehavior.evader = enemy?.attack
      enemy.steeringBehaviors.pursuitBehavior.active = true
    }
    const currAction = enemy.actions[RUN_ANIMATION]
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
  }
  execute(enemy: Enemy2Legs) {
    if (!enemy.attack) {
      enemy.startWantedTarget()
    }
  }
  exit(enemy: Enemy2Legs) {
    enemy.steeringBehaviors.pursuitBehavior.active = false
    enemy.steeringBehaviors.pursuitBehavior.evader = null
    enemy.velocity.set(0, 0, 0)
    const idle = enemy.actions[RUN_ANIMATION]
    idle?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

// class CoolDownState extends State<Enemy2Legs> {
//   private onFinished: (() => void) | null = null

//   enter(enemy: Enemy2Legs) {
//     const currAction = enemy.actions[IDLE_ANIMATION]
//     currAction.reset().setLoop(LoopRepeat, 3).fadeIn(CROSS_FADE_DURATION).play()

//     this.onFinished = () => {
//       enemy.stateMachine.changeTo('PATROL')
//     }
//     currAction.getMixer().addEventListener('finished', this.onFinished)
//   }
//   execute(enemy: Enemy2Legs) {}
//   exit(enemy: Enemy2Legs) {
//     const currAction = enemy.actions[IDLE_ANIMATION]
//     if (this.onFinished) {
//       currAction?.getMixer().removeEventListener('finished', this.onFinished)
//     }
//     currAction?.fadeOut(CROSS_FADE_DURATION)
//   }
// }

class AttackState extends State<Enemy2Legs> {
  enter(enemy: Enemy2Legs) {
    enemy.maxSpeed = 0
    const currAction = enemy.actions[ATTACK_ANIMATION]
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
  }
  execute(enemy: Enemy2Legs) {}
  exit(enemy: Enemy2Legs) {
    const idle = enemy.actions[ATTACK_ANIMATION]
    idle?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

export { Enemy2Legs, PatrolState, IdleState, PursuitState, AttackState }
