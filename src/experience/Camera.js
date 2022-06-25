import * as THREE from 'three'
import Experience from "./Experience"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.setPerspectiveCameraInstance()
        // this.setOrbitControls()
    }

    setPerspectiveCameraInstance() {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height)
        this.instance.position.set(0, 0, 15)
        this.cameraGroup = new THREE.Group()
        this.scene.add(this.cameraGroup.add(this.instance))
    }
    positionCamera(positionVector) {
        this.cameraGroup.position.set(positionVector.x, positionVector.y, positionVector.z)
    }
    setOrbitControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
    }
    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }
    update() {
        // this.controls.update()
    }
}