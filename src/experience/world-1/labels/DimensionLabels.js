import * as THREE from 'three'
import { Graphics } from '../../../components/Graphics'
import Experience from '../../Experience'


export default class DimensionLabel {
    constructor(dimensionParameters) {
        this.dimensionLabel = {
            scale: 0.05,
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