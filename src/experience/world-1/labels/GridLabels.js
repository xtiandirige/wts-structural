import * as THREE from 'three'
import { Graphics } from '../../../components/Graphics'
import Experience from '../../Experience'

export default class GridLabels {
    constructor() {
        const gridLabel = {
            scale: 0.0075,
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