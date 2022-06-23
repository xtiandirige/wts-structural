import * as THREE from 'three'
import { Graphics } from '../../../components/Graphics'

export default class ReferencePoints {
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