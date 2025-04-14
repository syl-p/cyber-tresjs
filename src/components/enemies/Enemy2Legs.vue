<script setup lang="ts">
import { useAnimations, useGLTF, Html } from '@tresjs/cientos'
import { ref, watch } from 'vue'
import * as YUKA from 'yuka'
import { Enemy2Legs } from '@/states/enemies/enemy2Legs.ts'
import { useGameStore } from '@/stores/game.ts'
import { storeToRefs } from 'pinia'
const { scene, animations } = await useGLTF('/models/enemies/Enemy_2Legs.gltf', { draco: true })
const gameStore = useGameStore()
const { entityManager } = storeToRefs(gameStore)
const object = ref()
let enemy2LegsObject: Enemy2Legs
const { actions } = useAnimations(animations, scene)

// INIT ENEMY AGENT
watch(
  object,
  (objectValue) => {
    if (objectValue) {
      enemy2LegsObject = new Enemy2Legs(actions, objectValue)
      enemy2LegsObject.setEntityManager(entityManager.value)
    }
  },
  {
    once: true,
  },
)
</script>

<template>
  <primitive :object="scene" ref="object">
    <Html center position-y="1.5"> Enemy 2 Legs </Html>
  </primitive>
</template>

<style scoped></style>
