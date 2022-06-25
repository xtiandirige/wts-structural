import * as THREE from 'three'
import { DimensionXY } from '../../../components/Annotations'

const annotationGraphicParameters = {
    arrowheadHeight: 0.15,
    arrowheadRadius: 0.045,
    lineRadius: 0.0125,
    material: new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
    })
}
// const dimensionLabelParameters = {
//     scale: 0.0035,
// }

export default class Dimensions {
    constructor(dimensionParameters) {
        // DIMENSION
        this.dimension1 = new DimensionXY({
            ...dimensionParameters[0],
            referencePosition: -1,
            graphics: annotationGraphicParameters,
            angle: -Math.PI / 2
        })
        this.dimension2 = new DimensionXY({
            ...dimensionParameters[1],
            referencePosition: -1,
            graphics: annotationGraphicParameters,
            angle: -Math.PI / 2
        })
        this.dimension3 = new DimensionXY({
            ...dimensionParameters[2],
            referencePosition: -1,
            graphics: annotationGraphicParameters,
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