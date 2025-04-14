import * as THREE from 'three'

const calculateObjectSize = (object: THREE.Object3D) => {
  const bbox = new THREE.Box3()
  const vec3 = new THREE.Vector3()

  bbox.expandByObject(object)
  const size = bbox.getSize(vec3)
  return { size }
}

export { calculateObjectSize }
