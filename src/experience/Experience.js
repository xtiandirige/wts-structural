import * as THREE from 'three'
import Debug from './utils/Debug'
import Sizes from "./utils/Sizes"
import Time from "./utils/Time"
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './world-1/World.js'
import Resources from './utils/Resources'
import sources from './sources'

let instance = null

export default class Experience {
    constructor(canvas) {
        if (instance) {
            return instance
        }
        instance = this
        window.experience = this
        this.canvas = canvas
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.sizes.on('resize', () => {
            this.resize()
        })
        this.time = new Time()
        this.time.on('tick', () => {
            this.update()
        })
        this.scene = new THREE.Scene()
        // this.resources = new Resources(sources)
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update() {
        this.camera.update()
        this.world.update()
        this.renderer.update()
    }

    destroy() {
        this.sizes.off('resize')
        this.time.off('tick')
        this.scene.traverse((child) => {
            // Test if it's a mesh
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()
                console.log(child.geometry)

                // Loop through the material properties
                for (const key in child.material) {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if (value && typeof value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }
        })
        // document.querySelector('canvas').remove() // if we want to dispose the canvas and last frame
        // this.camera.controls.dispose()
        this.renderer.instance.dispose()
        // this.renderer.instance2.dispose()
        if (this.debug.active)
            this.debug.ui.destroy()
    }
}