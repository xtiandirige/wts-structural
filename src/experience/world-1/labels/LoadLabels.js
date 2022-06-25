import * as THREE from 'three'
import { Graphics } from '../../../components/Graphics'
import Experience from '../../Experience'

export default class LoadLabels {
    constructor(loadPosition) {
        const loadLabel = {
            color: 'blue',
            scale: 0.0075,
        }
        const supportLabel = {
            color: 'red',
            scale: 0.0075,
        }
        this.experience = new Experience()
        this.momentLabel = new Graphics({}, {
            ...loadLabel,
            position: loadPosition[0].add(new THREE.Vector3(0, 1, 0))
        }).generateLabel("25kN\\bull{m}")
        this.udlLabel = new Graphics({}, {
            ...loadLabel,
            position: loadPosition[1].add(new THREE.Vector3(2.35, 1.6, 0))
        }).generateLabel('20\\frac{kN}{m}')
        this.pointLabel = new Graphics({}, {
            ...loadLabel,
            position: loadPosition[2].add(new THREE.Vector3(0.25, 0.25, 0))
        }).generateLabel('50kN')
        this.RBLabel = new Graphics({}, {
            ...supportLabel,
            position: loadPosition[3]
        }).generateLabel('R_B')
        this.CvLabel = new Graphics({}, {
            ...supportLabel,
            position: loadPosition[4].add(new THREE.Vector3(0.15, 0, 0))
        }).generateLabel('C_v')
        this.ChLabel = new Graphics({}, {
            ...supportLabel,
            position: loadPosition[5].add(new THREE.Vector3(-0.15, 0.15, 0))
        }).generateLabel('C_h')
        this.getLoadLabels()
    }

    getLoadLabels() {
        this.loadLabels = new THREE.Group()
        this.loadLabels.add(
            this.momentLabel,
            this.udlLabel,
            this.pointLabel
        )
        this.supportLabels = new THREE.Group()
        this.supportLabels.add(
            this.RBLabel,
            this.CvLabel,
            this.ChLabel
        )
    }
}