<script setup lang="ts">
import FSM from '@/utils/fsm'
import { useGLTF } from '@tresjs/cientos'
import usePlayerControl from '@/composables/usePlayerControl.ts'
import useFollowingCamera from '@/composables/useFollowingCamera.ts'
import { IdleState, PlayerObject, RunState, WalkBackState, WalkState } from '@/states/player.ts'
import { Vector3 } from 'three'
import { config } from '@/gameConfig.ts'
import * as YUKA from 'yuka'
import { useGameStore } from '@/stores/game.ts'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRenderLoop } from '@tresjs/core'
const { scene, animations } = await useGLTF('/models/Character.gltf', { draco: true })
const topDownConfig = config.topDown
const gameStore = useGameStore()
const { entityManager } = storeToRefs(gameStore)
const object = ref()

const playerFsm = new FSM()
const playerObject = new PlayerObject(animations, scene)
playerFsm.addState('Idle', new IdleState(playerObject))
playerFsm.addState('Walk', new WalkState(playerObject))
playerFsm.addState('Run', new RunState(playerObject))
playerFsm.addState('Walk Back', new WalkBackState(playerObject))
playerFsm.setState('Idle')

const playerGameEntity = new YUKA.MovingEntity()
playerGameEntity.name = 'player'
entityManager.value.add(playerGameEntity)

usePlayerControl(scene, playerFsm)
useFollowingCamera(
  scene,
  new Vector3(
    topDownConfig.camera.position.x,
    topDownConfig.camera.position.y,
    topDownConfig.camera.position.z,
  ),
  new Vector3(
    topDownConfig.camera.lookAt.x,
    topDownConfig.camera.lookAt.y,
    topDownConfig.camera.lookAt.z,
  ),
  topDownConfig.camera.applyQuaternion,
)

const { onLoop } = useRenderLoop()

onLoop(({ delta }) => {
  if (object.value) {
    playerGameEntity.position.copy(
      new YUKA.Vector3(object.value.position.x, object.value.position.y, object.value.position.z),
    )
  }
})
</script>

<template>
  <primitive :object="scene" :cast-shadow="true" :receive-shadow="true" ref="object" />
</template>
