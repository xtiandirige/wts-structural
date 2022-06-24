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

class Renderer {
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

class Graphics {
    constructor(graphicParameters = {}, labelParameters = {}) {
        this.arrowheadHeight = graphicParameters.hasOwnProperty("arrowheadHeight") ? graphicParameters["arrowheadHeight"] : 0.3
        this.arrowheadRadius = graphicParameters.hasOwnProperty("arrowheadRadius") ? graphicParameters["arrowheadRadius"] : 0.09
        this.arrowheadPosition = graphicParameters.hasOwnProperty("arrowheadPosition") ? graphicParameters["arrowheadPosition"] : 'start'
        this.centerRadius = graphicParameters.hasOwnProperty("centerRadius") ? graphicParameters["centerRadius"] : 0.05
        this.lineRadius = graphicParameters.hasOwnProperty("lineRadius") ? graphicParameters["lineRadius"] : 0.025
        this.material = graphicParameters.hasOwnProperty("material") ? graphicParameters["material"] : new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true })
        this.color = labelParameters.hasOwnProperty("color") ? labelParameters["color"] : 'black'
        this.xOffset = labelParameters.hasOwnProperty("xOffset") ? labelParameters["xOffset"] : 0
        this.yOffset = labelParameters.hasOwnProperty("yOffset") ? labelParameters["yOffset"] : 0
        this.zOffset = labelParameters.hasOwnProperty("zOffset") ? labelParameters["zOffset"] : 0
        this.scale = labelParameters.hasOwnProperty("scale") ? labelParameters["scale"] : 0.005
        this.position = labelParameters.hasOwnProperty("position") ? labelParameters["position"] : new THREE.Vector3(0, 0, 0)
    }

    generateArrowhead() {
        return new THREE.Mesh(new THREE.ConeGeometry(this.arrowheadRadius, this.arrowheadHeight, 32), this.material)
    }

    generateLine(curve) {
        return new THREE.Mesh(new THREE.TubeGeometry(curve, 20, this.lineRadius, 8, false), this.material)
    }

    generatePoint() {
        return new THREE.Mesh(new THREE.SphereGeometry(this.centerRadius), this.material);
    }

    generateLabel(textLabel = "") {
        const label = document.createElement('div')
        label.style.color = this.color
        label.style.position = "fixed"
        label.style.boxSizing = 'border-box'

        katex.render(textLabel, label, { throwOnError: false })
        const css3DObject = new CSS3DObject(label)
        css3DObject.scale.set(this.scale, this.scale, this.scale)
        css3DObject.position.set(this.position.x + this.xOffset, this.position.y + this.yOffset, this.position.z + this.zOffset)
        return css3DObject
    }
}

function labelParametersWithOffset(parameters, x, y, z) {
    const realParameters = { ...parameters }
    realParameters['xOffset'] = x
    realParameters['yOffset'] = y
    realParameters['zOffset'] = z
    return realParameters
}

function makeElement(latexText, position) {
    const label = document.createElement('div')
    label.style.position = "fixed"
    label.style.top = 0
    label.style.boxSizing = 'border-box'
    katex.render(latexText, label, { throwOnError: false })
    const objectCSS = new CSS3DObject(label)
    objectCSS.scale.set(0.005, 0.005, 0.005)
    objectCSS.position.set(position.x, position.y, position.z)
    return objectCSS
}

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

const structureMaterial = new THREE.MeshBasicMaterial({
    color: '#D3D3D3',
    transparent: true,
})
const supportMaterial = new THREE.MeshBasicMaterial({
    color: '#D3D3D3',
    transparent: true,
});

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

class Moment extends Graphics {
    constructor(parameters) {
        if (parameters === undefined) parameters = {}
        super(parameters.hasOwnProperty("graphics") ? parameters["graphics"] : {})
        this.magnitude = parameters.hasOwnProperty("magnitude") ? parameters["magnitude"] : 1
        this.position = parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3(0, 0, 0)
        this.direction = parameters.hasOwnProperty("direction") ? parameters["direction"] : "CCW"
        this.circleCurve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, this.magnitude, 0),
            new THREE.Vector3(0.5519150244935105707435627 * this.magnitude, this.magnitude, 0),
            new THREE.Vector3(this.magnitude, 0.5519150244935105707435627 * this.magnitude, 0),
            new THREE.Vector3(this.magnitude, 0, 0),
        )
        this.createGeometry()
    }

    createGeometry() {
        this.moment = new THREE.Group()
        this.createArcSet()
        this.moment.add(this.generatePoint())
        if (this.direction == "CCW") this.moment.rotateY(Math.PI)
        this.moment.rotateZ(Math.PI / 4)
        this.moment.position.set(this.position.x, this.position.y, this.position.z)
    }

    createArc() {
        const arrowhead = this.generateArrowhead()
        arrowhead.position.set(this.magnitude, -0.1, 0)
        arrowhead.rotateZ(Math.PI)
        let arc = new THREE.Group()
        return arc.add(this.generateLine(this.circleCurve), arrowhead)
    }

    createArcSet() {
        const invertedArc = this.createArc()
        invertedArc.rotateY(Math.PI).rotateX(Math.PI)
        this.moment.add(this.createArc(), invertedArc)
    }
}

class PointLoad extends Graphics {
    constructor(parameters) {
        if (parameters === undefined) parameters = {}
        super(parameters.hasOwnProperty("graphics") ? parameters["graphics"] : {}, {})
        this.magnitude = parameters.hasOwnProperty("magnitude") ? parameters["magnitude"] : 1
        this.position = parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3(0, 0, 0)
        this.lineCurve = new THREE.LineCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, this.magnitude, 0)
        )
        this.createGeometry()
    }

    createGeometry() {
        this.load = new THREE.Group()
        this.createLoad()
        this.load.position.set(this.position.x, this.position.y, this.position.z)
    }

    createLoad() {
        const arrowhead = this.generateArrowhead()
        arrowhead.position.set(this.lineCurve.v2.x, this.lineCurve.v2.y, this.lineCurve.v2.z)
        if (this.lineCurve.v2.y < 0) {
            arrowhead.rotateX(Math.PI)
        }
        this.load.add(this.generateLine(this.lineCurve), arrowhead)
        this.load.position.set(this.position.x, this.position.y, this.position.z)
    }
}

class LinearLoad extends PointLoad {
    constructor(parameters) {
        if (parameters === undefined) parameters = {}
        super(parameters)
        this.magnitudeA = parameters.hasOwnProperty("magnitudeA") ? parameters["magnitudeA"] : 1
        this.magnitudeB = parameters.hasOwnProperty("magnitudeB") ? parameters["magnitudeB"] : 1
        this.positionA = parameters.hasOwnProperty("positionA") ? parameters["positionA"] : new THREE.Vector3(0, 0, 0)
        this.positionB = parameters.hasOwnProperty("positionB") ? parameters["positionB"] : new THREE.Vector3(1, 0, 0)
        this.numberOfIntervals = parameters.hasOwnProperty("numberOfIntervals") ? parameters["numberOfIntervals"] : 4
        this.lengthRange = this.positionB.distanceTo(this.positionA)
        this.graphics = parameters.hasOwnProperty("graphics") ? parameters["graphics"] : {}
        this.vectorDifference = new THREE.Vector3().subVectors(this.positionB, this.positionA)
        this.slope = (this.magnitudeB - this.magnitudeA) / this.lengthRange
        this.createGeometry()
    }

    createGeometry() {
        this.load = new THREE.Group()
        this.createPointLoads()
        this.createLinearLine()
        this.load.position.set(this.position.x, this.position.y, this.position.z)
    }

    createPointLoads() {
        for (let interval = 0; interval <= this.numberOfIntervals; interval += 1) {
            let magnitude = this.magnitudeA + this.slope * (interval / this.numberOfIntervals) * this.lengthRange
            let position = new THREE.Vector3()
                .copy(this.vectorDifference)
                .multiplyScalar(interval / this.numberOfIntervals)
                .add(new THREE.Vector3(0, -magnitude, 0))
            let graphics = this.graphics
            let pointLoad = new PointLoad({ magnitude: magnitude, position: position, graphics: graphics });
            this.load.add(pointLoad.load)
        }
    }

    createLinearLine() {
        const linearCurve = new THREE.LineCurve3(this.positionA, this.positionB);
        const linearLine = this.generateLine(linearCurve)
        this.load.add(linearLine)
    }
}

const loadGraphicParameters = {
    material: new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        transparent: true,
    })
}
const loadLabelParameters = {
    color: 'blue',
    scale: 0.0035,
}
const supportLoadGraphicParameters = {
    material: new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
    })
}
const supportLoadLabelParameters = {
    color: 'red',
    scale: 0.0035,
}

class Loads {
    constructor(loadPosition) {
        this.moment = new Moment({
            magnitude: 0.7,
            position: loadPosition[0],
            direction: "CW",
            graphics: loadGraphicParameters,
            label: "25kN\\bull{m}",
            labelParameters: labelParametersWithOffset(loadLabelParameters, -1.2, 0.5, 0)
        })
        this.udl = new LinearLoad({
            magnitudeA: -1.2,
            magnitudeB: -1.2,
            position: loadPosition[1],
            positionA: new THREE.Vector3(0, 1.2, 0),
            positionB: new THREE.Vector3(5, 1.2, 0),
            numberOfIntervals: 4,
            graphics: loadGraphicParameters,
            label: '20\\frac{kN}{m}',
            labelParameters: labelParametersWithOffset(loadLabelParameters, 2.4, 1.6, 0)
        })
        this.pointLoad = new PointLoad({
            magnitude: -1,
            position: loadPosition[2],
            graphics: loadGraphicParameters,
            label: '50kN',
            labelParameters: labelParametersWithOffset(loadLabelParameters, 0.3, 0.35, 0)
        })
        this.supportLoadRB = new PointLoad({
            magnitude: 1,
            position: loadPosition[3],
            graphics: supportLoadGraphicParameters,
            label: 'R_B',
            labelParameters: labelParametersWithOffset(supportLoadLabelParameters, 0.4, 0.2, 0)
        })
        this.supportLoadCv = new PointLoad({
            magnitude: 1,
            position: loadPosition[4],
            graphics: supportLoadGraphicParameters,
            label: 'C_v',
            labelParameters: labelParametersWithOffset(supportLoadLabelParameters, 0.2, 0.2, 0)
        })
        this.supportLoadCh = new PointLoad({
            magnitude: 1,
            position: loadPosition[5],
            graphics: supportLoadGraphicParameters,
            label: 'C_h',
            labelParameters: labelParametersWithOffset(supportLoadLabelParameters, 0.4, 0.3, 0)
        })
        this.getLoads()
    }

    getLoads() {
        this.loads = new THREE.Group()
        this.loads.add(
            this.moment.moment,
            this.udl.load,
            this.pointLoad.load

        )
        this.supportLoads = new THREE.Group()
        this.supportLoads.add(
            this.supportLoadRB.load,
            this.supportLoadCv.load,
            this.supportLoadCh.load
        )
    }
}

class CartesianGrid extends Graphics {
    constructor(parameters) {
        if (parameters === undefined) parameters = {}
        super(
            parameters.hasOwnProperty("graphics") ? parameters["graphics"] : {},
            parameters.hasOwnProperty("labelParameters") ? parameters["labelParameters"] : {}
        )
        this.originPosition = parameters.hasOwnProperty("originPosition") ? parameters["originPosition"] : new THREE.Vector3(0, 0, 0)
        this.originMagnitudeX = parameters.hasOwnProperty("originMagnitudeX") ? parameters["originMagnitudeX"] : 1
        this.originMagnitudeY = parameters.hasOwnProperty("originMagnitudeY") ? parameters["originMagnitudeY"] : 1
        this.createOriginGrid()
    }

    createOriginGrid() {
        this.origin = new THREE.Group()
        this.origin.add(this.generateLine(new THREE.LineCurve3(
            new THREE.Vector3(0, this.originMagnitudeY, 0),
            new THREE.Vector3(0, 0, 0)
        )))
        this.origin.add(this.generateLine(new THREE.LineCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(this.originMagnitudeX, 0, 0)
        )))
        this.createOriginPoint()
        this.origin.position.set(this.originPosition.x, this.originPosition.y, this.originPosition.z)
    }

    createOriginPoint() {
        this.origin.add(this.generatePoint())
    }

    createXGrid() {
        // Implement x-grid soon
    }

    createYGrid() {
        // Implement y-grid soon   
    }
}

class DimensionXY extends Graphics {
    constructor(parameters) {
        if (parameters === undefined) parameters = {}
        super(
            parameters.hasOwnProperty("graphics") ? parameters["graphics"] : {},
            parameters.hasOwnProperty("labelParameters") ? parameters["labelParameters"] : {}
        )
        this.parameters = parameters
        this.pointA = parameters.hasOwnProperty("pointA") ? parameters["pointA"] : new THREE.Vector3(0, 0, 0)
        this.pointB = parameters.hasOwnProperty("pointB") ? parameters["pointB"] : new THREE.Vector3(0, 0, 0)
        this.referencePosition = parameters.hasOwnProperty("referencePosition") ? parameters["referencePosition"] : 0
        this.graphics = parameters.hasOwnProperty("graphics") ? parameters["graphics"] : {}
        this.magnitude = this.pointA.distanceTo(this.pointB)
        this.lineCurve = new THREE.LineCurve3()
        this.label = parameters.hasOwnProperty("label") ? parameters["label"] : ""
        this.position = parameters.hasOwnProperty("position") ? parameters["position"] : ""
        this.angle = parameters.hasOwnProperty("angle") ? parameters["angle"] : ""
        this.getDimension()
    }

    getDimension() {
        this.createDimensionLine()
        this.orientDimensionLine()
    }

    getLineCurve() {
        this.lineCurve.v1 = new THREE.Vector3(0, this.graphics.arrowheadHeight, 0)
        this.lineCurve.v2 = new THREE.Vector3(0, this.magnitude - this.graphics.arrowheadHeight, 0)
    }

    createExtensionLine(factor) {
        return this.generateLine(new THREE.LineCurve3(
            new THREE.Vector3(-0.1, factor, 0),
            new THREE.Vector3(0.1, factor, 0)
        ))
    }

    createReferenceLines() {
        const lineCurveA = new THREE.LineCurve3()
        const lineCurveB = new THREE.LineCurve3()
        if (this.referencePosition < 0) {
            lineCurveA.v1 = new THREE.Vector3(this.referencePosition, 0, 0)
            lineCurveA.v2 = new THREE.Vector3(-0.15, 0, 0)
            lineCurveB.v1 = new THREE.Vector3(this.referencePosition, this.magnitude, 0)
            lineCurveB.v2 = new THREE.Vector3(-0.15, this.magnitude, 0)
        } else if (this.referencePosition > 0) {
            lineCurveA.v1 = new THREE.Vector3(0.15, 0, 0)
            lineCurveA.v2 = new THREE.Vector3(this.referencePosition, 0, 0)
            lineCurveB.v1 = new THREE.Vector3(0.15, this.magnitude, 0)
            lineCurveB.v2 = new THREE.Vector3(this.referencePosition, this.magnitude, 0)
        } else {
            return
        }
        const referenceLines = new THREE.Group()
        return referenceLines.add(this.generateLine(lineCurveA), this.generateLine(lineCurveB))
    }

    createDimensionLine() {
        this.dimension = new THREE.Group()
        this.getLineCurve()
        const arrowheadA = this.generateArrowhead()
        arrowheadA.position.y += this.graphics.arrowheadHeight * (1 / 2)
        arrowheadA.rotateX(Math.PI)

        const arrowheadB = this.generateArrowhead()
        arrowheadB.position.set(0, this.magnitude, 0)
        arrowheadB.position.y -= this.graphics.arrowheadHeight * (1 / 2)

        const extensionLineA = this.createExtensionLine(0)
        const extensionLineB = this.createExtensionLine(this.magnitude)
        this.dimension.add(
            this.generateLine(this.lineCurve),
            arrowheadA,
            arrowheadB,
            extensionLineA,
            extensionLineB,
            this.createReferenceLines(),
        )
    }

    orientDimensionLine() {
        this.dimension.position.set(this.position.x, this.position.y, this.position.z)
        this.dimension.rotation.set(0, 0, this.angle)
    }
}

const gridGraphicParameters = {
    arrowheadHeight: 0.15,
    arrowheadRadius: 0.045,
    lineRadius: 0.0125,
    material: new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
    })
}
const gridLabelParameters = {
    scale: 0.0035,
}

export default class Grid {
    constructor() {
        this.gridOrigin = new CartesianGrid({
            originPosition: new THREE.Vector3(-4.5, 0, 0),
            originMagnitudeX: 2,
            originMagnitudeY: 2,
            graphics: gridGraphicParameters,
            labelParameters: gridLabelParameters
        })
        this.getGrid()
    }

    getGrid() {
        this.grid = new THREE.Group()
        this.grid.add(this.gridOrigin.origin)
    }
}

const annotationGraphicParameters = {
    arrowheadHeight: 0.15,
    arrowheadRadius: 0.045,
    lineRadius: 0.0125,
    material: new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
    })
}
const dimensionLabelParameters = {
    scale: 0.0035,
}

class Dimensions {
    constructor(dimensionParameters) {
        // DIMENSION
        this.dimension1 = new DimensionXY({
            ...dimensionParameters[0],
            referencePosition: -1,
            graphics: annotationGraphicParameters,
            label: '2m',
            labelParameters: dimensionLabelParameters,
            angle: -Math.PI / 2
        })
        this.dimension2 = new DimensionXY({
            ...dimensionParameters[1],
            referencePosition: -1,
            graphics: annotationGraphicParameters,
            label: '4m',
            labelParameters: dimensionLabelParameters,
            angle: -Math.PI / 2
        })
        this.dimension3 = new DimensionXY({
            ...dimensionParameters[2],
            referencePosition: -1,
            graphics: annotationGraphicParameters,
            label: '2m',
            labelParameters: dimensionLabelParameters,
            angle: -Math.PI / 2
        })
        this.getDimensions()
    }

    getDimensions() {
        this.dimensions = new THREE.Group()
        this.dimensions.add(
            this.dimension1.dimension,
            this.dimension2.dimension,
            this.dimension3.dimension,
        )
    }
}

class ReferencePoints {
    constructor() {
        this.originPointA = new Graphics().generatePoint()
        this.referencePointB = new Graphics().generatePoint()
        this.referencePointC = new Graphics().generatePoint()
        this.referencePointD = new Graphics().generatePoint()
        this.getReferencePoints()
    }

    getReferencePoints() {
        this.originPointA.position.set(-4.5, 0, 0)
        this.referencePointB.position.set(-2.5, 0, 0)
        this.referencePointC.position.set(2.5, 0, 0)
        this.referencePointD.position.set(4.5, 0, 0)
        this.originGroup = new THREE.Group()
        this.originGroup.add(
            this.originPointA
        )
        this.referenceGroup = new THREE.Group()
        this.referenceGroup.add(
            this.referencePointB,
            this.referencePointC,
            this.referencePointD
        )
    }
}

class ReferenceLabels {
    constructor() {
        this.experience = new Experience()
        this.ALabel = new Graphics({}, { scale: 0.003 }).generateLabel("(0,0)")
        this.BLabel = new Graphics({}, { scale: 0.003 }).generateLabel("(2.5,0)")
        this.CLabel = new Graphics({}, { scale: 0.003 }).generateLabel("(7.5,0)")
        this.DLabel = new Graphics({}, { scale: 0.003 }).generateLabel("(9.0,0)")
        this.getReferenceLabels()
    }

    getReferenceLabels() {

        // const tempV = new THREE.Vector3();
        // // get the normalized screen coordinate of that position
        // // x and y will be in the -1 to +1 range with x = -1 being
        // // on the left and y = -1 being on the bottom
        // tempV.project(this.experience.camera.instance);
        // // convert the normalized position to CSS coordinates
        // const x = (-5.0) * this.experience.canvas.clientWidth;
        // const y = (0.5) * this.experience.canvas.clientHeight;

        this.ALabel.position.set(-4.5 + 0.75, 0.5, 0)
        this.BLabel.position.set(-2.5 - 0.5, 0.5, 0)
        this.CLabel.position.set(2.5 - 0.5, 0.5, 0)
        this.DLabel.position.set(4.5 - 0.5, 0.5, 0)
        this.originLabel = new THREE.Group()
        this.originLabel.add(
            this.ALabel
        )
        this.referenceLabel = new THREE.Group()
        this.referenceLabel.add(
            this.BLabel,
            this.CLabel,
            this.DLabel
        )
    }
}

class StructureLabels {
    constructor() {
        this.experience = new Experience()
        this.ALabel = makeElement('A', new THREE.Vector3(-5, -0.6, 0))
        this.BLabel = makeElement('B', new THREE.Vector3(-2.5, -0.6, 0))
        this.CLabel = makeElement('C', new THREE.Vector3(2.5, -0.6, 0))
        this.DLabel = makeElement('D', new THREE.Vector3(4.5, -0.6, 0))
        this.getStructureLabels()
    }

    getStructureLabels() {
        this.originStructureLabel = new THREE.Group()
        this.originStructureLabel.add(
            this.ALabel
        )
        this.referenceStructureLabel = new THREE.Group()
        this.referenceStructureLabel.add(
            this.BLabel,
            this.CLabel,
            this.DLabel
        )
    }
}

class LoadLabels {
    constructor(loadPosition) {
        const loadLabel = {
            color: 'blue',
            scale: 0.0035,
        }
        const supportLabel = {
            color: 'red',
            scale: 0.0035,
        }
        this.experience = new Experience()
        this.momentLabel = new Graphics({}, {
            ...loadLabel,
            position: loadPosition[0].add(new THREE.Vector3(0, 1, 0))
        }).generateLabel("25kN\\bull{m}")
        this.udlLabel = new Graphics({}, {
            ...loadLabel,
            position: loadPosition[1].add(new THREE.Vector3(2.35, 1.6, 0))
        }).generateLabel('20\\frac{kN}{m}')
        this.pointLabel = new Graphics({}, {
            ...loadLabel,
            position: loadPosition[2].add(new THREE.Vector3(0.25, 0.25, 0))
        }).generateLabel('50kN')
        this.RBLabel = new Graphics({}, {
            ...supportLabel,
            position: loadPosition[3]
        }).generateLabel('R_B')
        this.CvLabel = new Graphics({}, {
            ...supportLabel,
            position: loadPosition[4].add(new THREE.Vector3(0.15, 0, 0))
        }).generateLabel('C_v')
        this.ChLabel = new Graphics({}, {
            ...supportLabel,
            position: loadPosition[5].add(new THREE.Vector3(-0.15, 0.15, 0))
        }).generateLabel('C_h')
        this.getLoadLabels()
    }

    getLoadLabels() {
        this.loadLabels = new THREE.Group()
        this.loadLabels.add(
            this.momentLabel,
            this.udlLabel,
            this.pointLabel
        )
        this.supportLabels = new THREE.Group()
        this.supportLabels.add(
            this.RBLabel,
            this.CvLabel,
            this.ChLabel
        )
    }
}

class GridLabels {
    constructor() {
        const gridLabel = {
            scale: 0.0035,
        }
        this.experience = new Experience()
        this.x = new Graphics({}, {
            ...gridLabel,
            position: new THREE.Vector3(-2.25, 0, 0)
        }).generateLabel("x")
        this.y = new Graphics({}, {
            ...gridLabel,
            position: new THREE.Vector3(-5, 2, 0)
        }).generateLabel('y')
        this.getGridLabels()
    }

    getGridLabels() {
        this.gridLabels = new THREE.Group()
        this.gridLabels.add(
            this.x,
            this.y,
        )
    }
}

class DimensionLabel {
    constructor(dimensionParameters) {
        this.dimensionLabel = {
            scale: 0.0035,
        }
        this.experience = new Experience()
        this.dimension1 = this.getLabel('2.5m', dimensionParameters[0])
        this.dimension2 = this.getLabel('4.0m', dimensionParameters[1])
        this.dimension3 = this.getLabel('2.5m', dimensionParameters[2])
        this.getDimensionLabel()
    }

    getLabel(label, parameters) {
        let dimension = new Graphics({}, this.dimensionLabel).generateLabel(label)
        let pointA = parameters.hasOwnProperty("pointA") ? parameters["pointA"] : new THREE.Vector3(0, 0, 0)
        let pointB = parameters.hasOwnProperty("pointB") ? parameters["pointB"] : new THREE.Vector3(0, 0, 0)
        let magnitude = pointA.distanceTo(pointB)
        document.getElementById("css").appendChild(dimension.element)
        dimension.position.set(
            parameters.position.x + magnitude / 2 - dimension.element.offsetWidth / 1600,
            parameters.position.y + dimension.element.offsetWidth / 800,
            parameters.position.z
        )
        document.getElementById("css").removeChild(dimension.element)
        return dimension
    }

    getDimensionLabel() {
        this.dimensionLabel = new THREE.Group()
        this.dimensionLabel.add(
            this.dimension1,
            this.dimension2,
            this.dimension3
        )
    }
}

function animateWEBGLOpacity(group, opacity) {
    group.traverse((node) => {
        if (node.material) {
            gsapAnimation(node.material, { opacity: opacity })
        }
    })
}

function animateCSS3DOpacity(group, opacity) {
    group.traverse((node) => {
        for (let child of node.children) {
            gsapAnimation(child.element.style, { opacity: opacity })
        }
    })
}

function gsapAnimation(target, tweenOptions) {
    gsap.to(
        target, {
        duration: 0.1,
        ease: 'power2.inOut',
        ...tweenOptions
    }
    )
}

class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.parameters()
        this.axisHelper()
        this.getStructure()
        this.getLoads()
        this.getGrid()
        this.getDimensions()
        this.getReferencePoint()
        this.getLabels()
        this.getGlobalGroup()
        // this.resources = this.experience.resources
        // this.resources.on('ready', () => {
        //     this.object = new Object()
        //     this.environment = new Environment()
        // })
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY
            if ((this.scrollY / this.experience.sizes.height) > 1) {
                this.globalGroup.position.y = -scrollY / this.experience.sizes.height * this.objectDistance
                this.globalLabels.position.y = -scrollY / this.experience.sizes.height * this.objectDistance
            }
            this.switchScenes()
            this.experience.camera.positionCamera(new THREE.Vector3(0, -this.scrollY / this.experience.sizes.height * this.objectDistance, 0))
        })
    }

    // TODO: Refactor classes (make it cleaner)
    // Upload as CDN
    // Link to webflow

    // Build next THREEJS Scene (Reaction)
    // Create graphs class for THREEJS (Loads and Deflection)
    // Create annotation class for sections

    // Transparancy problem with support load
    // Responsiveness

    // When refreshing, start at zero scroll
    // Scaling sync with WEBGL and CSS3D (Create another scene)
    // Destroy each material and object (CSS3D)

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

    axisHelper() {
        this.scene.add(new THREE.AxesHelper())
    }

    getStructure() {
        this.structure = new Structure().structure
        this.structure.renderOrder = 1
    }

    getLoads() {
        this.loads = new Loads(this.loadPosition).loads
        this.loads.renderOrder = 0
        this.supportLoads = new Loads(this.loadPosition).supportLoads
        this.supportLoads.renderOrder = 0
        this.supportLoads.children[2].rotateZ(Math.PI / 2)
    }

    getGrid() {
        this.grid = new Grid().grid
        this.grid.renderOrder = 0
        this.xAxis = this.grid.children[0].children[1]
    }

    getDimensions() {
        this.dimension = new Dimensions(this.dimensionParameters).dimensions
    }

    getReferencePoint() {
        this.referencePoints = new ReferencePoints().referenceGroup
    }

    getLabels() {
        this.originLabel = new ReferenceLabels().originLabel
        this.referenceLabels = new ReferenceLabels().referenceLabel
        this.originStructureLabel = new StructureLabels().originStructureLabel
        this.referenceStructureLabel = new StructureLabels().referenceStructureLabel
        this.loadLabel = new LoadLabels(this.loadPosition).loadLabels
        this.supportLabel = new LoadLabels(this.loadPosition).supportLabels
        this.gridLabel = new GridLabels().gridLabels
        this.dimensionLabel = new DimensionLabel(this.dimensionParameters).dimensionLabel
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

    switchScenes() {
        switch (Math.round(scrollY / this.experience.sizes.height)) {
            case 0:
                this.animateGlobalScene()
                return
            case 1:
                // Introduce structure
                this.animateLocalScene(
                    {
                        structure: 0.5,
                        loads: 1.0,
                        supportLoads: 0.0,
                        grid: 0.0,
                        dimension: 1.0,
                        referencePoints: 0.0,
                        originLabel: 0.0,
                        referenceLabel: 0.0,
                        originStructureLabel: 0.0,
                        referenceStructureLabel: 0.0,
                        loadLabel: 1.0,
                        supportLabel: 0.0,
                        gridLabel: 0.0,
                        dimensionLabel: 1.0,
                    }
                )
                return
            case 2:
                // Introduce reference grid
                this.animateLocalScene(
                    {
                        structure: 0.5,
                        loads: 0.15,
                        supportLoads: 0.0,
                        grid: 1.0,
                        dimension: 0.15,
                        referencePoints: 0.0,
                        originLabel: 1.0,
                        referenceLabel: 0.0,
                        originStructureLabel: 1.0,
                        referenceStructureLabel: 0.0,
                        loadLabel: 0.15,
                        supportLabel: 0.0,
                        gridLabel: 1.0,
                        dimensionLabel: 0.15,
                    }
                )
                this.specialAnimation(1, -2.25)
                return
            case 3:
                // Introduce other reference points
                this.animateLocalScene(
                    {
                        structure: 0.5,
                        loads: 0.5,
                        supportLoads: 0.0,
                        grid: 1.0,
                        dimension: 1.0,
                        referencePoints: 1.0,
                        originLabel: 1.0,
                        referenceLabel: 1.0,
                        originStructureLabel: 1.0,
                        referenceStructureLabel: 1.0,
                        loadLabel: 0.5,
                        supportLabel: 0.0,
                        gridLabel: 1.0,
                        dimensionLabel: 1.0,
                    }
                )
                this.specialAnimation(4.5, 5.0)
                return
            case 4:
                // Introduce reactions
                this.animateLocalScene(
                    {
                        structure: 0.5,
                        loads: 0.15,
                        supportLoads: 1.0,
                        grid: 1.0,
                        dimension: 0.0,
                        referencePoints: 0.0,
                        originLabel: 0.0,
                        referenceLabel: 0.0,
                        originStructureLabel: 1.0,
                        referenceStructureLabel: 1.0,
                        loadLabel: 0.15,
                        supportLabel: 1.0,
                        gridLabel: 1.0,
                        dimensionLabel: 0.0,
                    }
                )
                return
            case 5:
                // Determinacy computation
                this.animateLocalScene(
                    {
                        structure: 0.5,
                        loads: 0.15,
                        supportLoads: 1.0,
                        grid: 1.0,
                        dimension: 0.0,
                        referencePoints: 0.0,
                        originLabel: 0.0,
                        referenceLabel: 0.0,
                        originStructureLabel: 1.0,
                        referenceStructureLabel: 1.0,
                        loadLabel: 0.15,
                        supportLabel: 1.0,
                        gridLabel: 1.0,
                        dimensionLabel: 0.0,
                    }
                )
                return
            case 6:
                this.animateGlobalScene()
                return
            case 7:
                this.animateGlobalScene()
                return
            default:
                return
        }
    }

    specialAnimation(x1, x2) {
        gsapAnimation(this.xAxis.scale, { x: x1, ease: 'power2.easeOut', duration: 0.5 })
        gsapAnimation(this.gridLabel.children[0].position, { x: x2, ease: 'power2.easeOut', duration: 0.5 })
    }

    animateLocalScene(parameters) {
        animateWEBGLOpacity(this.structure, parameters.structure)
        animateWEBGLOpacity(this.loads, parameters.loads)
        animateWEBGLOpacity(this.supportLoads, parameters.supportLoads)
        animateWEBGLOpacity(this.grid, parameters.grid)
        animateWEBGLOpacity(this.dimension, parameters.dimension)
        animateWEBGLOpacity(this.referencePoints, parameters.referencePoints)
        animateCSS3DOpacity(this.originLabel, parameters.originLabel)
        animateCSS3DOpacity(this.referenceLabels, parameters.referenceLabel)
        animateCSS3DOpacity(this.originStructureLabel, parameters.originStructureLabel)
        animateCSS3DOpacity(this.referenceStructureLabel, parameters.referenceStructureLabel)
        animateCSS3DOpacity(this.loadLabel, parameters.loadLabel)
        animateCSS3DOpacity(this.supportLabel, parameters.supportLabel)
        animateCSS3DOpacity(this.gridLabel, parameters.gridLabel)
        animateCSS3DOpacity(this.dimensionLabel, parameters.dimensionLabel)
    }

    animateGlobalScene() {
        animateWEBGLOpacity(this.globalGroup, 0.0)
        for (let child of this.globalLabels.children) {
            animateCSS3DOpacity(child, 0.0)
        }
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