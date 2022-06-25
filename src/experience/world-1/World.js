import * as THREE from 'three'
import Experience from '../Experience.js'
import Environment from './Environment.js'
import Object from './Object.js'
import Structure from './objects/Structure.js'
import Loads from './objects/Loads.js'
import Grid from './objects/Grid.js'
import Dimensions from './objects/Dimensions.js'
import ReferencePoints from './objects/ReferencePoints.js'
import ReferenceLabels from './labels/ReferenceLabels.js'
import StructureLabels from './labels/StructureLabels.js'
import LoadLabels from './labels/LoadLabels.js'
import GridLabels from './labels/GridLabels.js'
import DimensionLabel from './labels/DimensionLabels.js'
import { animateWEBGLOpacity, animateCSS3DOpacity, gsapAnimation } from '../utils/Animations.js'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.parameters()
        this.axisHelper()
        this.getStructure()
        this.getLoads()
        this.getGrid()
        this.getDimensions()
        this.getReferencePoint()
        this.getLabels()
        this.getGlobalGroup()
        // this.resources = this.experience.resources
        // this.resources.on('ready', () => {
        //     this.object = new Object()
        //     this.environment = new Environment()
        // })
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY
            if ((this.scrollY / this.experience.sizes.height) > 1) {
                this.globalGroup.position.y = -scrollY / this.experience.sizes.height * this.objectDistance
                this.globalLabels.position.y = -scrollY / this.experience.sizes.height * this.objectDistance
            }
            this.switchScenes()
            this.experience.camera.positionCamera(new THREE.Vector3(0, -this.scrollY / this.experience.sizes.height * this.objectDistance, 0))
        })
    }

    // TODO: Refactor classes (make it cleaner)
    // Cleaner labels
    // Fix original scene (values, sizes, etc.)

    // Transparancy problem with support load
    // Responsiveness

    // Build next THREEJS Scene (Reaction)
    // Create graphs class for THREEJS (Loads and Deflection)
    // Create annotation class for sections

    // When refreshing, start at zero scroll
    // Destroy each material and object (CSS3D)

    parameters() {
        this.objectDistance = 7
        this.loadPosition = [
            new THREE.Vector3(-4.5, 0, 0),
            new THREE.Vector3(-2.5, 0.15, 0),
            new THREE.Vector3(4.5, 1.15, 0),
            new THREE.Vector3(-2.5, -1.15, 0),
            new THREE.Vector3(2.5, -1.15, 0),
            new THREE.Vector3(3.65, 0, 0)
        ]
        this.dimensionParameters = [
            {
                pointA: new THREE.Vector3(0, 0, 0),
                pointB: new THREE.Vector3(2, 0, 0),
                position: new THREE.Vector3(-4.5, -1.8, 0)
            },
            {
                pointA: new THREE.Vector3(2, 0, 0),
                pointB: new THREE.Vector3(7, 0, 0),
                position: new THREE.Vector3(-2.5, -1.8, 0)
            },
            {
                pointA: new THREE.Vector3(7, 0, 0),
                pointB: new THREE.Vector3(9, 0, 0),
                position: new THREE.Vector3(2.5, -1.8, 0),
            }
        ]
    }

    axisHelper() {
        this.scene.add(new THREE.AxesHelper())
    }

    getStructure() {
        this.structure = new Structure().structure
        this.structure.renderOrder = 1
    }

    getLoads() {
        this.loads = new Loads(this.loadPosition).loads
        this.loads.renderOrder = 0
        this.supportLoads = new Loads(this.loadPosition).supportLoads
        this.supportLoads.renderOrder = 0
        this.supportLoads.children[2].rotateZ(Math.PI / 2)
    }

    getGrid() {
        this.grid = new Grid().grid
        this.grid.renderOrder = 0
        this.xAxis = this.grid.children[0].children[1]
    }

    getDimensions() {
        this.dimension = new Dimensions(this.dimensionParameters).dimensions
    }

    getReferencePoint() {
        this.referencePoints = new ReferencePoints().referenceGroup
    }

    getLabels() {
        this.originLabel = new ReferenceLabels().originLabel
        this.referenceLabels = new ReferenceLabels().referenceLabel
        this.originStructureLabel = new StructureLabels().originStructureLabel
        this.referenceStructureLabel = new StructureLabels().referenceStructureLabel
        this.loadLabel = new LoadLabels(this.loadPosition).loadLabels
        this.supportLabel = new LoadLabels(this.loadPosition).supportLabels
        this.gridLabel = new GridLabels().gridLabels
        this.dimensionLabel = new DimensionLabel(this.dimensionParameters).dimensionLabel
    }

    getGlobalGroup() {
        this.globalGroup = new THREE.Group()
        this.globalGroup.add(
            this.structure,
            this.loads,
            this.supportLoads,
            this.grid,
            this.dimension,
            this.referencePoints
        )
        this.globalGroup.position.y = -this.objectDistance * 1
        this.scene.add(this.globalGroup)
        this.globalLabels = new THREE.Group()
        this.globalLabels.add(
            this.originLabel,
            this.referenceLabels,
            this.originStructureLabel,
            this.referenceStructureLabel,
            this.loadLabel,
            this.supportLabel,
            this.gridLabel,
            this.dimensionLabel
        )
        this.globalLabels.position.y = -this.objectDistance * 1
        this.scene.add(this.globalLabels)
    }

    switchScenes() {
        switch (Math.round(scrollY / this.experience.sizes.height)) {
            case 0:
                this.animateGlobalScene()
                return
            case 1:
                // Introduce structure
                this.animateLocalScene(
                    {
                        structure: 0.5,
                        loads: 1.0,
                        supportLoads: 0.0,
                        grid: 0.0,
                        dimension: 1.0,
                        referencePoints: 0.0,
                        originLabel: 0.0,
                        referenceLabel: 0.0,
                        originStructureLabel: 0.0,
                        referenceStructureLabel: 0.0,
                        loadLabel: 1.0,
                        supportLabel: 0.0,
                        gridLabel: 0.0,
                        dimensionLabel: 1.0,
                    }
                )
                return
            case 2:
                // Introduce reference grid
                this.animateLocalScene(
                    {
                        structure: 0.5,
                        loads: 0.15,
                        supportLoads: 0.0,
                        grid: 1.0,
                        dimension: 0.15,
                        referencePoints: 0.0,
                        originLabel: 1.0,
                        referenceLabel: 0.0,
                        originStructureLabel: 1.0,
                        referenceStructureLabel: 0.0,
                        loadLabel: 0.15,
                        supportLabel: 0.0,
                        gridLabel: 1.0,
                        dimensionLabel: 0.15,
                    }
                )
                this.specialAnimation(1, -2.25)
                return
            case 3:
                // Introduce other reference points
                this.animateLocalScene(
                    {
                        structure: 0.5,
                        loads: 0.5,
                        supportLoads: 0.0,
                        grid: 1.0,
                        dimension: 1.0,
                        referencePoints: 1.0,
                        originLabel: 1.0,
                        referenceLabel: 1.0,
                        originStructureLabel: 1.0,
                        referenceStructureLabel: 1.0,
                        loadLabel: 0.5,
                        supportLabel: 0.0,
                        gridLabel: 1.0,
                        dimensionLabel: 1.0,
                    }
                )
                this.specialAnimation(4.5, 5.0)
                return
            case 4:
                // Introduce reactions
                this.animateLocalScene(
                    {
                        structure: 0.5,
                        loads: 0.15,
                        supportLoads: 1.0,
                        grid: 1.0,
                        dimension: 0.0,
                        referencePoints: 0.0,
                        originLabel: 0.0,
                        referenceLabel: 0.0,
                        originStructureLabel: 1.0,
                        referenceStructureLabel: 1.0,
                        loadLabel: 0.15,
                        supportLabel: 1.0,
                        gridLabel: 1.0,
                        dimensionLabel: 0.0,
                    }
                )
                return
            case 5:
                // Determinacy computation
                this.animateLocalScene(
                    {
                        structure: 0.5,
                        loads: 0.15,
                        supportLoads: 1.0,
                        grid: 1.0,
                        dimension: 0.0,
                        referencePoints: 0.0,
                        originLabel: 0.0,
                        referenceLabel: 0.0,
                        originStructureLabel: 1.0,
                        referenceStructureLabel: 1.0,
                        loadLabel: 0.15,
                        supportLabel: 1.0,
                        gridLabel: 1.0,
                        dimensionLabel: 0.0,
                    }
                )
                return
            case 6:
                this.animateGlobalScene()
                return
            case 7:
                this.animateGlobalScene()
                return
            default:
                return
        }
    }

    specialAnimation(x1, x2) {
        gsapAnimation(this.xAxis.scale, { x: x1, ease: 'power2.easeOut', duration: 0.5 })
        gsapAnimation(this.gridLabel.children[0].position, { x: x2, ease: 'power2.easeOut', duration: 0.5 })
    }

    animateLocalScene(parameters) {
        animateWEBGLOpacity(this.structure, parameters.structure)
        animateWEBGLOpacity(this.loads, parameters.loads)
        animateWEBGLOpacity(this.supportLoads, parameters.supportLoads)
        animateWEBGLOpacity(this.grid, parameters.grid)
        animateWEBGLOpacity(this.dimension, parameters.dimension)
        animateWEBGLOpacity(this.referencePoints, parameters.referencePoints)
        animateCSS3DOpacity(this.originLabel, parameters.originLabel)
        animateCSS3DOpacity(this.referenceLabels, parameters.referenceLabel)
        animateCSS3DOpacity(this.originStructureLabel, parameters.originStructureLabel)
        animateCSS3DOpacity(this.referenceStructureLabel, parameters.referenceStructureLabel)
        animateCSS3DOpacity(this.loadLabel, parameters.loadLabel)
        animateCSS3DOpacity(this.supportLabel, parameters.supportLabel)
        animateCSS3DOpacity(this.gridLabel, parameters.gridLabel)
        animateCSS3DOpacity(this.dimensionLabel, parameters.dimensionLabel)
    }

    animateGlobalScene() {
        animateWEBGLOpacity(this.globalGroup, 0.0)
        for (let child of this.globalLabels.children) {
            animateCSS3DOpacity(child, 0.0)
        }
    }

    update() {

    }
}