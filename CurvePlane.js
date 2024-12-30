import * as THREE from "three";

export class CurvePlane {
    constructor(width, height, curveRadius, texture) {
        // Géométrie incurvée
        this.geometry = new THREE.PlaneGeometry(width, height, 50, 1);

        // Courbure
        const positionAttribute = this.geometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const z = Math.sqrt(Math.pow(curveRadius, 2) - Math.pow(x, 2)) + curveRadius;
            positionAttribute.setZ(i, z);
        }

        // Matériau shader personnalisé
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            varying vec2 vUv;
            uniform sampler2D uTexture;
            uniform float uHoverEffect; // Gère l'effet de hover
            uniform float uBaseOpacity; // Opacité de base

            void main() {
                vec4 texColor = texture2D(uTexture, vUv);

                // Noir -> transparent au survol
                float transparency = 1.0;
                if (texColor.r < 0.1 && texColor.g < 0.1 && texColor.b < 0.1) {
                    transparency = mix(uBaseOpacity, 0.0, uHoverEffect);
                }

                // Blanc -> opacité 100 % au survol
                if (texColor.r > 0.9 && texColor.g > 0.9 && texColor.b > 0.9) {
                    transparency = mix(uBaseOpacity, 1.0, uHoverEffect);
                }

                // Les autres couleurs passent du noir et blanc à la couleur
                vec3 finalColor = mix(vec3(texColor.r * 0.3), texColor.rgb, uHoverEffect);

                gl_FragColor = vec4(finalColor, transparency);
            }
        `;

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: texture },
                uHoverEffect: { value: 0.0 }, // Effet de survol (initialement désactivé)
                uBaseOpacity: { value: 0.8 }, // Opacité de base (80 %)
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            side: THREE.DoubleSide, // Texture visible de tous les côtés
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    getMesh() {
        return this.mesh;
    }

    setHoverEffect(effectValue) {
        this.material.uniforms.uHoverEffect.value = effectValue;
    }
}
