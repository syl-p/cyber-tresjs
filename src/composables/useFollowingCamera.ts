import { config } from '@/gameConfig'
import { useRenderLoop, useTresContext } from '@tresjs/core'
import { useControls } from '@tresjs/leches'
import { Scene, Vector3 } from 'three'
import { computed } from 'vue'

export default (model: Scene) => {
  const { camera } = useTresContext()
  const { value } = useControls({
    gameplay: {
      value: 'topDown',
      options: ['topDown', 'tps'],
    },
  })

  const gamePlayConfiguration = computed(() => {
    return config[value.value]
  })

  const currentPosition = new Vector3()
  const currentLookAt = new Vector3()

  function calculateOffset() {
    const idealOffset = gamePlayConfiguration.value.camera.offset.clone()
    if (gamePlayConfiguration.value.camera.applyQuaternion)
      idealOffset.applyQuaternion(model.quaternion)

    idealOffset.add(model.position)
    return idealOffset
  }

  function calculateLookAt() {
    const idealLookAt = gamePlayConfiguration.value.camera.lookAt.clone()
    if (gamePlayConfiguration.value.camera.applyQuaternion)
      idealLookAt.applyQuaternion(model.quaternion)

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
