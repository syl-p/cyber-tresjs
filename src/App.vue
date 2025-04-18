<script setup lang="ts">
import { Grid, Plane } from '@tresjs/cientos'
import Player from '@/components/Player.vue'
import Enemy2Legs from '@/components/enemies/Enemy2Legs.vue'
import Obstacles from '@/components/Obstacles.vue'

import { ContactShadows, Html } from '@tresjs/cientos'

import { useControls, TresLeches } from '@tresjs/leches'
import '@tresjs/leches/styles'
import { useGameStore } from './stores/game'
import { useRenderLoop } from '@tresjs/core'
import { storeToRefs } from 'pinia'
import * as YUKA from 'yuka'
import * as THREE from 'three'

const gameStore = useGameStore()
const { entityManager } = storeToRefs(gameStore)

useControls('fpsgraph')

const { onLoop } = useRenderLoop()
const time = new YUKA.Time()

const generateRandomOPositions = () => {
  // x and z
  const x = Math.random() * 20 - 20 / 2
  const z = Math.random() * 20 - 20 / 2

  return new THREE.Vector3(x, 0, z)
}

const patrolPoints = Array.from({ length: 5 }, () => {
  return generateRandomOPositions()
})

console.log(patrolPoints)

onLoop(({ delta }) => {
  const deltaFromYuka = time.update().getDelta()
  if (entityManager.value) {
    entityManager.value.update(deltaFromYuka)
  }
})
</script>

<template>
  <TresCanvas window-size :clear-color="0x01010a">
    <TresPerspectiveCamera />
    <TresGroup v-for="(point, index) in patrolPoints" :key="index">
      <Plane :args="[1, 1]" :position="point" color="teal" />
      <Html :position="point" center>
        <div class="text-white font-bold">Potrol point {{ index }}</div>
      </Html>
    </TresGroup>
    <Obstacles />
    <Suspense>
      <Player />
    </Suspense>
    <Suspense>
      <Enemy2Legs :patrol-points="patrolPoints" />
    </Suspense>
    <Grid
      :args="[10.5, 10.5]"
      cell-color="#82dbc5"
      :cell-size="0.5"
      :cell-thickness="0.5"
      section-color="#00ffcc"
      :section-size="2"
      :section-thickness="1.3"
      :infinite-grid="true"
      :fade-from="0"
      :fade-distance="12"
      :fade-strength="1"
    />
    <ContactShadows :position-y="-0.01" />
    <TresAmbientLight :intensity="1" />
    <TresDirectionalLight :position="[0, 20, 0]" :intensity="1" :cast-shadow="true" />
  </TresCanvas>
  <TresLeches />
</template>

<style scoped></style>
