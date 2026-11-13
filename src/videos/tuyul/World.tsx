import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Box, Cylinder, GlowSprite, Ico, Plane, type Vec3} from '../../three/lib/primitives';
import {glowTexture, warmGlowTexture} from '../../three/lib/textures';
import type {SceneName} from './story';

const DUSK_FOG = '#6d4460';

const Sky: React.FC = () => {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: {value: new THREE.Color('#241a3f')},
        mid: {value: new THREE.Color('#7c3f6d')},
        low: {value: new THREE.Color('#f0a061')},
      },
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 top; uniform vec3 mid; uniform vec3 low;
        varying vec3 vWorld;
        void main() {
          float h = clamp(normalize(vWorld).y * 1.35 + 0.12, 0.0, 1.0);
          vec3 c = mix(low, mid, smoothstep(0.0, 0.34, h));
          c = mix(c, top, smoothstep(0.26, 0.9, h));
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    });
  }, []);
  return (
    <mesh material={material} scale={[1, 1, 1]}>
      <sphereGeometry args={[220, 32, 20]} />
    </mesh>
  );
};

const SunDisc: React.FC<{position: Vec3}> = ({position}) => {
  const glow = useMemo(() => warmGlowTexture(), []);
  return (
    <group position={position}>
      <GlowSprite map={glow} scale={34} color="#ffb877" opacity={0.55} />
      <GlowSprite map={glow} scale={13} color="#ffd9a8" opacity={0.9} />
    </group>
  );
};

const Tree: React.FC<{position: Vec3; scale?: number; hue?: string}> = ({position, scale = 1, hue = '#22301f'}) => (
  <group position={position} scale={scale}>
    <Cylinder radiusTop={0.16} radiusBottom={0.26} height={2.6} segments={7} position={[0, 1.3, 0]} color="#2a1d24" />
    <Ico radius={1.5} detail={0} position={[0, 3.2, 0]} color={hue} />
    <Ico radius={1.05} detail={0} position={[0.75, 4.05, 0.2]} color={hue} />
    <Ico radius={0.9} detail={0} position={[-0.7, 3.9, -0.25]} color={hue} />
  </group>
);

const Lamp: React.FC<{position: Vec3; t: number}> = ({position, t}) => {
  const glow = useMemo(() => glowTexture(), []);
  const flicker = 0.88 + 0.12 * Math.sin(t * 2.3);
  return (
    <group position={position}>
      <Cylinder radiusTop={0.07} radiusBottom={0.09} height={4.6} segments={8} position={[0, 2.3, 0]} color="#241a2c" />
      <Box size={[0.9, 0.12, 0.16]} position={[0.36, 4.55, 0]} color="#241a2c" />
      <Box size={[0.34, 0.16, 0.28]} position={[0.72, 4.42, 0]} color="#ffcf8a" emissive="#ffb163" emissiveIntensity={2.4} />
      <GlowSprite map={glow} scale={3.4} position={[0.72, 4.35, 0]} color="#ffbe7a" opacity={0.32 * flicker} />
      <pointLight position={[0.72, 4.2, 0]} color="#ffb877" intensity={2.2 * flicker} distance={9} decay={2} />
    </group>
  );
};

const SchoolBuilding: React.FC = () => (
  <group position={[0, 0, -19]}>
    {/* body */}
    <Box size={[30, 7.6, 9]} position={[0, 3.8, 0]} color="#392a52" />
    {/* roof */}
    <Box size={[31.6, 0.5, 10.2]} position={[0, 7.85, 0]} color="#241a36" />
    <Box size={[30.4, 0.9, 9.4]} position={[0, 8.5, -0.3]} color="#2c2040" />
    {/* plinth */}
    <Box size={[30.6, 0.55, 9.6]} position={[0, 0.28, 1.4]} color="#2b1f3e" />
    {/* windows */}
    {Array.from({length: 5}).map((_, i) => (
      <group key={`w-${i}`} position={[-11.6 + i * 5.8, 0, 4.55]}>
        <Box size={[3.1, 2.05, 0.14]} position={[0, 3.55, 0]} color="#ffc474" emissive="#ffab54" emissiveIntensity={1.65} />
        <Box size={[3.3, 0.16, 0.2]} position={[0, 4.62, 0.02]} color="#5a4066" />
        <Box size={[3.3, 0.16, 0.2]} position={[0, 2.48, 0.02]} color="#5a4066" />
        <Box size={[0.12, 2.2, 0.2]} position={[0, 3.55, 0.02]} color="#5a4066" />
      </group>
    ))}
    {/* door */}
    <Box size={[3.0, 4.4, 0.24]} position={[0, 2.2, 4.62]} color="#241a34" />
    <Box size={[0.18, 4.4, 0.3]} position={[-1.5, 2.2, 4.66]} color="#5a4066" />
    <Box size={[0.18, 4.4, 0.3]} position={[1.5, 2.2, 4.66]} color="#5a4066" />
    <Box size={[3.4, 0.24, 0.5]} position={[0, 4.5, 4.8]} color="#5a4066" />
    {/* sign band */}
    <Box size={[7.4, 1.1, 0.18]} position={[0, 6.55, 4.6]} color="#48325f" />
    {/* steps */}
    <Box size={[6.4, 0.18, 1.4]} position={[0, 0.09, 5.2]} color="#2f2344" />
    <Box size={[5.6, 0.18, 1.0]} position={[0, 0.27, 5.0]} color="#352749" />
  </group>
);

const Fence: React.FC = () => {
  const bars = [];
  for (let x = 3.4; x <= 26; x += 0.55) {
    bars.push(x);
    bars.push(-x);
  }
  return (
    <group position={[0, 0, -6.2]}>
      <Box size={[59, 0.28, 0.3]} position={[0, 1.35, 0]} color="#3b2b4c" />
      <Box size={[59, 0.22, 0.3]} position={[0, 0.25, 0]} color="#3b2b4c" />
      {bars.map((x, i) => (
        <Box key={i} size={[0.09, 1.15, 0.09]} position={[x, 0.8, 0]} color="#4a3560" />
      ))}
      {[-3.4, 3.4].map((x, i) => (
        <Box key={`p${i}`} size={[0.6, 2.6, 0.6]} position={[x, 1.3, 0]} color="#3b2b4c" />
      ))}
      {[-3.4, 3.4].map((x, i) => (
        <Box key={`pc${i}`} size={[0.82, 0.22, 0.82]} position={[x, 2.62, 0]} color="#4a3560" />
      ))}
      {[-3.4, 3.4].map((x, i) => (
        <Box key={`pl${i}`} size={[0.62, 0.14, 0.62]} position={[x, 2.72, 0]} color="#ffc888" emissive="#ffb066" emissiveIntensity={1.2} />
      ))}
    </group>
  );
};

const Yard: React.FC<{t: number}> = ({t}) => (
  <group>
    <Plane width={140} height={140} position={[0, 0, -10]} rotation={[-Math.PI / 2, 0, 0]} color="#241b38" />
    <Plane width={8.5} height={70} position={[0, 0.012, 4]} rotation={[-Math.PI / 2, 0, 0]} color="#2e2344" />
    <Plane width={3.4} height={22} position={[0, 0.02, 2.5]} rotation={[-Math.PI / 2, 0, 0]} color="#352849" />
    <Plane width={18} height={3.2} position={[0, 0.014, -8.5]} rotation={[-Math.PI / 2, 0, 0]} color="#2a2040" />
    <SchoolBuilding />
    <Fence />
    <Tree position={[-14, 0, -9]} scale={1.15} />
    <Tree position={[-19, 0, -13]} scale={1.35} hue="#1d2a1c" />
    <Tree position={[15.5, 0, -10]} scale={1.2} hue="#243322" />
    <Tree position={[21, 0, -15]} scale={1.45} hue="#1c281b" />
    <Tree position={[24, 0, -2]} scale={1.05} hue="#22301f" />
    <Lamp position={[-7.6, 0, 1.6]} t={t} />
    <Lamp position={[8.4, 0, -2.2]} t={t} />
    {/* distant houses */}
    {[-26, -17, -8, 6, 15, 24].map((x, i) => (
      <Box
        key={i}
        size={[7.5, 4.2 + (i % 3) * 0.9, 7]}
        position={[x, 2.1 + (i % 3) * 0.45, -42 - (i % 2) * 4]}
        color={i % 2 ? '#2b2040' : '#251b38'}
      />
    ))}
    <SunDisc position={[-26, 7.5, -70]} />
  </group>
);

const Desk: React.FC<{position: Vec3; rotation?: number; color?: string}> = ({position, rotation = 0, color = '#4a3a2c'}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <Box size={[1.25, 0.09, 0.6]} position={[0, 0.74, 0]} color={color} />
    <Box size={[0.07, 0.72, 0.5]} position={[-0.52, 0.37, 0]} color="#33281f" />
    <Box size={[0.07, 0.72, 0.5]} position={[0.52, 0.37, 0]} color="#33281f" />
    <Box size={[0.5, 0.05, 0.46]} position={[0, 0.42, 0.32]} color={color} />
    <Box size={[0.55, 0.08, 0.5]} position={[0, 0.46, 0.78]} color="#3d2f24" />
    <Box size={[0.5, 0.5, 0.07]} position={[0, 0.68, 0.97]} color="#3d2f24" />
    {[-0.22, 0.22].map((x, i) => (
      <Box key={i} size={[0.06, 0.42, 0.06]} position={[x, 0.22, 0.78]} color="#33281f" />
    ))}
  </group>
);

const Classroom: React.FC<{t: number}> = ({t}) => {
  const glow = useMemo(() => glowTexture(), []);
  return (
    <group position={[120, 0, 0]}>
      <Plane width={13} height={10} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} color="#3a2b22" />
      {/* ceiling */}
      <Box size={[13, 0.2, 10]} position={[0, 3.7, 0]} color="#2a1f2c" />
      {/* back wall with window openings */}
      <Box size={[13, 3.9, 0.24]} position={[0, 1.95, -4.6]} color="#4a3a4e" />
      {/* window frames + dusk light */}
      {[-3.4, 0.2, 3.8].map((x, i) => (
        <group key={i} position={[x, 2.1, -4.42]}>
          <Box size={[2.7, 1.9, 0.1]} position={[0, 0, 0]} color="#ffb877" emissive="#ffab63" emissiveIntensity={1.35} />
          <Box size={[2.9, 0.12, 0.18]} position={[0, 0.98, 0.02]} color="#2c2030" />
          <Box size={[2.9, 0.12, 0.18]} position={[0, -0.98, 0.02]} color="#2c2030" />
          <Box size={[0.1, 2.0, 0.18]} position={[0, 0, 0.02]} color="#2c2030" />
          <Box size={[0.1, 2.0, 0.18]} position={[-1.35, 0, 0.02]} color="#2c2030" />
          <Box size={[0.1, 2.0, 0.18]} position={[1.35, 0, 0.02]} color="#2c2030" />
        </group>
      ))}
      {/* left + right walls */}
      <Box size={[0.24, 3.9, 10]} position={[-6.5, 1.95, 0]} color="#463650" />
      <Box size={[0.24, 3.9, 10]} position={[6.5, 1.95, 0]} color="#3e2f48" />
      {/* blackboard on the right wall */}
      <Box size={[0.1, 1.7, 4.4]} position={[6.36, 1.85, -0.6]} color="#203028" />
      <Box size={[0.16, 0.09, 4.6]} position={[6.34, 1.0, -0.6]} color="#6a5540" />
      {/* desks */}
      {[
        [-3.2, -2.6],
        [0, -2.6],
        [3.2, -2.6],
        [-3.2, -0.4],
        [0, -0.4],
        [3.2, -0.4],
      ].map(([x, z], i) => (
        <Desk key={i} position={[x, 0, z]} rotation={0.04 * (i % 2 ? 1 : -1)} />
      ))}
      {/* teacher desk */}
      <Desk position={[0.2, 0, 2.2]} rotation={0.1} color="#5a4532" />
      {/* hanging lamp */}
      <group position={[0, 3.55, -0.6]}>
        <Cylinder radiusTop={0.02} radiusBottom={0.02} height={0.5} segments={4} position={[0, -0.25, 0]} color="#241a2c" />
        <Cylinder radiusTop={0.42} radiusBottom={0.6} height={0.3} segments={10} position={[0, -0.6, 0]} color="#2c2033" />
        <GlowSprite map={glow} scale={2.6} position={[0, -0.72, 0]} color="#ffbe7a" opacity={0.28} />
        <pointLight position={[0, -0.75, 0]} color="#ffb877" intensity={2.6} distance={11} decay={2} />
      </group>
      {/* door frame on the right, light spill */}
      <Box size={[0.18, 2.6, 1.5]} position={[6.4, 1.3, 3.2]} color="#241a30" />
      <pointLight position={[5.4, 1.6, 3.4]} color="#ffae6a" intensity={1.6} distance={6} decay={2} />
      {/* dust */}
      {Array.from({length: 16}).map((_, i) => {
        const px = -5 + ((i * 2.7) % 10);
        const py = 0.4 + ((i * 0.53) % 2.6) + Math.sin(t * 0.4 + i) * 0.08;
        const pz = -3 + ((i * 1.7) % 6);
        return <Box key={`d${i}`} size={[0.03, 0.03, 0.03]} position={[px, py, pz]} color="#ffd9a8" emissive="#ffc07a" emissiveIntensity={0.6} />;
      })}
    </group>
  );
};

export const World: React.FC<{scene: SceneName; t: number}> = ({scene, t}) => (
  <>
    <fog attach="fog" args={[DUSK_FOG, 22, 120]} />
    <Sky />
    <hemisphereLight args={['#8a5f86', '#241a30', 0.85]} />
    <ambientLight intensity={0.32} color="#8f6a86" />
    <directionalLight position={[-18, 9, 16]} color="#ffb36b" intensity={2.1} />
    <directionalLight position={[12, 6, -20]} color="#7f6bb0" intensity={0.55} />
    {scene === 'yard' ? <Yard t={t} /> : <Classroom t={t} />}
  </>
);
