import React from 'react';
import * as THREE from 'three';

export type Vec3 = [number, number, number];

interface CommonProps {
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3 | number;
  children?: React.ReactNode;
}

interface SolidProps extends CommonProps {
  color?: string;
  map?: THREE.Texture | null;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  transparent?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  flat?: boolean;
  side?: THREE.Side;
}

const materialProps = ({
  color = '#ffffff',
  map = null,
  emissive,
  emissiveIntensity = 0,
  opacity = 1,
  transparent = false,
  side,
}: SolidProps) => ({
  color,
  map: map ?? undefined,
  emissive,
  emissiveIntensity,
  opacity,
  transparent: transparent || opacity < 1,
  side,
});

const meshTransform = ({position, rotation, scale}: CommonProps) => ({
  position,
  rotation,
  scale,
});

export const Box: React.FC<SolidProps & {size: Vec3}> = (props) => {
  const {size, children, flat, castShadow, receiveShadow} = props;
  return (
    <mesh {...meshTransform(props)} castShadow={castShadow ?? true} receiveShadow={receiveShadow ?? true}>
      <boxGeometry args={size} />
      {flat ? (
        <meshPhongMaterial {...materialProps(props)} flatShading />
      ) : (
        <meshLambertMaterial {...materialProps(props)} />
      )}
      {children}
    </mesh>
  );
};

export const Cylinder: React.FC<
  SolidProps & {radiusTop: number; radiusBottom: number; height: number; segments?: number}
> = (props) => {
  const {
    radiusTop,
    radiusBottom,
    height,
    segments = 8,
    children,
    flat,
    castShadow,
    receiveShadow,
  } = props;
  return (
    <mesh {...meshTransform(props)} castShadow={castShadow ?? true} receiveShadow={receiveShadow ?? true}>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, segments]} />
      {flat ? (
        <meshPhongMaterial {...materialProps(props)} flatShading />
      ) : (
        <meshLambertMaterial {...materialProps(props)} />
      )}
      {children}
    </mesh>
  );
};

export const Cone: React.FC<SolidProps & {radius: number; height: number; segments?: number}> = (props) => {
  const {radius, height, segments = 6, children, flat = true, castShadow, receiveShadow} = props;
  return (
    <mesh {...meshTransform(props)} castShadow={castShadow ?? true} receiveShadow={receiveShadow ?? true}>
      <coneGeometry args={[radius, height, segments]} />
      <meshPhongMaterial {...materialProps(props)} flatShading={flat} />
      {children}
    </mesh>
  );
};

export const Ico: React.FC<SolidProps & {radius: number; detail?: number}> = (props) => {
  const {radius, detail = 0, children, flat = true, castShadow, receiveShadow} = props;
  return (
    <mesh {...meshTransform(props)} castShadow={castShadow ?? true} receiveShadow={receiveShadow ?? true}>
      <icosahedronGeometry args={[radius, detail]} />
      <meshPhongMaterial {...materialProps(props)} flatShading={flat} />
      {children}
    </mesh>
  );
};

export const Sphere: React.FC<SolidProps & {radius: number; segments?: number}> = (props) => {
  const {radius, segments = 16, children, castShadow, receiveShadow} = props;
  return (
    <mesh {...meshTransform(props)} castShadow={castShadow ?? true} receiveShadow={receiveShadow ?? true}>
      <sphereGeometry args={[radius, segments, Math.max(8, Math.floor(segments / 2))]} />
      <meshLambertMaterial {...materialProps(props)} />
      {children}
    </mesh>
  );
};

export const Plane: React.FC<SolidProps & {width: number; height: number}> = (props) => {
  const {width, height, children, rotation = [-Math.PI / 2, 0, 0], receiveShadow} = props;
  return (
    <mesh
      {...meshTransform(props)}
      rotation={rotation}
      receiveShadow={receiveShadow ?? true}
    >
      <planeGeometry args={[width, height]} />
      <meshLambertMaterial
        {...materialProps({...props, side: props.side ?? THREE.DoubleSide})}
      />
      {children}
    </mesh>
  );
};

export const UnlitPlane: React.FC<
  CommonProps & {
    width: number;
    height: number;
    map?: THREE.Texture | null;
    color?: string;
    opacity?: number;
    side?: THREE.Side;
    blending?: THREE.Blending;
    depthWrite?: boolean;
    fog?: boolean;
  }
> = ({
  width,
  height,
  map,
  color = '#ffffff',
  opacity = 1,
  side = THREE.DoubleSide,
  blending,
  depthWrite = true,
  fog,
  children,
  ...props
}) => (
  <mesh {...meshTransform(props)}>
    <planeGeometry args={[width, height]} />
    <meshBasicMaterial
      map={map ?? undefined}
      color={color}
      transparent={opacity < 1 || Boolean(map)}
      opacity={opacity}
      side={side}
      blending={blending}
      depthWrite={depthWrite}
      toneMapped={false}
      fog={fog}
    />
    {children}
  </mesh>
);

export const GlowSprite: React.FC<{
  position?: Vec3;
  scale?: number;
  map: THREE.Texture;
  color?: string;
  opacity?: number;
}> = ({position = [0, 0, 0], scale = 2, map, color = '#ffffff', opacity = 0.7}) => (
  <sprite position={position} scale={[scale, scale, 1]}>
    <spriteMaterial
      map={map}
      color={color}
      transparent
      opacity={opacity}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      toneMapped={false}
    />
  </sprite>
);

export const BlobShadow: React.FC<{position?: Vec3; radius?: number; opacity?: number}> = ({
  position = [0, 0.02, 0],
  radius = 0.55,
  opacity = 0.25,
}) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[radius, 24]} />
    <meshBasicMaterial color="#10180f" transparent opacity={opacity} depthWrite={false} />
  </mesh>
);
