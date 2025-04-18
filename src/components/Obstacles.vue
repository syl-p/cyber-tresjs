<template></template>

<script setup lang="ts">
import { useTresContext } from '@tresjs/core'
import { watchEffect } from 'vue'
import * as THREE from 'three'
import * as YUKA from 'yuka'
import { useGameStore } from '@/stores/game'
import { storeToRefs } from 'pinia'

const gameStore = useGameStore()
const { entityManager } = storeToRefs(gameStore)

const meshes = [
  { position: new THREE.Vector3(0, 0, 10), depth: 4, rotation: Math.PI },
  { position: new THREE.Vector3(-5, 0, 3), depth: 5, rotation: -Math.PI },
  { position: new THREE.Vector3(-2, 0, 0), depth: 5, rotation: -Math.PI },
  { position: new THREE.Vector3(-4, 0, -6), depth: 3, rotation: -Math.PI / 2 },
  { position: new THREE.Vector3(10, 0, 3), depth: 10, rotation: Math.PI / 2 },
]

const { scene } = useTresContext()

function createObstaclesFromBoxMesh(
  mesh: THREE.Mesh,
  manager: YUKA.EntityManager,
  scene: THREE.Scene,
  obstacleRadius = 0.5,
  spacing = 1,
) {
  // On suppose que c’est une BoxGeometry centrée
  const size = new THREE.Vector3()
  new THREE.Box3().setFromObject(mesh).getSize(size)

  const length = Math.max(size.x, size.z) // on considère l’axe le plus long
  const count = Math.floor(length / spacing)
  const direction = new THREE.Vector3(1, 0, 0) // par défaut sur X

  // Si le mesh est tourné, il faut appliquer sa rotation
  direction.applyQuaternion(mesh.quaternion).normalize()

  const start = new THREE.Vector3()
    .copy(mesh.position)
    .addScaledVector(direction, -length / 2 + spacing / 2)

  for (let i = 0; i <= count; i++) {
    const pos = new THREE.Vector3().copy(start).addScaledVector(direction, i * spacing)

    const obstacle = new YUKA.GameEntity()
    obstacle.name = 'obstacle'
    obstacle.position.set(pos.x, pos.y, pos.z)
    obstacle.boundingRadius = obstacleRadius

    manager.add(obstacle)

    // ⬇️ (optionnel) debug : représenter les obstacles visuellement
    const debugSphere = new THREE.Mesh(
      new THREE.SphereGeometry(obstacleRadius, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }),
    )
    debugSphere.position.copy(pos)
    scene.add(debugSphere)
  }
}

watchEffect(() => {
  if (scene.value && entityManager.value) {
    meshes.forEach((mesh) => {
      // Add to scene
      const { position, rotation, depth } = mesh
      const geometry = new THREE.BoxGeometry(1, 1, depth)
      geometry.computeBoundingSphere()
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      const cube = new THREE.Mesh(geometry, material)
      cube.position.copy(position)
      cube.rotation.set(0, rotation, 0)
      // scene.value.add(cube)

      createObstaclesFromBoxMesh(cube, entityManager.value, scene.value)

      // // Add to entity manager
      // const obstacle = new YUKA.GameEntity()
      // obstacle.name = `obstacle`
      // obstacle.position.set(position.x, position.y, position.z)
      // obstacle.boundingRadius = geometry.boundingSphere?.radius

      // obstacle.setRenderComponent(cube, (entity, renderComponent) => {
      //   // @ts-expect-error
      //   renderComponent.matrix.copy(entity.worldMatrix)
      //   // renderComponent.matrixAutoUpdate = false
      // })

      // const sphere = new THREE.SphereGeometry(obstacle.boundingRadius, 30, 30)
      // const object = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial())
      // object.position.copy(cube.position)
      // const box = new THREE.BoxHelper(object, 0xffff00)
      // scene.value.add(box)

      // entityManager.value.add(obstacle)
    })
  }
})
</script>
