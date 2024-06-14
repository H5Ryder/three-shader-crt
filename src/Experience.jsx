import {
  useTexture,
  OrbitControls,
  useGLTF,
  shaderMaterial,
  PresentationControls,
} from "@react-three/drei";
import {
  Canvas,
  useLoader,
  extend,
  useFrame,
  useThree,
} from "react-three-fiber";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { TextureLoader } from "three";
import { useControls } from "leva";
import {
  ToneMapping,
  EffectComposer,
  Bloom,
  Scanline,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import screenVertexShader from "./shaders/screen/vertex.glsl";
import screenFragmentShader from "./shaders/screen/fragmentExp.glsl";

const ScreenMaterial = shaderMaterial(
  {
    uPictureTexture: null,
    uRows: 358,
    uColumns: 357,
    uBarHeight: 0.3,
    uTime: 0,
    uBrightness: 1.49,
    uBarWidth: 0.05,
    uBarWidthGap: 0.05,
    uThreshold: 0.59,
    uGlitchHeight: 100,
    uGlitchSpeed: 1.0,
    uGlitchActive: 0.0,
  },
  screenVertexShader,
  screenFragmentShader
);

extend({ ScreenMaterial });

export default function Experience() {
  const { camera } = useThree();
  console.log(camera);
  const shaderRef = useRef();
  const meshRef = useRef();
  const marioImage = useLoader(TextureLoader, "mario.png");
  const blankImage = useLoader(TextureLoader, "white.png");
  const retroImage = useLoader(TextureLoader, "retro.png");

  const { nodes, materials } = useGLTF("model/suzanne.glb");

  console.log(nodes.Suzanne.geometry);

  const { backgroundColor, geometry, zoom, image } = useControls("General", {
    backgroundColor: "#000000",
    image: { options: ["blank", "mario", "retroUI"] },
    geometry: { options: ["plane", "sphere", "suzanne"] },
    zoom: {
      value: 98.7,
      min: 90,
      max: 102,
      step: 0.1,
    },
  });

  const {
    uRows,
    uColumns,
    uBarHeight,
    uBrightness,
    uBarWidth,
    uThreshold,
    uBarWidthGap,
    luminanceThreshold,
  } = useControls("Shader", {
    uRows: {
      value: 120,
      min: 0,
      max: 600,
      step: 1,
    },
    uColumns: {
      value: 200,
      min: 1,
      max: 600,
      step: 1,
    },
    uBarHeight: {
      value: 0.8,
      min: 0,
      max: 1,
      step: 0.01,
    },
    uBarWidth: {
      value: 0.25,
      min: 0,
      max: 0.5,
      step: 0.01,
    },
    uBarWidthGap: {
      value: 0.05,
      min: 0,
      max: 0.3,
      step: 0.01,
    },
    uBrightness: {
      value: 1.49,
      min: 0,
      max: 5.0,
      step: 0.001,
    },
    uThreshold: {
      value: 0.59,
      min: 0,
      max: 3,
      step: 0.01,
    },
    luminanceThreshold: {
      value: 0.5,
      min: -4,
      max: 10,
      step: 0.01,
    },
  });

  const { toggleOn, uGlitchSpeed, uGlitchHeight } = useControls("Animation", {
    toggleOn: true,
    uGlitchSpeed: {
      value: 1.0,
      min: 0.01,
      max: 10.0,
      step: 0.001,
    },
    uGlitchHeight: {
      value: 20.0,
      min: 0.01,
      max: 300.0,
      step: 0.001,
    },
  });

  const texture = useMemo(() => {
    switch (image) {
      case "blank":
        return blankImage;
      case "mario":
        return marioImage;
      case "retroUI":
        return retroImage;
      default:
        return blankImage;
    }
  });

  const geometryObject = useMemo(
    () => {
      switch (geometry) {
        case "plane":
          return <planeGeometry args={[6, 4, 300, 200]} />;
        case "sphere":
          return <sphereGeometry args={[1, 32, 32]} />;
        case "suzanne":
          return nodes.Suzanne.geometry; // Replace with the actual geometry for 'suzanne'
        default:
          return null;
      }
    },
    [geometry],
    nodes
  );

  useEffect(() => {
    shaderRef.current.uPictureTexture = texture;
  }, [texture, meshRef]);

  useFrame((state, delta) => {
    //Update Shader
    shaderRef.current.uRows = uRows;
    shaderRef.current.uColumns = uColumns;
    shaderRef.current.uBarHeight = uBarHeight;
    shaderRef.current.uBrightness = uBrightness;
    shaderRef.current.uBarWidth = uBarWidth;
    shaderRef.current.uBarWidthGap = uBarWidthGap;
    shaderRef.current.uThreshold = uThreshold;
    shaderRef.current.uTime += delta;

    shaderRef.current.uGlitchHeight = uGlitchHeight;
    shaderRef.current.uGlitchSpeed = 1/uGlitchSpeed;

    shaderRef.current.uGlitchActive = toggleOn ? 1.0 : 0.0;
    camera.position.z = 102.0 - zoom;
  });

  return (
    <>
      <EffectComposer>
        <Bloom mipmapBlur intensity={1.0} luminanceThreshold={luminanceThreshold} />
      </EffectComposer>

      <color args={[backgroundColor]} attach="background" />
      <directionalLight castShadow position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.5} />
      <axesHelper args={[2, 2, 2]} />

      <PresentationControls global polar={[-0.4, 0.9]} azimuth={[-0.9, 0.9]}>
        <mesh
          ref={meshRef}
          position={[0, 0, 0]}
          rotation={[0, geometry === "suzanne" ? -1.2 : 0, 0]}
        >
          {geometry === "suzanne" ? (
            <bufferGeometry attach="geometry" {...geometryObject} />
          ) : (
            geometryObject
          )}
          <screenMaterial
            ref={shaderRef}
            toneMapped={false}
            wireframe={false}
          />
        </mesh>
      </PresentationControls>
    </>
  );
}
