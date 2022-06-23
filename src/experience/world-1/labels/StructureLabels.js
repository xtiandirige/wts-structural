import * as THREE from 'three'
import { Graphics, makeElement } from '../../../components/Graphics'
import Experience from '../../Experience'

export default class StructureLabels {
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