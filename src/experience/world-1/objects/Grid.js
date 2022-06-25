import * as THREE from 'three'
import { CartesianGrid } from '../../../components/Annotations';

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
        })
        this.getGrid()
    }

    getGrid() {
        this.grid = new THREE.Group()
        this.grid.add(this.gridOrigin.origin)
    }
}