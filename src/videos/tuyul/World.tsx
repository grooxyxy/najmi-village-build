import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Box, Cylinder, GlowSprite, Ico, Plane, UnlitPlane, type Vec3} from '../../three/lib/primitives';
import {glowTexture, warmGlowTexture} from '../../three/lib/textures';
import type {SceneName} from './story';

const FOG = '#9a6478';

/* ------------------------------------------------------------------- sky */

const Sky: React.FC = () => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: {value: new THREE.Color('#26214c')},
          mid: {value: new THREE.Color('#8a4670')},
          low: {value: new THREE.Color('#ffb26b')},
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
            float h = normalize(vWorld).y;
            vec3 c = mix(low, mid, smoothstep(-0.02, 0.16, h));
            c = mix(c, top, smoothstep(0.14, 0.62, h));
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      }),
    [],
  );
  return (
    <mesh material={material}>
      <sphereGeometry args={[230, 32, 20]} />
    </mesh>
  );
};

const SunDisc: React.FC<{position: Vec3}> = ({position}) => {
  const glow = useMemo(() => warmGlowTexture(), []);
  return (
    <group position={position}>
      <GlowSprite map={glow} scale={64} color="#ff9d63" opacity={0.38} />
      <GlowSprite map={glow} scale={26} color="#ffd3a0" opacity={0.75} />
      <GlowSprite map={glow} scale={9} color="#fff0d0" opacity={0.95} />
    </group>
  );
};

/* ------------------------------------------------------------------ props */

const Tree: React.FC<{position: Vec3; scale?: number; hue?: string}> = ({position, scale = 1, hue = '#33503b'}) => (
  <group position={position} scale={scale}>
    <Cylinder radiusTop={0.2} radiusBottom={0.34} height={2.8} segments={7} position={[0, 1.4, 0]} color="#4a3228" />
    <Ico radius={1.7} detail={0} position={[0, 3.5, 0]} color={hue} />
    <Ico radius={1.15} detail={0} position={[0.85, 4.4, 0.25]} color={hue} />
    <Ico radius={1.0} detail={0} position={[-0.8, 4.2, -0.3]} color={hue} />
  </group>
);

const Lamp: React.FC<{position: Vec3; t: number}> = ({position, t}) => {
  const glow = useMemo(() => glowTexture(), []);
  const flicker = 0.9 + 0.1 * Math.sin(t * 2.1);
  return (
    <group position={position}>
      <Cylinder radiusTop={0.08} radiusBottom={0.11} height={4.4} segments={8} position={[0, 2.2, 0]} color="#3a2a3e" />
      <Box size={[1.0, 0.14, 0.18]} position={[0.4, 4.35, 0]} color="#3a2a3e" />
      <Box
        size={[0.42, 0.2, 0.34]}
        position={[0.8, 4.18, 0]}
        color="#ffe0ad"
        emissive="#ffb163"
        emissiveIntensity={2.2}
      />
      <GlowSprite map={glow} scale={5.2} position={[0.8, 4.1, 0]} color="#ffbe7a" opacity={0.34 * flicker} />
      <pointLight position={[0.8, 4.0, 0]} color="#ffb877" intensity={16 * flicker} distance={16} decay={2} />
    </group>
  );
};

const School: React.FC = () => {
  const glow = useMemo(() => glowTexture(), []);
  return (
    <group position={[0, 0, -22]}>
      {/* body */}
      <Box size={[24, 7, 8]} position={[0, 3.5, 0]} color="#7d5a6e" />
      {/* roof + eaves */}
      <Box size={[25.8, 0.55, 8.8]} position={[0, 7.25, 0]} color="#463049" />
      <Box size={[24.4, 1.0, 8.4]} position={[0, 7.95, -0.2]} color="#543956" />
      {/* plinth */}
      <Box size={[24.8, 0.7, 8.5]} position={[0, 0.35, 0.15]} color="#6a4557" />
      {/* awning over the front walk */}
      <Box size={[24, 0.24, 1.7]} position={[0, 4.35, 4.6]} color="#5c3c50" />
      {[-11, -6, -1, 4, 9].map((x, i) => (
        <Box key={i} size={[0.22, 4.1, 0.22]} position={[x, 2.05, 5.25]} color="#6a4557" />
      ))}

      {/* five lit windows */}
      {[-9.4, -4.7, 0, 4.7, 9.4].map((x, i) => (
        <group key={i} position={[x, 0, 4.02]}>
          <Box
            size={[2.9, 2.1, 0.12]}
            position={[0, 3.55, 0]}
            color="#ffe3b0"
            emissive="#ffbd72"
            emissiveIntensity={1.35}
          />
          <Box size={[3.15, 0.16, 0.22]} position={[0, 4.66, 0.03]} color="#6a4557" />
          <Box size={[3.15, 0.16, 0.22]} position={[0, 2.44, 0.03]} color="#6a4557" />
          <Box size={[0.12, 2.24, 0.22]} position={[0, 3.55, 0.03]} color="#6a4557" />
          <Box size={[0.12, 2.24, 0.22]} position={[-1.45, 3.55, 0.03]} color="#6a4557" />
          <Box size={[0.12, 2.24, 0.22]} position={[1.45, 3.55, 0.03]} color="#6a4557" />
          <GlowSprite map={glow} scale={5.6} position={[0, 3.5, 0.5]} color="#ffb877" opacity={0.26} />
        </group>
      ))}

      {/* glowing doorway */}
      <group position={[0, 0, 4.05]}>
        <Box size={[3.5, 4.3, 0.16]} position={[0, 2.15, -0.06]} color="#ffd9a2" emissive="#ffa75e" emissiveIntensity={1.25} />
        <Box size={[0.24, 4.3, 0.3]} position={[-1.75, 2.15, 0.06]} color="#543956" />
        <Box size={[0.24, 4.3, 0.3]} position={[1.75, 2.15, 0.06]} color="#543956" />
        <Box size={[3.9, 0.28, 0.42]} position={[0, 4.4, 0.1]} color="#543956" />
        <Box size={[0.16, 4.2, 0.22]} position={[0, 2.15, 0.1]} color="#7d5a6e" />
        <GlowSprite map={glow} scale={7} position={[0, 2.4, 0.9]} color="#ffb877" opacity={0.3} />
      </group>

      {/* sign band */}
      <Box size={[6.6, 1.0, 0.16]} position={[0, 6.2, 4.06]} color="#5e3f54" />
      <Box
        size={[5.6, 0.55, 0.06]}
        position={[0, 6.2, 4.16]}
        color="#ffe7bd"
        emissive="#ffc27a"
        emissiveIntensity={0.75}
      />

      {/* steps */}
      <Box size={[6.6, 0.2, 1.5]} position={[0, 0.1, 4.9]} color="#75505f" />
      <Box size={[5.8, 0.2, 1.1]} position={[0, 0.3, 4.7]} color="#7f5768" />
    </group>
  );
};

const Fence: React.FC = () => {
  const bars = [];
  for (let x = 3.8; x <= 20; x += 0.62) {
    bars.push(x);
    bars.push(-x);
  }
  return (
    <group position={[0, 0, -8]}>
      <Box size={[46, 0.3, 0.32]} position={[0, 1.4, 0]} color="#6f4a5c" />
      <Box size={[46, 0.24, 0.32]} position={[0, 0.35, 0]} color="#6f4a5c" />
      {bars.map((x, i) => (
        <Box key={i} size={[0.1, 1.2, 0.1]} position={[x, 0.85, 0]} color="#7d566a" />
      ))}
      {[-3.8, 3.8].map((x, i) => (
        <group key={i}>
          <Box size={[0.7, 2.7, 0.7]} position={[x, 1.35, 0]} color="#6f4a5c" />
          <Box size={[0.94, 0.24, 0.94]} position={[x, 2.74, 0]} color="#7d566a" />
          <Box
            size={[0.7, 0.14, 0.7]}
            position={[x, 2.86, 0]}
            color="#ffe4b2"
            emissive="#ffb066"
            emissiveIntensity={1.2}
          />
        </group>
      ))}
      {/* gate bars, pushed open */}
      <group position={[3.8, 0, 0]} rotation={[0, -0.6, 0]}>
        <Box size={[3.4, 0.12, 0.14]} position={[1.7, 1.9, 0]} color="#7d566a" />
        <Box size={[3.4, 0.12, 0.14]} position={[1.7, 0.6, 0]} color="#7d566a" />
        {[0.4, 1.0, 1.6, 2.2, 2.8].map((x, i) => (
          <Box key={i} size={[0.09, 1.6, 0.09]} position={[x, 1.2, 0]} color="#7d566a" />
        ))}
      </group>
    </group>
  );
};

const Yard: React.FC<{t: number}> = ({t}) => (
  <group>
    <Plane width={150} height={150} position={[0, 0, -12]} rotation={[-Math.PI / 2, 0, 0]} color="#4a3d5c" />
    {/* grass edges (kept clear of the court so no coplanar fight) */}
    <Plane width={10} height={30} position={[-13.9, 0.004, -10]} rotation={[-Math.PI / 2, 0, 0]} color="#40513f" />
    <Plane width={10} height={30} position={[13.9, 0.004, -10]} rotation={[-Math.PI / 2, 0, 0]} color="#3d4d3c" />
    {/* front court, where the kids play */}
    <Plane width={17} height={17} position={[0, 0.012, 2.5]} rotation={[-Math.PI / 2, 0, 0]} color="#52435f" />
    {/* walk from the gate to the school, starts where the court ends */}
    <Plane width={6.2} height={12} position={[0, 0.024, -12]} rotation={[-Math.PI / 2, 0, 0]} color="#634d66" />

    <School />
    <Fence />

    <Tree position={[-9.5, 0, -12]} scale={1.1} hue="#35533c" />
    <Tree position={[-17, 0, -16]} scale={1.5} hue="#2c4534" />
    <Tree position={[10.5, 0, -13]} scale={1.2} hue="#39573e" />
    <Tree position={[18, 0, -18]} scale={1.55} hue="#2b4232" />
    <Tree position={[12.5, 0, -4.2]} scale={0.95} hue="#3a5636" />
    <Tree position={[-16.5, 0, -7]} scale={0.85} hue="#31503a" />
    {/* bush the creature hides behind */}
    <Ico radius={1.15} detail={0} position={[-5.4, 0.9, -5.4]} color="#2f4636" />
    <Ico radius={0.8} detail={0} position={[-4.5, 0.65, -5.9]} color="#38503c" />

    <Lamp position={[-6.2, 0, 1.8]} t={t} />
    <Lamp position={[7.2, 0, -3.4]} t={t} />

    {/* distant houses with lit windows */}
    {[-30, -20, -10, 10, 20, 30].map((x, i) => (
      <group key={i} position={[x, 0, -46 - (i % 2) * 5]}>
        <Box size={[8, 5 + (i % 3) * 0.8, 8]} position={[0, 2.5 + (i % 3) * 0.4, 0]} color={i % 2 ? '#3d3152' : '#342a4a'} />
        <Box size={[8.6, 0.5, 8.4]} position={[0, 5.2 + (i % 3) * 0.8, 0]} color="#2a2138" />
        <Box
          size={[1.4, 1.2, 0.2]}
          position={[i % 2 ? -2 : 2, 2.9, 4]}
          color="#ffd9a0"
          emissive="#ffb46a"
          emissiveIntensity={1.6}
        />
      </group>
    ))}

    <SunDisc position={[-30, 9, -78]} />
  </group>
);

/* -------------------------------------------------------------- classroom */

const Desk: React.FC<{position: Vec3; rotation?: number; color?: string}> = ({position, rotation = 0, color = '#8a6038'}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <Box size={[1.3, 0.1, 0.64]} position={[0, 0.76, 0]} color={color} />
    <Box size={[0.08, 0.74, 0.54]} position={[-0.54, 0.38, 0]} color="#5c4128" />
    <Box size={[0.08, 0.74, 0.54]} position={[0.54, 0.38, 0]} color="#5c4128" />
    <Box size={[0.5, 0.06, 0.48]} position={[0, 0.44, 0.34]} color="#6b4b2e" />
    {/* chair */}
    <Box size={[0.58, 0.09, 0.54]} position={[0, 0.5, 0.86]} color="#6b4b2e" />
    <Box size={[0.54, 0.62, 0.09]} position={[0, 0.82, 1.12]} color="#6b4b2e" />
    {[-0.24, 0.24].map((x, i) => (
      <Box key={i} size={[0.07, 0.48, 0.07]} position={[x, 0.24, 0.86]} color="#4a3320" />
    ))}
  </group>
);

const ClassroomWindow: React.FC<{x: number}> = ({x}) => (
  <group position={[x, 1.75, -5.1]}>
    {/* frame */}
    <Box size={[2.5, 0.12, 0.3]} position={[0, 0.8, 0]} color="#3a2a3c" />
    <Box size={[2.5, 0.12, 0.3]} position={[0, -0.8, 0]} color="#3a2a3c" />
    <Box size={[0.12, 1.72, 0.3]} position={[-1.2, 0, 0]} color="#3a2a3c" />
    <Box size={[0.12, 1.72, 0.3]} position={[1.2, 0, 0]} color="#3a2a3c" />
    <Box size={[0.1, 1.72, 0.28]} position={[0, 0, 0]} color="#3a2a3c" />
    <Box size={[2.5, 0.08, 0.28]} position={[0, 0.02, 0]} color="#3a2a3c" />
  </group>
);

const Classroom: React.FC<{t: number}> = ({t}) => {
  const glow = useMemo(() => glowTexture(), []);
  return (
    <group position={[120, 0, 0]}>
      {/* floor */}
      <Plane width={12} height={15} position={[0, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]} color="#6c4a36" />
      {/* wood planks */}
      {[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((z, i) => (
        <Plane
          key={i}
          width={12}
          height={0.05}
          position={[0, 0.006, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          color="#4e3426"
        />
      ))}

      {/* skirting */}
      <Box size={[12, 0.22, 0.12]} position={[0, 0.11, -4.96]} color="#4a3328" />
      <Box size={[0.12, 0.22, 15]} position={[-5.96, 0.11, 1.5]} color="#4a3328" />
      <Box size={[0.12, 0.22, 15]} position={[5.96, 0.11, 1.5]} color="#4a3328" />

      {/* back wall, built around the window openings */}
      <Box size={[12, 0.95, 0.24]} position={[0, 0.475, -5.1]} color="#7d565c" />
      <Box size={[12, 0.85, 0.24]} position={[0, 3.075, -5.1]} color="#7d565c" />
      {[
        {x: -5.3, w: 1.4},
        {x: -1.7, w: 1.0},
        {x: 1.7, w: 1.0},
        {x: 5.3, w: 1.4},
      ].map((p, i) => (
        <Box key={i} size={[p.w, 1.7, 0.24]} position={[p.x, 1.8, -5.1]} color="#7d565c" />
      ))}
      <ClassroomWindow x={-3.4} />
      <ClassroomWindow x={0} />
      <ClassroomWindow x={3.4} />

      {/* dusk backdrop behind the windows (unlit so it glows) */}
      <UnlitPlane width={13} height={3.4} position={[0, 1.7, -5.75]} color="#ffb877" opacity={1} />
      <UnlitPlane width={13} height={1.1} position={[0, 0.55, -5.73]} color="#3e2a44" opacity={1} />

      {/* side walls + ceiling */}
      <Box size={[0.24, 3.5, 15]} position={[-6.1, 1.75, 1.5]} color="#7d565c" />
      <Box size={[0.24, 3.5, 15]} position={[6.1, 1.75, 1.5]} color="#7c5658" />
      <Box size={[12.4, 0.22, 15]} position={[0, 3.5, 1.5]} color="#5b4452" />

      {/* blackboard on the left wall */}
      <Box size={[0.12, 1.9, 4.8]} position={[-5.94, 1.85, -1.4]} color="#2d4a3e" />
      <Box size={[0.2, 0.12, 5.0]} position={[-5.9, 0.86, -1.4]} color="#8a6038" />

      {/* desks: two rows, three columns, aisle in the middle */}
      {[-3.7, 3.7].map((x) =>
        [-2.6, -4.0].map((z) => <Desk key={`${x}-${z}`} position={[x, 0, z]} rotation={x === 0 ? 0.02 : -0.03} />),
      )}
      {/* teacher desk off to the left, clear of the camera line */}
      <Desk position={[-4.6, 0, 1.6]} rotation={0.6} color="#7a5532" />

      {/* door on the right wall */}
      <group position={[6.08, 0, 3.4]}>
        <Box size={[0.12, 2.5, 1.7]} position={[0, 1.35, 0]} color="#5a3c46" />
        <Box size={[0.16, 0.16, 1.9]} position={[0, 2.62, 0]} color="#3a2a3c" />
        <Box
          size={[0.05, 2.3, 1.4]}
          position={[-0.08, 1.3, 0]}
          color="#ffc98c"
          emissive="#ffab63"
          emissiveIntensity={1.3}
        />
        <pointLight position={[-0.6, 1.6, 0]} color="#ffae6a" intensity={9} distance={7} decay={2} />
      </group>

      {/* ceiling lamp */}
      <group position={[0, 3.4, -0.3]}>
        <Cylinder radiusTop={0.02} radiusBottom={0.02} height={0.45} segments={4} position={[0, -0.22, 0]} color="#2c2033" />
        <Cylinder radiusTop={0.4} radiusBottom={0.58} height={0.3} segments={10} position={[0, -0.52, 0]} color="#3a2a40" />
        <GlowSprite map={glow} scale={2.2} position={[0, -0.66, 0]} color="#ffcf94" opacity={0.28} />
        <pointLight position={[0, -0.7, 0]} color="#ffcf9a" intensity={30} distance={15} decay={2} />
      </group>
      {/* cool bounce so the warm room does not turn monochrome */}
      <pointLight position={[-4.2, 2.4, 3.6]} color="#7f8fe0" intensity={9} distance={12} decay={2} />
      <pointLight position={[4.4, 1.8, -1.2]} color="#8f7ad0" intensity={6} distance={9} decay={2} />
      {/* cool fill from the windows */}
      <pointLight position={[0, 2.1, -4.2]} color="#ffa870" intensity={9} distance={11} decay={2} />
      <pointLight position={[0, 2.3, 3.6]} color="#8f7ad0" intensity={5} distance={9} decay={2} />

    </group>
  );
};

export const World: React.FC<{scene: SceneName; t: number}> = ({scene, t}) => (
  <>
    <fog attach="fog" args={[FOG, 30, 125]} />
    <Sky />
    <hemisphereLight args={['#c492a8', '#3a2a44', 1.25]} />
    <ambientLight intensity={0.55} color="#a98aa0" />
    <directionalLight position={[-14, 11, 15]} color="#ffbe83" intensity={3.1} />
    <directionalLight position={[12, 7, -18]} color="#8f7ad0" intensity={1.15} />
    {scene === 'yard' ? <Yard t={t} /> : <Classroom t={t} />}
  </>
);
