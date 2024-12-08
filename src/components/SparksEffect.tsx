import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface SparksPlaneProps {
  duration: number;
  onComplete?: () => void;
}

type SparksMaterialType = THREE.ShaderMaterial & {
  iTime: number;
  iResolution: THREE.Vector3;
  iEmissionEndTime: number;
  iIsEmitting: number;
  iStartTime: number;
};

const SparksMaterial = shaderMaterial(
  {
    iTime: 0,
    iResolution: new THREE.Vector3(),
    iEmissionEndTime: 0,
    iIsEmitting: 1,
    iStartTime: 0,
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  `
    uniform float iTime;
    uniform vec3 iResolution;
    uniform float iEmissionEndTime;
    uniform float iIsEmitting;
    uniform float iStartTime;
    varying vec2 vUv;

    #define SPARKS 300
    #define BRIGHTNESS 5.0
    #define SPEED_FACTOR 0.1
    #define LENGTH_FACTOR 0.5
    #define GROUP_FACTOR 2.0
    #define SPREAD_FACTOR 0.8
    #define MIN_ANGLE 0.1
    #define RAND_FACTOR 2.0
    #define MAX_DISTANCE 20.0
    #define SPARK_THICKNESS 1.0
    #define SPARK_LENGTH 10.0
    #define SPARK_SIZE 100.0
    #define SPARK_LIFETIME 4.0

    const float brightness = (float(BRIGHTNESS) == 0.0) ? 200.0 / (float(SPARKS) + 40.0) : float(BRIGHTNESS);

    float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
    }

    float spread(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
    }

    vec3 sampleAngle(float u1, float u2) {
        float r = sqrt(u1);
        float theta = u2 * 2.0 * 3.14159;
        return vec3(
            r * cos(theta),
            r * sin(theta),
            mix(-1.0, 1.0, spread(vec2(u1, u2)))
        );
    }

    float cylinder(vec3 pos, vec3 dir, float len) {
        float x = dot(pos, dir);
        vec3 closest = dir * clamp(x, 0.0, len);
        vec2 perpDist = vec2(length(pos - closest));
        return length(perpDist * vec2(4.0, 1.0));
    }

    vec4 color(float age) {
        float f = 1.0 - age * 0.05;
        return vec4(0.5*f+0.4, 0.5*f*f+0.05, 0.2*f*f, min(f*2.0, 1.0));
    }

    vec3 trace(vec3 rpos, vec3 rdir, vec2 fragCoord) {
        vec3 sparkCol = vec3(0.0);
        float effectiveTime = iTime - iStartTime;
        float time = effectiveTime * SPEED_FACTOR;
        
        vec3 origin = vec3(0.0, 0.0, 0.0);
        
        for (int i = 0; i < SPARKS; i++) {
            float startTime = spread(vec2(float(i), 5.0)) * GROUP_FACTOR;
            
            // Check if this spark should exist based on emission time
            if (iIsEmitting < 0.5) {
                float sparkTime = effectiveTime - startTime;
                if (sparkTime > iEmissionEndTime) {
                    continue;
                }
            }
            
            float a = spread(vec2(float(i), 1.0)) * SPREAD_FACTOR + MIN_ANGLE;
            float b = spread(vec2(float(i), 3.0)) * RAND_FACTOR;
            
            vec3 dir = sampleAngle(a, spread(vec2(float(i), 7.0))) * SPARK_SIZE;
            float c = fract(time + startTime) * 20.0;
            
            vec3 start = origin;
            vec3 force = dir * 0.02 + vec3(0.0, -0.5, 0.0);
            vec3 offset = dir * c * 0.5 + force * c * c * 0.25;
            
            vec3 sparkPos = start + offset;
            float distFromOrigin = length(sparkPos);
            
            float fadeout = 1.0 - smoothstep(0.0, MAX_DISTANCE, distFromOrigin);
            
            if (fadeout > 0.0) {
                vec3 toSpark = sparkPos - rpos;
                float distAlongRay = dot(toSpark, rdir);
                vec3 closestPoint = rpos + rdir * distAlongRay;
                
                vec3 velocity = normalize(dir + force * c);
                float h = cylinder(sparkPos - closestPoint, velocity, SPARK_LENGTH);
                
                if (distAlongRay > 0.0) {
                    float sparkRadius = SPARK_THICKNESS;
                    float intensity = 1.0 - smoothstep(0.0, sparkRadius, h);
                    vec4 sc = color(c);
                    float stretch = dot(normalize(velocity), normalize(sparkPos - closestPoint));
                    intensity *= 1.0 + abs(stretch) * 2.0;
                    sparkCol += sc.xyz * sc.w * intensity * brightness * fadeout;
                }
            }
        }
        
        return sparkCol;
    }

    vec3 camera(vec2 px) {
        vec2 rd = (px / iResolution.yy - vec2(iResolution.x/iResolution.y*0.5-0.5, 0.0)) * 2.0 - 1.0;
        vec3 rdir = normalize(vec3(rd.x*0.5, rd.y*0.5, 1.0));
        return trace(vec3(0.0, 0.0, -50.0), rdir, px);
    }

    void main() {
        vec2 fragCoord = vUv * iResolution.xy;
        vec3 col = camera(fragCoord);
        vec3 finalColor = pow(col, vec3(0.4545));
        float alpha = length(finalColor);
        gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

const SparksShaderMaterial = new SparksMaterial() as SparksMaterialType;
SparksShaderMaterial.transparent = true;
SparksShaderMaterial.blending = THREE.AdditiveBlending;

const SPARK_LIFETIME = 4.0;

export function SparksPlane({ duration, onComplete }: SparksPlaneProps): JSX.Element {
  const materialRef = useRef<SparksMaterialType>(null);
  const timeRef = useRef({
    start: 0,
    emission: 0,
  });
  const completedRef = useRef(false);

  useEffect(() => {
    if (materialRef.current) {
      const startTime = performance.now() / 1000;
      timeRef.current = {
        start: startTime,
        emission: duration,
      };
      materialRef.current.iStartTime = startTime;
      materialRef.current.iEmissionEndTime = duration;
      materialRef.current.iIsEmitting = 1;
      completedRef.current = false;
    }
  }, [duration]);

  useFrame(() => {
    if (!materialRef.current) return;

    const material = materialRef.current;
    const currentTime = performance.now() / 1000;
    const elapsedTime = currentTime - timeRef.current.start;

    material.iTime = currentTime;
    material.iResolution.set(400, 400, 1);

    // Check if emission should stop
    if (material.iIsEmitting > 0.5 && elapsedTime >= timeRef.current.emission) {
      material.iIsEmitting = 0;
    }

    // Check for completion
    if (!completedRef.current && material.iIsEmitting < 0.5 && elapsedTime >= timeRef.current.emission + SPARK_LIFETIME) {
      completedRef.current = true;
      onComplete?.();
    }
  });

  return (
    <mesh>
      <planeGeometry />
      <primitive object={SparksShaderMaterial} ref={materialRef} />
    </mesh>
  );
}
