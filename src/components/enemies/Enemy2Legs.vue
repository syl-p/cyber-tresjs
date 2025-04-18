<script setup lang="ts">
import { useAnimations, useGLTF, Html } from '@tresjs/cientos'
import { nextTick, ref, watch, watchEffect } from 'vue'
import { useGameStore } from '@/stores/game.ts'
import { storeToRefs } from 'pinia'
import Enemy2Legs from '@/agents/enemy2legs'
import { useControls } from '@tresjs/leches'
const { scene, animations } = await useGLTF('/models/enemies/Enemy_2Legs.gltf', { draco: true })
const gameStore = useGameStore()
const { entityManager } = storeToRefs(gameStore)
const object = ref()
let enemy2LegsObject!: Enemy2Legs
const { actions } = useAnimations(animations, scene)
const props = defineProps(['patrolPoints'])

// INIT ENEMY AGENT
watch(
  [object, entityManager],
  async (value) => {
    const [objectValue, entityManagerValue] = value
    if (objectValue && entityManagerValue) {
      enemy2LegsObject = new Enemy2Legs(
        actions,
        objectValue,
        entityManagerValue,
        props.patrolPoints,
      )
      entityManagerValue.add(enemy2LegsObject)
    }
  },
  {
    once: true,
  },
)
</script>

<template>
  <primitive :object="scene" ref="object">
    <Html center position-y="1.5">
      <div class="text-white font-bold">Enemy 2 Legs</div>
    </Html>
  </primitive>
</template>

<style scoped></style>
