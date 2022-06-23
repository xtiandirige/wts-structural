import * as THREE from 'three'
import { Graphics } from './Graphics.js'

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

export { CartesianGrid, DimensionXY }