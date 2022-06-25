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
        })
        this.udl = new LinearLoad({
            magnitudeA: -1.2,
            magnitudeB: -1.2,
            position: loadPosition[1],
            positionA: new THREE.Vector3(0, 1.2, 0),
            positionB: new THREE.Vector3(5, 1.2, 0),
            numberOfIntervals: 4,
            graphics: loadGraphicParameters,
        })
        this.pointLoad = new PointLoad({
            magnitude: -1,
            position: loadPosition[2],
            graphics: loadGraphicParameters,
        })
        this.supportLoadRB = new PointLoad({
            magnitude: 1,
            position: loadPosition[3],
            graphics: supportLoadGraphicParameters,
        })
        this.supportLoadCv = new PointLoad({
            magnitude: 1,
            position: loadPosition[4],
            graphics: supportLoadGraphicParameters,
        })
        this.supportLoadCh = new PointLoad({
            magnitude: 1,
            position: loadPosition[5],
            graphics: supportLoadGraphicParameters,
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