import * as THREE from 'three'
import { Graphics } from '../../../components/Graphics'
import Experience from '../../Experience'

export default class ReferenceLabels {
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