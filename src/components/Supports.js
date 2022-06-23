import * as THREE from 'three'

class Support {
    constructor(geometry, material, position) {
        this.geometry = geometry
        this.material = material
        this.position = position
        this.createSupport()
    }

    createSupport() {
        this.support = new THREE.Mesh(this.geometry, this.material)
        this.support.position.set(this.position.x, this.position.y, this.position.z)
    }
}

class Roller extends Support {
    constructor(parameters, radius = 0.25) {
        if (parameters === undefined) parameters = {}
        super(
            new THREE.SphereGeometry(radius),
            parameters.hasOwnProperty("material") ? parameters["material"] : new THREE.MeshBasicMaterial({ color: 0x000000 }),
            parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3(0, 0, 0)
        )
    }
}

class Hinge extends Support {
    constructor(parameters, radiusTop = 0.3, radiusBottom = 0.6, height = 0.5) {
        if (parameters === undefined) parameters = {}
        super(
            new THREE.CylinderGeometry(radiusTop / Math.sqrt(2), radiusBottom / Math.sqrt(2), height, 4, 1),
            parameters.hasOwnProperty("material") ? parameters["material"] : new THREE.MeshBasicMaterial({ color: 0x000000 }),
            parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3(0, 0, 0)
        )

    }

    createSupport() {
        this.support = new THREE.Mesh(this.geometry, this.material)
        this.support.geometry.rotateY(Math.PI / 4)
        this.support.position.set(this.position.x, this.position.y, this.position.z)
    }
}

class Fixed extends Support {
    constructor(parameters, width = 0.3, height = 0.6, depth = 0.3) {
        if (parameters === undefined) parameters = {}
        super(
            new THREE.BoxGeometry(width, height, depth),
            parameters.hasOwnProperty("material") ? parameters["material"] : new THREE.MeshBasicMaterial({ color: 0x000000 }),
            parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3(0, 0, 0)
        )
    }
}

export { Roller, Hinge, Fixed }