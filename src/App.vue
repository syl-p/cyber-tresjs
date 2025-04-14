<script setup lang="ts">
import { Grid } from '@tresjs/cientos'
import Player from '@/components/Player.vue'
import Enemy2Legs from '@/components/enemies/Enemy2Legs.vue'

import { ContactShadows } from '@tresjs/cientos'

import { useControls, TresLeches } from '@tresjs/leches'
import '@tresjs/leches/styles'
import { useGameStore } from './stores/game'
import { useRenderLoop } from '@tresjs/core'
import { storeToRefs } from 'pinia'
import * as YUKA from 'yuka'

const gameStore = useGameStore()
const { entityManager } = storeToRefs(gameStore)

useControls('fpsgraph')

const { onLoop } = useRenderLoop()
const time = new YUKA.Time()

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
    <!-- <OrbitControls /> -->
    <Suspense>
      <Player />
    </Suspense>
    <Suspense>
      <Enemy2Legs />
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
    <DirectionalLight :position="[0, 20, 0]" :intensity="1" :cast-shadow="true" />
  </TresCanvas>
  <TresLeches />
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
