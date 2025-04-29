import * as THREE from 'three'

const config = {
  topDown: {
    camera: {
      offset: new THREE.Vector3(-7, 8.5, -6),
      lookAt: new THREE.Vector3(0, 0, 0),
      applyQuaternion: false,
    },
  },
  tps: {
    camera: {
      offset: new THREE.Vector3(-1.5, 1.5, -4.5),
      lookAt: new THREE.Vector3(0, 1, 10.5),
      applyQuaternion: true,
    },
  },
}

export { config }
