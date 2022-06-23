import * as THREE from 'three'
import { Graphics } from './Graphics.js'

// Aesthethics update
//  Consider center of arrowhead
//  Adjust arrowheight of moment
//  Linear line of uniform loads align better
//  Improve linear load

// Functionality update
//  Include label

// Optimise

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
        // this.position = parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3(0, 0, 0)
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

export { Moment, PointLoad, LinearLoad }