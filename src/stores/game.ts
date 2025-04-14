import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as YUKA from 'yuka'

export const useGameStore = defineStore('game', () => {
  const entityManager = ref(new YUKA.EntityManager())
  return { entityManager }
})
