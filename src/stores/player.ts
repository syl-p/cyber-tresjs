import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AnimationClip } from 'three'

export const usePlayerStore = defineStore('player', () => {
  const health = ref(100)
  const animations = ref<AnimationClip | null>(null)

  return {health, animations}
})
