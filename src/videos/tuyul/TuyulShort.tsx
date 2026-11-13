import React, {useLayoutEffect} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {CameraRig} from '../../three/lib/camera';
import {ToonActor} from './Cast';
import {
  blinkAt,
  drawAdult,
  drawKid,
  drawSilhouette,
  drawTuyul,
  drawTuyulBlur,
  restPose,
  type Pose,
} from './toon';
import {AUDIO_FILE, DURATION_FRAMES, clamp01, mix, shotAt, smoother, type TimedShot} from './story';
import {World} from './World';

const CLASS_X = 120;

const sampleCam = (shot: TimedShot, u: number) => {
  const keys = shot.cam;
  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (u >= keys[i].at && u <= keys[i + 1].at) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  const span = Math.max(0.0001, b.at - a.at);
  const k = smoother((u - a.at) / span);
  const off = shot.scene === 'class' ? CLASS_X : 0;
  return {
    position: [mix(a.pos[0], b.pos[0], k) + off, mix(a.pos[1], b.pos[1], k), mix(a.pos[2], b.pos[2], k)] as [
      number,
      number,
      number,
    ],
    target: [mix(a.target[0], b.target[0], k) + off, mix(a.target[1], b.target[1], k), mix(a.target[2], b.target[2], k)] as [
      number,
      number,
      number,
    ],
    fov: mix(a.fov, b.fov, k),
  };
};

const Exposure: React.FC<{value: number}> = ({value}) => {
  const {gl} = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = value;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl, value]);
  return null;
};

const kidPose = (t: number, over: Partial<Pose> = {}): Pose =>
  restPose({
    blink: blinkAt(t, 1.2),
    talk: 0,
    lookX: Math.sin(t * 0.5) * 0.12,
    lookY: Math.sin(t * 1.8) * 0.04,
    ...over,
  });

const chatter = (t: number, rate = 5.2) => 0.25 + 0.75 * Math.abs(Math.sin(t * rate));

const Kid: React.FC<{
  x: number;
  z: number;
  pose: Pose;
  height?: number;
  shirt?: string;
  shorts?: string;
  skin?: string;
  opacity?: number;
}> = ({x, z, pose, height = 1.8, shirt = '#fbeeda', shorts = '#34436e', skin = '#f3bd8c', opacity = 1}) => (
  <ToonActor
    position={[x, 0, z]}
    height={height}
    opacity={opacity}
    draw={(ctx, time) => drawKid(ctx, time, pose, skin, shirt, shorts)}
  />
);

export const TuyulShort: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const shot = shotAt(t);
  const local = t - shot.start;
  const u = clamp01(local / Math.max(0.001, shot.end - shot.start));
  const cam = sampleCam(shot, u);
  const shake = shot.id === 'shout' ? Math.max(0, 1 - local / 0.6) * 0.06 : 0;

  /* ------------------------------------------------------------- yard acting */

  const yardKids = (() => {
    switch (shot.id) {
      case 'intro': {
        const p = smoother(clamp01(local / 8.2));
        const walking = local < 8.2;
        const x = mix(0.8, 0.35, p);
        const z = mix(4.4, 0.8, p);
        const turn = smoother(clamp01((local - 8.4) / 1.6));
        return (
          <Kid
            x={x}
            z={z}
            pose={kidPose(t, {
              walk: walking ? local * 1.9 : -1,
              lean: walking ? 3 : 0.5,
              armL: walking ? 10 + Math.sin(local * 10.2) * 18 : 9,
              armR: walking ? 10 - Math.sin(local * 10.2) * 18 : 7,
              yaw: turn * 0.7,
              lookX: 0.15 + turn * 0.55,
              lookY: 0.1,
            })}
          />
        );
      }
      case 'play': {
        const players = [
          {x: 0.35, z: -1.6, h: 1.79, shirt: '#fbeeda', shorts: '#34436e', ph: 0.0},
          {x: -0.55, z: -2.35, h: 1.74, shirt: '#efdcc0', shorts: '#5a4776', ph: 1.9},
          {x: 1.0, z: -2.75, h: 1.71, shirt: '#f6e7cd', shorts: '#3f577f', ph: 3.4},
        ];
        return (
          <>
            {players.map((r, i) => {
              const x = r.x + Math.sin(local * 1.15 + r.ph) * 0.26;
              return (
                <Kid
                  key={i}
                  x={x}
                  z={r.z}
                  height={r.h}
                  shirt={r.shirt}
                  shorts={r.shorts}
                  pose={kidPose(t, {
                    walk: local * 1.7 + i * 1.7,
                    lean: 5,
                    armL: 14 + Math.sin((local + i) * 3.4) * 20,
                    armR: 14 - Math.sin((local + i) * 3.4) * 20,
                    lookX: i === 0 ? 0.3 : -0.4,
                    talk: i === 0 ? chatter(t, 5.4) : 0,
                  })}
                />
              );
            })}
          </>
        );
      }
      case 'spot': {
        return (
          <>
            <ToonActor
              position={[1.0, 0, -1.2]}
              height={2.05}
              draw={(ctx, time) => drawAdult(ctx, time, 0.3 + 0.55 * smoother(clamp01((local - 4) / 5)))}
            />
            <ToonActor
              position={[0.35, 0, -0.75]}
              height={1.35}
              draw={(ctx, time) => drawTuyulBlur(ctx, time)}
            />
          </>
        );
      }
      case 'misread': {
        const reach = smoother(clamp01((local - 2.0) / 6.0));
        return (
          <>
            <ToonActor
              position={[1.2, 0, -1.8]}
              height={2.05}
              draw={(ctx, time) => drawAdult(ctx, time, 0.3 + 0.7 * reach)}
            />
            <ToonActor
              position={[0.6, 0, -1.4]}
              height={1.35}
              draw={(ctx, time) => drawTuyulBlur(ctx, time)}
            />
          </>
        );
      }
      case 'shout': {
        const shout = smoother(clamp01(local / 0.5));
        const run = smoother(clamp01((local - 1.3) / 2.2));
        return (
          <>
            <Kid
              x={mix(1.3, 2.0, run)}
              z={mix(-0.2, -3.0, run)}
              pose={kidPose(t, {
                lean: mix(-4, 13, run),
                yaw: mix(0.35, 0.1, run),
                lookX: 0.85,
                wow: shout * (1 - run),
                armL: mix(30, 12 + Math.sin(t * 10) * 22, run),
                armR: mix(-46, 12 - Math.sin(t * 10) * 22, run),
                walk: run > 0.04 ? local * 2.9 : -1,
                blink: blinkAt(t, 0.6),
              })}
            />
            <ToonActor
              position={[mix(0.9, 2.6, smoother(clamp01((local - 1.5) / 2.2))), 0, mix(-1.4, -3.8, smoother(clamp01((local - 1.5) / 2.2)))]}
              height={1.35}
              draw={(ctx, time) => drawTuyulBlur(ctx, time)}
            />
          </>
        );
      }
      case 'chase': {
        const p = smoother(clamp01(local / 8.5));
        return (
          <>
            <Kid
              x={mix(-3.3, 1.6, p)}
              z={-4.4}
              pose={kidPose(t, {
                walk: local * 3.2,
                lean: 14,
                armL: 14 + Math.sin(local * 11) * 26,
                armR: 14 - Math.sin(local * 11) * 26,
                yaw: 0.3,
                lookX: 0.7,
                talk: chatter(t, 6.2),
              })}
            />
            <ToonActor
              position={[mix(-1.0, 3.6, smoother(clamp01(local / 7.2))), 0, -4.3]}
              height={1.35}
              draw={(ctx, time) => drawTuyulBlur(ctx, time)}
            />
          </>
        );
      }
      case 'vanish': {
        const p = smoother(clamp01(local / 12));
        const pulse = 0.35 + 0.65 * Math.abs(Math.sin(local * 0.85));
        return (
          <>
            <Kid
              x={mix(1.6, -0.9, p)}
              z={mix(0.8, -3.4, p)}
              pose={kidPose(t, {
                walk: local * 1.8,
                lean: 8,
                yaw: Math.sin(t * 0.55) * 0.55,
                lookX: Math.sin(t * 0.7) * 0.85,
                blink: blinkAt(t, 0.8),
              })}
            />
            <ToonActor
              position={[0.9, 0, -4.4]}
              height={1.35}
              opacity={pulse * 0.95}
              draw={(ctx, time) => drawTuyulBlur(ctx, time)}
            />
          </>
        );
      }
      default:
        return null;
    }
  })();

  /* -------------------------------------------------------- classroom acting */

  const classKids = (() => {
    switch (shot.id) {
      case 'door': {
        const p = smoother(clamp01(local / 6.4));
        return (
          <>
            <Kid
              x={mix(2.2, 0.9, p)}
              z={mix(3.6, 1.2, p)}
              pose={kidPose(t, {
                walk: local * 1.8,
                lean: 4,
                yaw: 0.3,
                lookX: 0.85,
                lookY: 0.05,
                blink: blinkAt(t, 0.9),
              })}
            />
            <ToonActor
              position={[0.15, 0, 0.4]}
              height={1.35}
              draw={(ctx, time) => drawTuyulBlur(ctx, time)}
            />
          </>
        );
      }
      case 'reveal': {
        const turn = smoother(clamp01((local - 0.6) / 2.4));
        return (
          <>
            <ToonActor
              position={[0.2, 0, 0.4]}
              height={1.15}
              draw={(ctx, time) =>
                drawTuyul(ctx, time, restPose({crouch: 0.4 - turn * 0.22, yaw: -0.25 * turn}), 1)
              }
            />
            <Kid
              x={1.25}
              z={0.9}
              pose={kidPose(t, {
                lean: -4,
                yaw: 0.35,
                lookX: 0.9,
                lookY: 0.05,
                wow: 0.4,
                blink: blinkAt(t, 1.4),
              })}
            />
          </>
        );
      }
      case 'stop': {
        return (
          <>
            <ToonActor
              position={[0.25, 0, 0.35]}
              height={1.15}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 0.32, yaw: 0.05}), 1)}
            />
            <Kid
              x={1.3}
              z={0.6}
              pose={kidPose(t, {
                lean: -2,
                yaw: 0.32,
                lookX: 0.9,
                lookY: 0.1,
                wow: 0.18,
                blink: blinkAt(t, 1.1),
              })}
            />
          </>
        );
      }
      case 'window': {
        const turn = smoother(clamp01((local - 0.8) / 3.2));
        return (
          <>
            <ToonActor
              position={[0.2, 0, 0.4]}
              height={1.15}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 0.28, yaw: 0.1 + turn * 0.85}), 0.7)}
            />
            <Kid
              x={0.55}
              z={0.9}
              pose={kidPose(t, {
                lean: 1,
                yaw: 0.4,
                lookX: 0.3,
                lookY: -0.15,
                wow: 0.35,
                blink: blinkAt(t, 0.6),
              })}
            />
            <ToonActor
              position={[-0.95, 0.72, -5.35]}
              height={2.0}
              shadow={false}
              draw={(ctx, time) => drawSilhouette(ctx, time)}
            />
          </>
        );
      }
      case 'end': {
        const p = clamp01(local / 9);
        return (
          <>
            <ToonActor
              position={[0.2, 0, 0.4]}
              height={1.15}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 0.3, yaw: 0.9}), 0.6)}
            />
            <Kid
              x={1.15}
              z={0.5}
              opacity={1 - p * 0.2}
              pose={kidPose(t, {
                lean: 0,
                yaw: 0.55,
                lookX: 0.35,
                lookY: -0.1,
                blink: blinkAt(t, 1.3),
              })}
            />
          </>
        );
      }
      default:
        return null;
    }
  })();

  const fadeIn = clamp01(t / 1.1);
  const endFade = shot.id === 'end' ? 1 - clamp01((local - 9.2) / 3.2) : 1;
  const black = Math.min(1 - fadeIn, 1 - endFade);

  return (
    <AbsoluteFill style={{backgroundColor: '#120c19'}}>
      <Audio src={staticFile(AUDIO_FILE)} />
      <ThreeCanvas
        width={1080}
        height={1920}
        camera={{position: cam.position, fov: cam.fov, near: 0.1, far: 260}}
        gl={{antialias: true}}
        style={{position: 'absolute', inset: 0}}
      >
        <Exposure value={1.22} />
        <CameraRig
          pose={{position: cam.position, target: cam.target, fov: cam.fov}}
          frame={frame}
          shake={shake}
          handheld={shot.id === 'reveal' ? 0.0035 : 0.006}
        />
        <World scene={shot.scene} t={t} />
        {shot.scene === 'yard' ? yardKids : <group position={[CLASS_X, 0, 0]}>{classKids}</group>}
      </ThreeCanvas>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 48%, rgba(18,10,26,0.5) 100%), linear-gradient(180deg, rgba(46,26,60,0.14) 0%, rgba(0,0,0,0) 34%, rgba(255,160,90,0.04) 74%, rgba(12,7,18,0.3) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(255,180,120,0.09) 0%, rgba(255,150,90,0.02) 45%, rgba(90,44,96,0.08) 100%)',
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill style={{pointerEvents: 'none', backgroundColor: '#0b0710', opacity: black}} />
    </AbsoluteFill>
  );
};

export const TUYUL_DURATION = DURATION_FRAMES;
