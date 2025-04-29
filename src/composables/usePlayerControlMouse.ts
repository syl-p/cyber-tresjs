import { useRenderLoop, useTresContext } from '@tresjs/core'
import { ref, shallowRef, type Ref } from 'vue'
import KeyControllerInput from '@/utils/keyControllerInput.ts'
import * as THREE from 'three'
import * as YUKA from 'yuka'
import type { PlayerObject } from '@/states/player'
import type FSM from '@/utils/fsm'
const DIRECTIONS = ['w', 'a', 's', 'd']
const WALK_VELOCITY = 2
const RUN_VELOCITY = 5

export default (model: THREE.Object3D, fsm: Ref<YUKA.StateMachine<PlayerObject>>) => {
  const toggleRun = shallowRef(false)
  const currentAction = shallowRef('')
  const raycaster = new THREE.Raycaster()
  const { camera } = useTresContext()

  const input = ref(
    new KeyControllerInput(
      () => {
        if (input.value.keys.shift) {
          toggleRun.value = true
        }
      },
      () => {
        if (!input.value.keys.shift) {
          toggleRun.value = false
        }
      },
    ),
  )

  const updateState = (action: string) => {
    if (!fsm || !fsm.value) return

    if (currentAction.value != action) {
      currentAction.value = action
      fsm.value.changeTo(action)
    }
  }

  const getMouseWorldPosition = (camera: THREE.Camera) => {
    raycaster.setFromCamera(
      new THREE.Vector2(input.value.mousePosition.x, input.value.mousePosition.y),
      camera,
    )

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersectionPoint = new THREE.Vector3()

    raycaster.ray.intersectPlane(plane, intersectionPoint)
    return intersectionPoint
  }

  const updateRotation = (model: THREE.Object3D, camera: THREE.Camera) => {
    const mouseWorldPosition = getMouseWorldPosition(camera)
    const dx = mouseWorldPosition.x - model.position.x
    const dz = mouseWorldPosition.z - model.position.z

    const angle = Math.atan2(dx, dz) // Attention à l'ordre pour top-down
    model.rotation.y = angle
  }

  const { onLoop } = useRenderLoop()
  onLoop(({ delta }) => {
    const directionUsed = DIRECTIONS.some((key) => input.value.keys[key] === true)
    let velocity = toggleRun.value ? RUN_VELOCITY : WALK_VELOCITY

    let play = ''
    if (directionUsed) {
      if (toggleRun.value) {
        play = 'Run'
      } else {
        play = 'Walk'
      }
    } else {
      play = 'Idle'
    }

    if (currentAction.value == 'Walk' || currentAction.value == 'Run') {
      if (camera.value) updateRotation(model, camera.value)

      // Forward is direction
      const forward = new THREE.Vector3(0, 0, 1)
      forward.applyQuaternion(model.quaternion) // Apply rotation
      forward.normalize()

      if (input.value.keys.s) velocity *= -1
      forward.multiplyScalar(velocity * delta) // Apply velocity on z axe
      model.position.add(forward)
    }

    updateState(play)
  })
}
