import { useRenderLoop, useTresContext } from '@tresjs/core'
import { useControls } from '@tresjs/leches'
import { Scene, Vector3 } from 'three'

export default (
  model: Scene,
  defaultOffset: Vector3,
  defaultLookAt: Vector3,
  defaultApplyQuaternion: boolean = true,
) => {
  const { camera } = useTresContext()
  const { offset, lookAt, applyQuaternion } = useControls({
    offset: { value: defaultOffset, isVector3: true },
    lookAt: { value: defaultLookAt, isVector3: true },
    applyQuaternion: defaultApplyQuaternion,
  })

  const currentPosition = new Vector3()
  const currentLookAt = new Vector3()

  function calculateOffset() {
    const idealOffset = offset.value.value.clone()
    if (applyQuaternion.value.value) idealOffset.applyQuaternion(model.quaternion)

    idealOffset.add(model.position)
    return idealOffset
  }

  function calculateLookAt() {
    const idealLookAt = lookAt.value.value.clone()
    if (applyQuaternion.value.value) idealLookAt.applyQuaternion(model.quaternion)

    idealLookAt.add(model.position)
    return idealLookAt
  }

  const { onLoop } = useRenderLoop()

  onLoop(({ delta }) => {
    if (!model) return
    const delay = delta * 1.5

    const idealOffset = calculateOffset()
    const idealLookAt = calculateLookAt()

    currentPosition.lerp(idealOffset, delay)
    currentLookAt.lerp(idealLookAt, delay)

    if (camera.value) {
      camera.value.position.copy(currentPosition)
      camera.value.lookAt(currentLookAt)
    }
  })
}
