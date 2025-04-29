<script setup lang="ts">
import { useAnimations, useGLTF } from '@tresjs/cientos'
import useFollowingCamera from '@/composables/useFollowingCamera.ts'
import { PlayerObject } from '@/states/player.ts'
import { useGameStore } from '@/stores/game.ts'
import { storeToRefs } from 'pinia'
import { ref, watchEffect } from 'vue'
import usePlayerControlMouse from '@/composables/usePlayerControlMouse'
import * as YUKA from 'yuka'
const { scene, animations } = await useGLTF('/models/Character.gltf', { draco: true })
const { actions } = useAnimations(animations, scene)
const gameStore = useGameStore()
const { entityManager } = storeToRefs(gameStore)
const object = ref()
const playerStateMachine = ref<YUKA.StateMachine<PlayerObject>>()
let playerObject: PlayerObject | undefined = undefined

usePlayerControlMouse(scene, playerStateMachine)
useFollowingCamera(scene)

watchEffect(() => {
  if (object.value) {
    playerObject = new PlayerObject(actions, object.value)
    playerStateMachine.value = playerObject.stateMachine
    entityManager.value.add(playerObject)
  }
})
</script>

<template>
  <primitive :object="scene" :cast-shadow="true" :receive-shadow="true" ref="object" />
</template>
