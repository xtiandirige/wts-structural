import * as THREE from 'three'
import Experience from './Experience.js'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'

export default class Renderer {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.setWEBGLInstance()
        this.setCSS3DInstance()
    }

    setWEBGLInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        })
        this.instance.physicallyCorrectLights = true
        this.instance.outputEncoding = THREE.sRGBEncoding
        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1.75
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
    }
    setCSS3DInstance() {
        this.instance2 = new CSS3DRenderer({
            element: document.querySelector('#css')
        })
        // this.instance2.domElement.style.position = 'absolute'
        // this.instance2.domElement.style.top = 0
        this.instance2.setSize(this.sizes.width, this.sizes.height)
    }
    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
        this.instance2.setSize(this.sizes.width, this.sizes.height)
    }
    update() {
        this.instance.render(this.scene, this.camera.instance)
        this.instance2.render(this.scene, this.camera.instance)
    }
}