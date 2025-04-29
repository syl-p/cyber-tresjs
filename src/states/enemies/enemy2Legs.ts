import type Enemy2Legs from '@/agents/enemy2legs'
import * as YUKA from 'yuka'
import * as THREE from 'three'

const ATTACK_ANIMATION = 'Attack'
const RUN_ANIMATION = 'Run'
const WALK_ANIMATION = 'Walk'
const IDLE_ANIMATION = 'Idle'
const CROSS_FADE_DURATION = 0.5

class PatrolState extends YUKA.State<Enemy2Legs> {
  enter(enemy: Enemy2Legs) {
    enemy.steeringBehaviors.followPath.active = true
    enemy.steeringBehaviors.onPathBehavior.active = true
    const currAction = enemy.actions[WALK_ANIMATION]
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
  }

  execute(enemy: Enemy2Legs) {
    if (enemy.attack) enemy.stateMachine.changeTo('PURSUIT')
  }

  exit(enemy: Enemy2Legs) {
    enemy.steeringBehaviors.followPath.active = false
    enemy.steeringBehaviors.onPathBehavior.active = false
    const currAction = enemy.actions[WALK_ANIMATION]
    currAction?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class IdleState extends YUKA.State<Enemy2Legs> {
  enter(enemy: Enemy2Legs) {
    const currAction = enemy.actions[IDLE_ANIMATION]
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
  }
  execute() {}
  exit(enemy: Enemy2Legs) {
    const idle = enemy.actions[IDLE_ANIMATION]
    idle?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class PursuitState extends YUKA.State<Enemy2Legs> {
  enter(enemy: Enemy2Legs) {
    enemy.maxSpeed = 6
    if (enemy?.attack) {
      enemy.steeringBehaviors.pursuitBehavior.evader = enemy?.attack as YUKA.MovingEntity
      enemy.steeringBehaviors.pursuitBehavior.active = true
    }
    const currAction = enemy.actions[RUN_ANIMATION]
    currAction?.reset().fadeIn(CROSS_FADE_DURATION).play()
  }
  execute(enemy: Enemy2Legs) {
    if (enemy.attack === undefined) {
      // enemy.startWantedTarget()
      enemy.stateMachine.changeTo('COOL_DOWN')
    } else {
      const distance = enemy.attack.position.distanceTo(
        new YUKA.Vector3(enemy.position.x, enemy.position.y, enemy.position.z),
      )
      if (distance < 1) {
        enemy.stateMachine.changeTo('ATTACK')
      }
    }
  }
  exit(enemy: Enemy2Legs) {
    enemy.maxSpeed = 2
    enemy.steeringBehaviors.pursuitBehavior.active = false
    enemy.steeringBehaviors.pursuitBehavior.evader = null
    const idle = enemy.actions[RUN_ANIMATION]
    idle?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

class CoolDownState extends YUKA.State<Enemy2Legs> {
  private onFinished: (() => void) | null = null

  enter(enemy: Enemy2Legs) {
    enemy.velocity.set(0, 0, 0)
    const currAction = enemy.actions[IDLE_ANIMATION]
    currAction.reset().setLoop(THREE.LoopRepeat, 3).fadeIn(CROSS_FADE_DURATION).play()

    this.onFinished = () => {
      enemy.stateMachine.changeTo('PATROL')
    }
    currAction.getMixer().addEventListener('finished', this.onFinished)
  }
  execute(enemy: Enemy2Legs) {
    if (enemy.attack) {
      enemy.stateMachine.changeTo('PURSUIT')
    }
  }
  exit(enemy: Enemy2Legs) {
    const currAction = enemy.actions[IDLE_ANIMATION]
    if (this.onFinished) {
      currAction?.getMixer().removeEventListener('finished', this.onFinished)
    }
    currAction?.fadeOut(CROSS_FADE_DURATION)
  }
}

class AttackState extends YUKA.State<Enemy2Legs> {
  private onFinished: (() => void) | null = null

  enter(enemy: Enemy2Legs) {
    enemy.velocity.set(0, 0, 0)
    enemy.maxSpeed = 0
    const currAction = enemy.actions[ATTACK_ANIMATION]

    enemy.attackPlayer()
    currAction.reset().setLoop(THREE.LoopRepeat, 1).fadeIn(CROSS_FADE_DURATION).play()

    this.onFinished = () => {
      enemy.stateMachine.changeTo('ATTACK')
    }

    currAction.getMixer().addEventListener('finished', this.onFinished)
  }

  execute(enemy: Enemy2Legs) {
    if (enemy.attack === undefined) {
      enemy.stateMachine.changeTo('COOL_DOWN')
    } else {
      const distance = enemy.attack.position.distanceTo(
        new YUKA.Vector3(enemy.position.x, enemy.position.y, enemy.position.z),
      )
      if (distance > 1) {
        enemy.stateMachine.changeTo('PURSUIT')
      }
    }
  }

  exit(enemy: Enemy2Legs) {
    const idle = enemy.actions[ATTACK_ANIMATION]
    idle?.fadeOut(CROSS_FADE_DURATION).play()
  }
}

export { PatrolState, IdleState, PursuitState, CoolDownState, AttackState }
