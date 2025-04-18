import * as YUKA from 'yuka'
import * as THREE from 'three'
import {
  PatrolState,
  PursuitState,
  CoolDownState,
  IdleState,
  AttackState,
} from '@/states/enemies/enemy2Legs'

export default class Enemy2Legs extends YUKA.Vehicle {
  actions: { [p: string]: THREE.AnimationAction }
  stateMachine = new YUKA.StateMachine(this)
  steeringBehaviors = {
    followPath: new YUKA.FollowPathBehavior(),
    onPathBehavior: new YUKA.OnPathBehavior(),
    pursuitBehavior: new YUKA.PursuitBehavior(),
    obstacleAvoidanceBehavior: new YUKA.ObstacleAvoidanceBehavior(),
  }
  path = new YUKA.Path()
  entityManager: YUKA.EntityManager | null = null
  attack: YUKA.GameEntity | undefined
  lastAttackVision: number | null = null

  constructor(
    actions: { [p: string]: THREE.AnimationAction },
    object: THREE.Object3D,
    entityManager: YUKA.EntityManager,
    patrolPoints: { x: number; y: number; z: number }[],
  ) {
    super()
    this.smoother = new YUKA.Smoother(3)
    this.actions = actions
    this.entityManager = entityManager
    object.matrixAutoUpdate = false

    const boundingBox = new THREE.Box3().setFromObject(object)
    const size = new THREE.Vector3()
    boundingBox.getSize(size)
    this.boundingRadius = size.length() / 2

    this.setRenderComponent(object, (entity, renderComponent) => {
      //@ts-expect-error
      renderComponent.matrix.copy(entity.worldMatrix)
    })

    this.initPath(patrolPoints)
    this.initPursuitBehavior()
    this.initObstacleAvoidanceBehavior()

    this.stateMachine.add('PATROL', new PatrolState())
    this.stateMachine.add('IDLE', new IdleState())
    this.stateMachine.add('PURSUIT', new PursuitState())
    this.stateMachine.add('COOL_DOWN', new CoolDownState())
    this.stateMachine.add('ATTACK', new AttackState())
    this.stateMachine.changeTo('PATROL')
  }

  private initPath(patrolPoints: { x: number; y: number; z: number }[]) {
    this.smoother = new YUKA.Smoother(15)
    patrolPoints.forEach((p) => {
      this.path.add(new YUKA.Vector3(p.x, p.y, p.z))
    })
    this.path.loop = true

    this.position.copy(this.path.current())

    this.steeringBehaviors.followPath.path = this.path
    this.steering.add(this.steeringBehaviors.followPath)
    this.steeringBehaviors.onPathBehavior.path = this.path
    this.steering.add(this.steeringBehaviors.onPathBehavior)
  }

  private initPursuitBehavior() {
    this.steeringBehaviors.pursuitBehavior.weight = 1
    this.steeringBehaviors.pursuitBehavior.active = false
    this.steering.add(this.steeringBehaviors.pursuitBehavior)
  }

  private initObstacleAvoidanceBehavior() {
    this.steeringBehaviors.obstacleAvoidanceBehavior.active = true
    this.steeringBehaviors.obstacleAvoidanceBehavior.brakingWeight = 0.4
    this.steeringBehaviors.obstacleAvoidanceBehavior.weight = 10
    if (this.entityManager) {
      const obstacles = this.entityManager.entities.filter((e) => e.name === 'obstacle')
      console.log('obstacles', obstacles.length)
      this.steeringBehaviors.obstacleAvoidanceBehavior.obstacles = obstacles
    }
    this.steering.add(this.steeringBehaviors.obstacleAvoidanceBehavior)
  }

  private lookAndDetect() {
    if (!this.entityManager) return

    const player = this.entityManager.getEntityByName('player')
    if (player) {
      const distance = player.position.distanceTo(
        new YUKA.Vector3(this.position.x, this.position.y, this.position.z),
      )

      this.setTargetLastVision(distance < 10 ? player : undefined)
    }
  }

  public setTargetLastVision(target: YUKA.GameEntity | undefined) {
    if (target && this.attack === undefined) {
      console.log('Target !!!')
      if (this.attack == undefined) this.attack = target
    } else {
      console.log('Hmmm, I lost my target search arround')
      this.lastAttackVision = setTimeout(() => {
        console.log('Sh**, go back to my patrol job ?')
        this.attack = target
      }, 2000)
    }
  }

  public update(delta: number) {
    super.update(delta)
    this.stateMachine.update()
    this.lookAndDetect()
    return this
  }
}
