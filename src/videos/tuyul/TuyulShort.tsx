import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig} from '../../three/lib/camera';
import {ToonActor} from './Cast';
import {drawAdult, drawKid, drawSilhouette, drawTuyul, restPose, type Pose} from './toon';
import {AUDIO_FILE, clamp01, DURATION_FRAMES, mix, shotAt, smoother, type TimedShot} from './story';
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
  const pos: [number, number, number] = [
    mix(a.pos[0], b.pos[0], k) + (shot.scene === 'class' ? CLASS_X : 0),
    mix(a.pos[1], b.pos[1], k),
    mix(a.pos[2], b.pos[2], k),
  ];
  const target: [number, number, number] = [
    mix(a.target[0], b.target[0], k) + (shot.scene === 'class' ? CLASS_X : 0),
    mix(a.target[1], b.target[1], k),
    mix(a.target[2], b.target[2], k),
  ];
  return {position: pos, target, fov: mix(a.fov, b.fov, k), roll: 0};
};

/** gait + idle layers, all continuous in t */
const kidPose = (t: number, over: Partial<Pose> = {}): Pose => {
  const breathe = Math.sin(t * 1.75) * 0.04;
  return restPose({
    blink: blinkAt(t, 1.1),
    talk: 0,
    lookX: Math.sin(t * 0.5) * 0.2,
    lookY: breathe,
    ...over,
  });
};

const blinkAt = (t: number, first: number) => {
  const p = ((t - first) % 3.3 + 3.3) % 3.3;
  if (p < 0.1) return p / 0.1;
  if (p < 0.16) return 1;
  if (p < 0.34) return 1 - (p - 0.16) / 0.18;
  return 0;
};

const phrase = (t: number, rate = 5.2) => 0.35 + 0.65 * Math.abs(Math.sin(t * rate));

const Kid: React.FC<{
  t: number;
  x: number;
  z: number;
  pose: Pose;
  height?: number;
  shirt?: string;
  shorts?: string;
  skin?: string;
  flip?: boolean;
  opacity?: number;
}> = ({t, x, z, pose, height = 1.55, shirt, shorts, skin, flip, opacity = 1}) => (
  <ToonActor
    position={[x, 0, z]}
    height={height}
    flip={flip}
    opacity={opacity}
    draw={(ctx, time) => drawKid(ctx, time, pose, skin ?? '#f2bd8e', shirt ?? '#f7efda', shorts ?? '#3c4d7a')}
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
  const shake = shot.id === 'shout' ? Math.max(0, 1 - local / 0.5) * 0.05 : shot.id === 'reveal' ? 0.012 : 0;

  const yardKids = (() => {
    switch (shot.id) {
      case 'intro': {
        const walkAmount = Math.min(1, local / 4.6);
        const x = mix(-8.5, -1.2, smoother(walkAmount));
        const walking = walkAmount < 0.99;
        return (
          <>
            <Kid
              t={t}
              x={x}
              z={1.4}
              pose={kidPose(t, {
                walk: walking ? local * 1.55 : -1,
                lean: walking ? 3 : 0.4,
                armL: walking ? 6 + Math.sin(local * 9.7) * 16 : 8,
                armR: walking ? 6 - Math.sin(local * 9.7) * 16 : 7,
                lookX: walkAmount > 0.8 ? 0.7 : 0.2,
                blink: blinkAt(t, 1.4),
              })}
            />
            <Kid
              t={t}
              x={6.2}
              z={-3.4}
              height={1.5}
              shirt="#e5d9bd"
              shorts="#4a3f68"
              pose={kidPose(t, {yaw: -0.5, lookX: -0.6, blink: blinkAt(t, 2.1)})}
            />
          </>
        );
      }
      case 'play': {
        const runners = [
          {speed: 2.6, off: 0, z: -2.4, shirt: '#f0e6cc', shorts: '#3c4d7a'},
          {speed: 3.1, off: 5.4, z: -3.6, shirt: '#dfd0b4', shorts: '#5d4a72'},
          {speed: 2.2, off: 2.2, z: -0.8, shirt: '#f6eeda', shorts: '#4a5a86'},
        ];
        return (
          <>
            {runners.map((r, i) => {
              const span = 9.5;
              const x = ((r.off + local * r.speed) % span) - 4.2;
              return (
                <Kid
                  key={i}
                  t={t}
                  x={x}
                  z={r.z}
                  height={1.45 + i * 0.03}
                  shirt={r.shirt}
                  shorts={r.shorts}
                  pose={kidPose(t, {
                    walk: (local + i) * 2.3,
                    lean: 11,
                    armL: 10 + Math.sin((local + i) * 8.2) * 22,
                    armR: 10 - Math.sin((local + i) * 8.2) * 22,
                    lookX: 0.4,
                    talk: phrase(t, 5.5),
                    face: 1,
                  })}
                />
              );
            })}
            <Kid
              t={t}
              x={mix(-3.4, 3.4, clamp01(local / 9))}
              z={0.9}
              height={1.55}
              pose={kidPose(t, {
                walk: local * 2.4,
                lean: 10,
                armL: 12 + Math.sin(local * 8) * 20,
                armR: 12 - Math.sin(local * 8) * 20,
                lookX: 0.5,
                talk: phrase(t, 4.8),
              })}
            />
          </>
        );
      }
      case 'spot': {
        const kidLean = mix(6, -4, smoother(clamp01((local - 1.2) / 2.4)));
        return (
          <>
            <Kid
              t={t}
              x={1.1}
              z={-0.4}
              pose={kidPose(t, {
                lean: kidLean,
                yaw: mix(0, 0.55, smoother(clamp01((local - 1.4) / 2.6))),
                lookX: mix(0.2, 1, smoother(clamp01((local - 1.2) / 2.2))),
                blink: blinkAt(t, 0.9),
              })}
            />
            <ToonActor
              position={[3.4, 0, -4.5]}
              height={1.78}
              draw={(ctx, time) => drawAdult(ctx, time, 0.25 + 0.6 * smoother(clamp01((local - 5) / 3)))}
            />
            <ToonActor
              position={[2.55, 0, -4.15]}
              height={0.9}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 1}), 0.15 + 0.25 * Math.sin(time * 1.6))}
            />
          </>
        );
      }
      case 'misread': {
        const reach = smoother(clamp01((local - 1.6) / 4.2));
        return (
          <>
            <Kid
              t={t}
              x={0.55}
              z={-0.2}
              pose={kidPose(t, {
                lean: 7,
                yaw: 0.62,
                lookX: 1,
                lookY: 0.25,
                blink: blinkAt(t, 1.7),
              })}
            />
            <ToonActor
              position={[3.1, 0, -4.4]}
              height={1.78}
              draw={(ctx, time) => drawAdult(ctx, time, 0.3 + 0.7 * reach)}
            />
            <ToonActor
              position={[2.35, 0, -4.05]}
              height={0.9}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 1 - reach * 0.25}), 0.1 + reach * 0.9)}
            />
          </>
        );
      }
      case 'shout': {
        const shout = smoother(clamp01(local / 0.55));
        const run = clamp01((local - 1.1) / 2.1);
        const kidX = mix(0.6, 4.9, smoother(run));
        return (
          <>
            <Kid
              t={t}
              x={kidX}
              z={-0.4}
              pose={kidPose(t, {
                lean: mix(-4, 13, run),
                yaw: mix(0.5, 0.15, run),
                lookX: 0.9,
                wow: shout * (1 - run),
                armL: mix(26, 15 + Math.sin(t * 9) * 20, run),
                armR: mix(-40, 15 - Math.sin(t * 9) * 20, run),
                walk: run > 0.05 ? local * 2.6 : -1,
                blink: blinkAt(t, 0.6),
              })}
            />
            <ToonActor
              position={[mix(2.35, 5.2, smoother(clamp01((local - 1.4) / 2.2))), 0, -4.05]}
              height={0.9}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 0.25, lean: 12}), 1)}
            />
          </>
        );
      }
      case 'chase': {
        const p = clamp01(local / 5.2);
        return (
          <>
            <Kid
              t={t}
              x={mix(-0.4, 4.6, smoother(p))}
              z={mix(1.2, -5.4, smoother(p))}
              pose={kidPose(t, {
                walk: local * 2.7,
                lean: 14,
                armL: 12 + Math.sin(local * 9) * 24,
                armR: 12 - Math.sin(local * 9) * 24,
                lookX: 0.6,
                talk: phrase(t, 6),
              })}
            />
            <ToonActor
              position={[mix(2.9, 7.6, smoother(clamp01(local / 4.6))), 0, -5.6]}
              height={0.9}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 0.3, lean: 14}), 1)}
            />
          </>
        );
      }
      case 'vanish': {
        const p = clamp01(local / 9);
        const blinkOut = Math.sin(p * Math.PI) ** 2;
        return (
          <>
            <Kid
              t={t}
              x={mix(-2.4, 3.2, smoother(p)) + Math.sin(t * 0.8) * 0.4}
              z={mix(1.6, -4.8, smoother(p))}
              pose={kidPose(t, {
                walk: local * 1.9,
                lean: 9,
                yaw: Math.sin(t * 0.6) * 0.5,
                lookX: Math.sin(t * 0.7) * 0.8,
                blink: blinkAt(t, 0.8),
              })}
            />
            <ToonActor
              position={[mix(4.6, 9.4, smoother(p)), 0, -6.4]}
              height={0.9}
              opacity={1 - blinkOut * 0.85}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 0.35, lean: 12}), 1)}
            />
          </>
        );
      }
      default:
        return null;
    }
  })();

  const classKids = (() => {
    const revealTurn = smoother(clamp01((local - 0.4) / 1.6));
    switch (shot.id) {
      case 'door': {
        const p = clamp01(local / 6.2);
        return (
          <>
            <Kid
              t={t}
              x={mix(4.6, 1.9, smoother(p))}
              z={mix(4.4, 1.4, smoother(p))}
              pose={kidPose(t, {
                walk: local * 1.7,
                lean: 5,
                yaw: 0.35,
                lookX: 0.85,
                lookY: 0.1,
                blink: blinkAt(t, 0.9),
              })}
            />
            <ToonActor
              position={[0.3, 0, 0.9]}
              height={0.95}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 0.55, yaw: 0.2}), 0.6)}
            />
          </>
        );
      }
      case 'reveal': {
        return (
          <>
            <ToonActor
              position={[0.15, 0, 0.4]}
              height={0.98}
              draw={(ctx, time) =>
                drawTuyul(
                  ctx,
                  time,
                  restPose({crouch: 0.45 - revealTurn * 0.2, yaw: -0.3 * revealTurn}),
                  0.9,
                )
              }
            />
            <Kid
              t={t}
              x={2.35}
              z={1.55}
              height={1.55}
              pose={kidPose(t, {
                lean: -3,
                yaw: 0.35,
                lookX: 0.85,
                lookY: 0.1,
                blink: blinkAt(t, 0.7),
              })}
            />
          </>
        );
      }
      case 'stop': {
        const turn = smoother(clamp01((local - 1.2) / 3.4));
        return (
          <>
            <ToonActor
              position={[0.2, 0, 0.35]}
              height={0.98}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 0.4, yaw: mix(0, 1, turn)}), 1)}
            />
            <Kid
              t={t}
              x={2.2}
              z={1.5}
              height={1.55}
              pose={kidPose(t, {
                lean: -2,
                yaw: 0.3,
                lookX: 0.85,
                lookY: 0.15,
                blink: blinkAt(t, 1.1),
              })}
            />
          </>
        );
      }
      case 'window': {
        return (
          <>
            <ToonActor
              position={[0.2, 0, 0.2]}
              height={0.98}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 0.3, yaw: 1}), 1)}
            />
            <Kid
              t={t}
              x={2.15}
              z={1.4}
              height={1.55}
              pose={kidPose(t, {
                lean: 1,
                yaw: 0.55,
                lookX: 0.65,
                lookY: -0.2,
                blink: blinkAt(t, 0.6),
                wow: 0.45,
              })}
            />
            <ToonActor
              position={[0.2, 0, -3.85]}
              height={1.82}
              opacity={0.92}
              shadow={false}
              draw={(ctx, time) => drawSilhouette(ctx, time)}
            />
          </>
        );
      }
      case 'end': {
        const p = clamp01(local / 8);
        return (
          <>
            <ToonActor
              position={[0.2, 0, 0.25]}
              height={0.98}
              draw={(ctx, time) => drawTuyul(ctx, time, restPose({crouch: 0.35, yaw: 1}), 1)}
            />
            <Kid
              t={t}
              x={2.3}
              z={1.45}
              height={1.55}
              opacity={1 - p * 0.15}
              pose={kidPose(t, {
                lean: 0,
                yaw: 0.6,
                lookX: 0.5,
                lookY: -0.15,
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

  const fadeIn = clamp01(t / 1.2);
  const fadeOut = 1 - clamp01((t - shot.end + 0.9) / 0.9) * 0.0;
  const endFade = shot.id === 'end' ? 1 - clamp01((local - 6.5) / 2.2) : 1;
  const black = Math.min(1 - fadeIn, 1 - endFade * fadeOut);

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
        <CameraRig pose={{position: cam.position, target: cam.target, fov: cam.fov}} frame={frame} shake={shake} handheld={shot.id === 'reveal' ? 0.004 : 0.008} />
        <World scene={shot.scene} t={t} />
        {shot.scene === 'yard' ? yardKids : classKids}
      </ThreeCanvas>

      {/* grade + vignette: warm dusk lift, soft edges, no letterbox */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 42%, rgba(14,8,22,0.55) 100%), linear-gradient(180deg, rgba(38,18,48,0.16) 0%, rgba(0,0,0,0) 32%, rgba(255,150,80,0.05) 72%, rgba(10,6,16,0.35) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(255,170,110,0.10) 0%, rgba(255,150,90,0.02) 40%, rgba(90,40,90,0.10) 100%)',
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill style={{pointerEvents: 'none', backgroundColor: '#0b0710', opacity: black}} />
    </AbsoluteFill>
  );
};

export const TUYUL_DURATION = DURATION_FRAMES;
