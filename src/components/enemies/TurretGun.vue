<script setup lang="ts">
import { useGLTF } from '@tresjs/cientos'
const { scene, animations } = await useGLTF('/models/Turret_Gun.gltf', { draco: true })
console.log(animations)
</script>

<template>
  <primitive :object="scene"/>
</template>

<style scoped>

</style>
