import * as THREE from 'three';

/**
 * A self-contained iridescent/satin shader material — the visual signature of
 * the hero. Built as a raw ShaderMaterial (not MeshPhysical) so it stays cheap:
 * a fresnel rim + view-angle hue shift, no env maps, no extra texture fetches.
 *
 * `uTime` and `uPointer` are updated each frame by the calling component.
 */
export function createIridescentMaterial(
  colorA = '#7b1e3b',
  colorB = '#e0607e',
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: {value: 0},
      uPointer: {value: new THREE.Vector2(0, 0)},
      uColorA: {value: new THREE.Color(colorA)},
      uColorB: {value: new THREE.Color(colorB)},
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      uniform float uTime;
      uniform vec2 uPointer;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec3 pos = position;
        // Gentle organic breathing; magnitude kept tiny to avoid shimmer.
        float wave = sin(pos.y * 3.0 + uTime * 0.8) * 0.04;
        pos += normal * wave;
        // Subtle parallax toward the pointer for "alive" feel.
        pos.xy += uPointer * 0.08;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uTime;

      void main() {
        float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);
        float hue = 0.5 + 0.5 * sin(uTime * 0.4 + fres * 4.0);
        vec3 base = mix(uColorA, uColorB, hue);
        vec3 color = mix(base, vec3(1.0), fres * 0.6); // bright satin rim
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}
