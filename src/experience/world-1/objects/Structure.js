import * as THREE from 'three'
import { Roller, Hinge } from '../../../components/Supports';

const structureMaterial = new THREE.MeshBasicMaterial({
    color: '#D3D3D3',
    transparent: true,
})
const supportMaterial = new THREE.MeshBasicMaterial({
    color: '#D3D3D3',
    transparent: true,
});

export default class Structure {
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