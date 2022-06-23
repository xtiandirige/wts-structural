import * as THREE from 'three'
import { PointLoad, LinearLoad, Moment } from '../../../components/Loads';
import { labelParametersWithOffset } from '../../../components/Graphics';

const loadGraphicParameters = {
    material: new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        transparent: true,
    })
}
const loadLabelParameters = {
    color: 'blue',
    scale: 0.0035,
}
const supportLoadGraphicParameters = {
    material: new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
    })
}
const supportLoadLabelParameters = {
    color: 'red',
    scale: 0.0035,
}

export default class Loads {
    constructor(loadPosition) {
        this.moment = new Moment({
            magnitude: 0.7,
            position: loadPosition[0],
            direction: "CW",
            graphics: loadGraphicParameters,
            label: "25kN\\bull{m}",
            labelParameters: labelParametersWithOffset(loadLabelParameters, -1.2, 0.5, 0)
        })
        this.udl = new LinearLoad({
            magnitudeA: -1.2,
            magnitudeB: -1.2,
            position: loadPosition[1],
            positionA: new THREE.Vector3(0, 1.2, 0),
            positionB: new THREE.Vector3(5, 1.2, 0),
            numberOfIntervals: 4,
            graphics: loadGraphicParameters,
            label: '20\\frac{kN}{m}',
            labelParameters: labelParametersWithOffset(loadLabelParameters, 2.4, 1.6, 0)
        })
        this.pointLoad = new PointLoad({
            magnitude: -1,
            position: loadPosition[2],
            graphics: loadGraphicParameters,
            label: '50kN',
            labelParameters: labelParametersWithOffset(loadLabelParameters, 0.3, 0.35, 0)
        })
        this.supportLoadRB = new PointLoad({
            magnitude: 1,
            position: loadPosition[3],
            graphics: supportLoadGraphicParameters,
            label: 'R_B',
            labelParameters: labelParametersWithOffset(supportLoadLabelParameters, 0.4, 0.2, 0)
        })
        this.supportLoadCv = new PointLoad({
            magnitude: 1,
            position: loadPosition[4],
            graphics: supportLoadGraphicParameters,
            label: 'C_v',
            labelParameters: labelParametersWithOffset(supportLoadLabelParameters, 0.2, 0.2, 0)
        })
        this.supportLoadCh = new PointLoad({
            magnitude: 1,
            position: loadPosition[5],
            graphics: supportLoadGraphicParameters,
            label: 'C_h',
            labelParameters: labelParametersWithOffset(supportLoadLabelParameters, 0.4, 0.3, 0)
        })
        this.getLoads()
    }

    getLoads() {
        this.loads = new THREE.Group()
        this.loads.add(
            this.moment.moment,
            this.udl.load,
            this.pointLoad.load

        )
        this.supportLoads = new THREE.Group()
        this.supportLoads.add(
            this.supportLoadRB.load,
            this.supportLoadCv.load,
            this.supportLoadCh.load
        )
    }
}