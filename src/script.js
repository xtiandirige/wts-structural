import './style.css'
import * as dat from 'lil-gui'
import Experience from './experience/Experience'

/**
 * Debug
 */
// const gui = new dat.GUI()
// gui
//     .addColor(parameters, 'materialColor')
//     .onChange(() => {
//         structureMaterial.color.set(parameters.materialColor)
//     })

/**
 * Base
 */

const experience = new Experience(document.querySelector('canvas.webgl'))