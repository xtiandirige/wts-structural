import gsap from 'gsap'

function animateWEBGLOpacity(group, opacity) {
    group.traverse((node) => {
        if (node.material) {
            gsapAnimation(node.material, { opacity: opacity })
        }
    })
}

function animateCSS3DOpacity(group, opacity) {
    group.traverse((node) => {
        for (let child of node.children) {
            gsapAnimation(child.element.style, { opacity: opacity })
        }
    })
}

function gsapAnimation(target, tweenOptions) {
    gsap.to(
        target, {
        duration: 0.1,
        ease: 'power2.inOut',
        ...tweenOptions
    }
    )
}

export { animateWEBGLOpacity, animateCSS3DOpacity, gsapAnimation }