import * as THREE from 'three';

export class ImageShaderMaterial extends THREE.ShaderMaterial {
    constructor(texture) {
        super({
            uniforms: {
                uTexture: { value: texture },
                uHover: { value: 0 }, // Variable pour gérer le survol
            },
            vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uTexture;
                uniform float uHover;
                varying vec2 vUv;

                void main() {
                    vec4 texColor = texture2D(uTexture, vUv);
                    float alpha = texColor.a;

                    // Passer les noirs en transparence
                    float transparency = texColor.r < 0.2 ? 0.0 : texColor.a;

                    // Ajouter un effet de survol (passer en couleur)
                    vec4 finalColor = mix(vec4(1.0), texColor, uHover);

                    gl_FragColor = vec4(finalColor.rgb, transparency);
                }
            `,
            transparent: true,
        });
    }
}
