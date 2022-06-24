class EventEmitter {
    constructor() {
        this.callbacks = {}
        this.callbacks.base = {}
    }

    on(_names, callback) {
        // Errors
        if (typeof _names === 'undefined' || _names === '') {
            console.warn('wrong names')
            return false
        }

        if (typeof callback === 'undefined') {
            console.warn('wrong callback')
            return false
        }

        // Resolve names
        const names = this.resolveNames(_names)

        // Each name
        names.forEach((_name) => {
            // Resolve name
            const name = this.resolveName(_name)

            // Create namespace if not exist
            if (!(this.callbacks[name.namespace] instanceof Object))
                this.callbacks[name.namespace] = {}

            // Create callback if not exist
            if (!(this.callbacks[name.namespace][name.value] instanceof Array))
                this.callbacks[name.namespace][name.value] = []

            // Add callback
            this.callbacks[name.namespace][name.value].push(callback)
        })

        return this
    }

    off(_names) {
        // Errors
        if (typeof _names === 'undefined' || _names === '') {
            console.warn('wrong name')
            return false
        }

        // Resolve names
        const names = this.resolveNames(_names)

        // Each name
        names.forEach((_name) => {
            // Resolve name
            const name = this.resolveName(_name)

            // Remove namespace
            if (name.namespace !== 'base' && name.value === '') {
                delete this.callbacks[name.namespace]
            }

            // Remove specific callback in namespace
            else {
                // Default
                if (name.namespace === 'base') {
                    // Try to remove from each namespace
                    for (const namespace in this.callbacks) {
                        if (this.callbacks[namespace] instanceof Object && this.callbacks[namespace][name.value] instanceof Array) {
                            delete this.callbacks[namespace][name.value]

                            // Remove namespace if empty
                            if (Object.keys(this.callbacks[namespace]).length === 0)
                                delete this.callbacks[namespace]
                        }
                    }
                }

                // Specified namespace
                else if (this.callbacks[name.namespace] instanceof Object && this.callbacks[name.namespace][name.value] instanceof Array) {
                    delete this.callbacks[name.namespace][name.value]

                    // Remove namespace if empty
                    if (Object.keys(this.callbacks[name.namespace]).length === 0)
                        delete this.callbacks[name.namespace]
                }
            }
        })

        return this
    }

    trigger(_name, _args) {
        // Errors
        if (typeof _name === 'undefined' || _name === '') {
            console.warn('wrong name')
            return false
        }

        let finalResult = null
        let result = null

        // Default args
        const args = !(_args instanceof Array) ? [] : _args

        // Resolve names (should on have one event)
        let name = this.resolveNames(_name)

        // Resolve name
        name = this.resolveName(name[0])

        // Default namespace
        if (name.namespace === 'base') {
            // Try to find callback in each namespace
            for (const namespace in this.callbacks) {
                if (this.callbacks[namespace] instanceof Object && this.callbacks[namespace][name.value] instanceof Array) {
                    this.callbacks[namespace][name.value].forEach(function (callback) {
                        result = callback.apply(this, args)

                        if (typeof finalResult === 'undefined') {
                            finalResult = result
                        }
                    })
                }
            }
        }

        // Specified namespace
        else if (this.callbacks[name.namespace] instanceof Object) {
            if (name.value === '') {
                console.warn('wrong name')
                return this
            }

            this.callbacks[name.namespace][name.value].forEach(function (callback) {
                result = callback.apply(this, args)

                if (typeof finalResult === 'undefined')
                    finalResult = result
            })
        }

        return finalResult
    }

    resolveNames(_names) {
        let names = _names
        names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '')
        names = names.replace(/[,/]+/g, ' ')
        names = names.split(' ')

        return names
    }

    resolveName(name) {
        const newName = {}
        const parts = name.split('.')

        newName.original = name
        newName.value = parts[0]
        newName.namespace = 'base' // Base namespace

        // Specified namespace
        if (parts.length > 1 && parts[1] !== '') {
            newName.namespace = parts[1]
        }

        return newName
    }
}

class Sizes extends EventEmitter {
    constructor() {
        super()
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)
        window.addEventListener('resize', () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.pixelRatio = Math.min(window.devicePixelRatio, 2)
            this.trigger('resize')
        })
    }
}

class Time extends EventEmitter {
    constructor() {
        super()
        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
        this.delta = 16
        window.requestAnimationFrame(() => {
            this.tick()
        })
    }

    tick() {
        const currentTime = Date.now()
        this.delta = currentTime - this.current
        this.current = currentTime
        this.elapsed = this.current - this.start

        this.trigger('tick')

        window.requestAnimationFrame(() => {
            this.tick()
        })
    }
}

class Camera {
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
        this.instance.position.set(0, 0, 10)
        this.cameraGroup = new THREE.Group()
        this.scene.add(this.cameraGroup.add(this.instance))
    }
    positionCamera(positionVector) {
        this.cameraGroup.position.set(positionVector.x, positionVector.y, positionVector.z)
    }
    // setOrbitControls() {
    //     this.controls = new OrbitControls(this.instance, this.canvas)
    //     this.controls.enableDamping = true
    // }
    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }
    update() {
        // this.controls.update()
    }
}

class Renderer {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.setWEBGLInstance()
        // this.setCSS3DInstance()
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
    // setCSS3DInstance() {
    //     this.instance2 = new CSS3DRenderer({
    //         element: document.querySelector('#css')
    //     })
    //     // this.instance2.domElement.style.position = 'absolute'
    //     // this.instance2.domElement.style.top = 0
    //     this.instance2.setSize(this.sizes.width, this.sizes.height)
    // }
    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
        // this.instance2.setSize(this.sizes.width, this.sizes.height)
    }
    update() {
        this.instance.render(this.scene, this.camera.instance)
        // this.instance2.render(this.scene, this.camera.instance)
    }
}

const structureMaterial = new THREE.MeshBasicMaterial({
    color: '#D3D3D3',
    transparent: true,
})
const supportMaterial = new THREE.MeshBasicMaterial({
    color: '#D3D3D3',
    transparent: true,
});

class Support {
    constructor(geometry, material, position) {
        this.geometry = geometry
        this.material = material
        this.position = position
        this.createSupport()
    }

    createSupport() {
        this.support = new THREE.Mesh(this.geometry, this.material)
        this.support.position.set(this.position.x, this.position.y, this.position.z)
    }
}

class Roller extends Support {
    constructor(parameters, radius = 0.25) {
        if (parameters === undefined) parameters = {}
        super(
            new THREE.SphereGeometry(radius),
            parameters.hasOwnProperty("material") ? parameters["material"] : new THREE.MeshBasicMaterial({ color: 0x000000 }),
            parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3(0, 0, 0)
        )
    }
}

class Hinge extends Support {
    constructor(parameters, radiusTop = 0.3, radiusBottom = 0.6, height = 0.5) {
        if (parameters === undefined) parameters = {}
        super(
            new THREE.CylinderGeometry(radiusTop / Math.sqrt(2), radiusBottom / Math.sqrt(2), height, 4, 1),
            parameters.hasOwnProperty("material") ? parameters["material"] : new THREE.MeshBasicMaterial({ color: 0x000000 }),
            parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3(0, 0, 0)
        )

    }

    createSupport() {
        this.support = new THREE.Mesh(this.geometry, this.material)
        this.support.geometry.rotateY(Math.PI / 4)
        this.support.position.set(this.position.x, this.position.y, this.position.z)
    }
}

class Fixed extends Support {
    constructor(parameters, width = 0.3, height = 0.6, depth = 0.3) {
        if (parameters === undefined) parameters = {}
        super(
            new THREE.BoxGeometry(width, height, depth),
            parameters.hasOwnProperty("material") ? parameters["material"] : new THREE.MeshBasicMaterial({ color: 0x000000 }),
            parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3(0, 0, 0)
        )
    }
}

class Structure {
    constructor() {
        this.beam = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 0.3), structureMaterial)
        this.roller = new Roller({
            material: supportMaterial,
            position: new THREE.Vector3(-2.5, -0.5, 0)
        })
        this.hinge = new Hinge({
            material: supportMaterial,
            position: new THREE.Vector3(2.5, -0.5, 0)
        })
        this.getStructure()
    }

    getStructure() {
        this.structure = new THREE.Group()
        this.structure.add(this.beam, this.roller.support, this.hinge.support)
    }
}

class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.parameters()
        this.getStructure()
        this.getGlobalGroup()
    }

    parameters() {
        this.objectDistance = 7
        this.loadPosition = [
            new THREE.Vector3(-4.5, 0, 0),
            new THREE.Vector3(-2.5, 0.15, 0),
            new THREE.Vector3(4.5, 1.15, 0),
            new THREE.Vector3(-2.5, -1.15, 0),
            new THREE.Vector3(2.5, -1.15, 0),
            new THREE.Vector3(3.65, 0, 0)
        ]
        this.dimensionParameters = [
            {
                pointA: new THREE.Vector3(0, 0, 0),
                pointB: new THREE.Vector3(2, 0, 0),
                position: new THREE.Vector3(-4.5, -1.8, 0)
            },
            {
                pointA: new THREE.Vector3(2, 0, 0),
                pointB: new THREE.Vector3(7, 0, 0),
                position: new THREE.Vector3(-2.5, -1.8, 0)
            },
            {
                pointA: new THREE.Vector3(7, 0, 0),
                pointB: new THREE.Vector3(9, 0, 0),
                position: new THREE.Vector3(2.5, -1.8, 0),
            }
        ]
    }

    getStructure() {
        this.structure = new Structure().structure
        this.structure.renderOrder = 1
    }

    getGlobalGroup() {
        this.globalGroup = new THREE.Group()
        this.globalGroup.add(
            this.structure,
            this.loads,
            this.supportLoads,
            this.grid,
            this.dimension,
            this.referencePoints
        )
        this.globalGroup.position.y = -this.objectDistance * 1
        this.scene.add(this.globalGroup)
        this.globalLabels = new THREE.Group()
        this.globalLabels.add(
            this.originLabel,
            this.referenceLabels,
            this.originStructureLabel,
            this.referenceStructureLabel,
            this.loadLabel,
            this.supportLabel,
            this.gridLabel,
            this.dimensionLabel
        )
        this.globalLabels.position.y = -this.objectDistance * 1
        this.scene.add(this.globalLabels)
    }

    update() {

    }
}

let instance = null

class Experience {
    constructor(canvas) {
        if (instance) {
            return instance
        }
        instance = this
        window.experience = this
        this.canvas = canvas
        // this.debug = new Debug()
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

const experience = new Experience(document.querySelector('canvas.webgl'))