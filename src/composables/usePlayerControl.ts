import { useRenderLoop } from '@tresjs/core'
import { ref, shallowRef } from 'vue'
import KeyControllerInput from '@/utils/keyControllerInput.ts'
import type FSM from '@/utils/fsm.ts'
import { Object3D, Quaternion, Vector3 } from 'three'
const DIRECTIONS = ['w', 'a', 's', 'd']
const WALK_VELOCITY = 2
const RUN_VELOCITY = 5

export default (model: Object3D, fsm: FSM) => {
  const toggleRun = shallowRef(false)
  const currentAction = shallowRef('')

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
    if (currentAction.value != action) {
      currentAction.value = action
      fsm.setState(action)
    }
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
      const _Q = new Quaternion()
      const _A = new Vector3()
      const _R = model.quaternion.clone()

      // left or right
      if (input.value.keys.a) {
        _A.set(0, 1, 0)
        _Q.setFromAxisAngle(_A, 4.0 * Math.PI * delta * 0.5)
        _R.multiply(_Q)
      }

      if (input.value.keys.d) {
        _A.set(0, 1, 0)
        _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * delta * 0.5)
        _R.multiply(_Q)
      }

      model.quaternion.copy(_R)
      // Forward is direction
      const forward = new Vector3(0, 0, 1)
      forward.applyQuaternion(model.quaternion) // Apply rotation
      forward.normalize()

      if (input.value.keys.s) velocity *= -1
      forward.multiplyScalar(velocity * delta) // Apply velocity on z axe
      model.position.add(forward)
    }

    updateState(play)
  })
}
