import * as THREE from 'three'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import katex from 'katex'

class Graphics {
    constructor(graphicParameters = {}, labelParameters = {}) {
        this.arrowheadHeight = graphicParameters.hasOwnProperty("arrowheadHeight") ? graphicParameters["arrowheadHeight"] : 0.3
        this.arrowheadRadius = graphicParameters.hasOwnProperty("arrowheadRadius") ? graphicParameters["arrowheadRadius"] : 0.09
        this.arrowheadPosition = graphicParameters.hasOwnProperty("arrowheadPosition") ? graphicParameters["arrowheadPosition"] : 'start'
        this.centerRadius = graphicParameters.hasOwnProperty("centerRadius") ? graphicParameters["centerRadius"] : 0.05
        this.lineRadius = graphicParameters.hasOwnProperty("lineRadius") ? graphicParameters["lineRadius"] : 0.025
        this.material = graphicParameters.hasOwnProperty("material") ? graphicParameters["material"] : new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true })
        this.color = labelParameters.hasOwnProperty("color") ? labelParameters["color"] : 'black'
        this.xOffset = labelParameters.hasOwnProperty("xOffset") ? labelParameters["xOffset"] : 0
        this.yOffset = labelParameters.hasOwnProperty("yOffset") ? labelParameters["yOffset"] : 0
        this.zOffset = labelParameters.hasOwnProperty("zOffset") ? labelParameters["zOffset"] : 0
        this.scale = labelParameters.hasOwnProperty("scale") ? labelParameters["scale"] : 1 //0.005
        this.position = labelParameters.hasOwnProperty("position") ? labelParameters["position"] : new THREE.Vector3(0, 0, 0)
    }

    generateArrowhead() {
        return new THREE.Mesh(new THREE.ConeGeometry(this.arrowheadRadius, this.arrowheadHeight, 32), this.material)
    }

    generateLine(curve) {
        return new THREE.Mesh(new THREE.TubeGeometry(curve, 20, this.lineRadius, 8, false), this.material)
    }

    generatePoint() {
        return new THREE.Mesh(new THREE.SphereGeometry(this.centerRadius), this.material);
    }

    generateLabel(textLabel = "") {
        const label = document.createElement('div')
        label.classList.add('katex')
        label.style.color = this.color
        label.style.position = "fixed"
        label.style.boxSizing = 'border-box'

        katex.render(textLabel, label, { throwOnError: false })
        const css3DObject = new CSS3DObject(label)
        css3DObject.scale.set(this.scale, this.scale, this.scale)
        css3DObject.position.set(this.position.x + this.xOffset, this.position.y + this.yOffset, this.position.z + this.zOffset)
        return css3DObject
    }
}

function labelParametersWithOffset(parameters, x, y, z) {
    const realParameters = { ...parameters }
    realParameters['xOffset'] = x
    realParameters['yOffset'] = y
    realParameters['zOffset'] = z
    return realParameters
}

function makeElement(latexText, position) {
    const label = document.createElement('div')
    label.classList.add('katex')
    label.style.position = "fixed"
    label.style.top = 0
    label.style.boxSizing = 'border-box'
    katex.render(latexText, label, { throwOnError: false })
    const objectCSS = new CSS3DObject(label)
    objectCSS.scale.set(0.6, 0.6, 0.6)
    objectCSS.position.set(position.x, position.y, position.z)
    return objectCSS
}

export { Graphics, labelParametersWithOffset, makeElement }