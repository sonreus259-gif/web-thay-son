"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type BgThemeType = "twilight" | "sunset" | "core";

interface Character3DProps {
  modelUrl: string;
  bgTheme?: BgThemeType;
}

// Lighting configuration presets matching each background theme
const THEME_LIGHTING: Record<
  BgThemeType,
  {
    ambientColor: number;
    ambientIntensity: number;
    keyColor: number;
    keyIntensity: number;
    rimLeftColor: number;
    rimLeftIntensity: number;
    rimRightColor: number;
    rimRightIntensity: number;
    rimCenterColor: number;
    rimCenterIntensity: number;
    fillColor: number;
    fillIntensity: number;
  }
> = {
  // 1. Dreamframe Twilight: Soft lavender sky + warm golden portal glow
  twilight: {
    ambientColor: 0xf5f3ff,
    ambientIntensity: 2.0,
    keyColor: 0xfffdf5, // Clean warm studio white - keeps skin and nose natural
    keyIntensity: 2.5,
    rimLeftColor: 0xc084fc, // Soft lavender rim from twilight clouds
    rimLeftIntensity: 2.8,
    rimRightColor: 0xfbbf24, // Warm golden rim from train & horizon
    rimRightIntensity: 2.0,
    rimCenterColor: 0xfef08a, // Portal golden halo behind head
    rimCenterIntensity: 3.2,
    fillColor: 0xede9fe,
    fillIntensity: 0.8,
  },
  // 2. Dreamframe Sunset: Soft pastel pink & radiant sunrise rays
  sunset: {
    ambientColor: 0xfff1f2,
    ambientIntensity: 2.1,
    keyColor: 0xffffff, // Pure white key light
    keyIntensity: 2.6,
    rimLeftColor: 0xf472b6, // Soft pastel pink rim
    rimLeftIntensity: 2.5,
    rimRightColor: 0xfde047, // Soft sunny gold rim
    rimRightIntensity: 2.2,
    rimCenterColor: 0xffedd5, // Radiant sunbeam halo
    rimCenterIntensity: 3.0,
    fillColor: 0xfce7f3,
    fillIntensity: 0.8,
  },
  // 3. High-Tech Quantum Core: Cyber cyan + electric sapphire blue (NO RED NOSE ARTIFACTS!)
  core: {
    ambientColor: 0xe0e7ff, // Crisp cool ambient
    ambientIntensity: 1.8,
    keyColor: 0xffffff, // Clean neutral studio light - flawless skin tone
    keyIntensity: 2.6,
    rimLeftColor: 0x00e5ff, // Cyber electric cyan
    rimLeftIntensity: 3.5,
    rimRightColor: 0x3b82f6, // Electric sapphire blue
    rimRightIntensity: 2.8,
    rimCenterColor: 0x818cf8, // Indigo / violet holographic core glow
    rimCenterIntensity: 2.8,
    fillColor: 0x0284c7, // Upward subtle cyber blue bounce
    fillIntensity: 0.6,
  },
};

export default function Character3D({
  modelUrl,
  bgTheme = "twilight",
}: Character3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // References for animation
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isDragging: false,
    prevX: 0,
    prevY: 0,
  });
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const basePositionYRef = useRef<number>(-0.95);

  // Light References for dynamic theme updates
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLeftRef = useRef<THREE.DirectionalLight | null>(null);
  const rimRightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimCenterRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.PointLight | null>(null);

  // Dynamic light update when bgTheme changes
  useEffect(() => {
    const preset = THEME_LIGHTING[bgTheme] || THEME_LIGHTING.twilight;

    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(preset.ambientColor);
      ambientLightRef.current.intensity = preset.ambientIntensity;
    }
    if (keyLightRef.current) {
      keyLightRef.current.color.setHex(preset.keyColor);
      keyLightRef.current.intensity = preset.keyIntensity;
    }
    if (rimLeftRef.current) {
      rimLeftRef.current.color.setHex(preset.rimLeftColor);
      rimLeftRef.current.intensity = preset.rimLeftIntensity;
    }
    if (rimRightRef.current) {
      rimRightRef.current.color.setHex(preset.rimRightColor);
      rimRightRef.current.intensity = preset.rimRightIntensity;
    }
    if (rimCenterRef.current) {
      rimCenterRef.current.color.setHex(preset.rimCenterColor);
      rimCenterRef.current.intensity = preset.rimCenterIntensity;
    }
    if (fillLightRef.current) {
      fillLightRef.current.color.setHex(preset.fillColor);
      fillLightRef.current.intensity = preset.fillIntensity;
    }
  }, [bgTheme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Renderer setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 950;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.85);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18; // Balanced exposure to prevent nose color blowout
    container.appendChild(renderer.domElement);

    // Calculate visible height at z = 0
    const updateCameraAndBounds = () => {
      const halfFovRad = (camera.fov / 2) * (Math.PI / 180);
      const visibleHalfHeight = Math.tan(halfFovRad) * camera.position.z;
      basePositionYRef.current = -visibleHalfHeight * 1.0; // Anchor right at the bottom edge
      return visibleHalfHeight;
    };

    let visibleHalfHeight = updateCameraAndBounds();

    // 2. Initialize Dynamic Lights with current preset
    const preset = THEME_LIGHTING[bgTheme] || THEME_LIGHTING.twilight;

    // Ambient
    const ambientLight = new THREE.AmbientLight(
      preset.ambientColor,
      preset.ambientIntensity
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Key front studio light
    const keyLight = new THREE.DirectionalLight(
      preset.keyColor,
      preset.keyIntensity
    );
    keyLight.position.set(1.2, 3.2, 3.5);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Left Rim
    const rimLeft = new THREE.DirectionalLight(
      preset.rimLeftColor,
      preset.rimLeftIntensity
    );
    rimLeft.position.set(-3.2, 2.5, -2.5);
    scene.add(rimLeft);
    rimLeftRef.current = rimLeft;

    // Right Rim
    const rimRight = new THREE.DirectionalLight(
      preset.rimRightColor,
      preset.rimRightIntensity
    );
    rimRight.position.set(3.2, 2.5, -2.5);
    scene.add(rimRight);
    rimRightRef.current = rimRight;

    // Center Back Halo / Portal Rim
    const rimCenter = new THREE.DirectionalLight(
      preset.rimCenterColor,
      preset.rimCenterIntensity
    );
    rimCenter.position.set(0, 3.0, -3.5);
    scene.add(rimCenter);
    rimCenterRef.current = rimCenter;

    // Upward Fill Light
    const fillLight = new THREE.PointLight(
      preset.fillColor,
      preset.fillIntensity,
      8
    );
    fillLight.position.set(0, -1.5, 1.2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // 3. Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // 4. Load GLB
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;

        // Tune materials to avoid harsh specular shine on nose
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const materials = Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.roughness = Math.max(mat.roughness, 0.42);
                  mat.envMapIntensity = 0.85;
                }
              });
            }
          }
        });

        // Auto center and scale
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Perfect scale: stretches from bottom of screen up to upper chest & head
        const desiredHeight = visibleHalfHeight * 1.86;
        const scale = desiredHeight / (size.y || 1);
        modelGroup.scale.set(scale, scale, scale);

        // Center X & Z, place lowest point of jacket at local y = 0
        root.position.x = -center.x;
        root.position.y = -box.min.y;
        root.position.z = -center.z;

        // Anchor base at bottom of screen
        modelGroup.position.y = basePositionYRef.current;
        modelGroup.position.x = 0;

        modelGroup.add(root);
        setIsLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(percent);
        } else {
          setLoadingProgress((prev) => Math.min(prev + 5, 95));
        }
      },
      (error) => {
        console.error("Error loading GLTF:", error);
        setIsLoading(false);
      }
    );

    // 5. Mouse interactions
    const handleMouseMoveWindow = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const targetX = (e.clientX / innerWidth - 0.5) * 2;
      const targetY = (e.clientY / innerHeight - 0.5) * 2;

      mouseRef.current.targetX = targetX;
      mouseRef.current.targetY = targetY;

      if (mouseRef.current.isDragging) {
        const deltaX = e.clientX - mouseRef.current.prevX;
        const deltaY = e.clientY - mouseRef.current.prevY;
        mouseRef.current.x += deltaX * 0.005;
        mouseRef.current.y += deltaY * 0.005;
        mouseRef.current.prevX = e.clientX;
        mouseRef.current.prevY = e.clientY;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDragging = true;
      mouseRef.current.prevX = e.clientX;
      mouseRef.current.prevY = e.clientY;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMoveWindow);

    // 6. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      visibleHalfHeight = updateCameraAndBounds();
      if (modelGroupRef.current) {
        modelGroupRef.current.position.y = basePositionYRef.current;
      }
    };
    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (modelGroupRef.current) {
        if (!mouseRef.current.isDragging) {
          mouseRef.current.x +=
            (mouseRef.current.targetX * 0.38 - mouseRef.current.x) * 0.06;
          mouseRef.current.y +=
            (mouseRef.current.targetY * 0.18 - mouseRef.current.y) * 0.06;
        }

        // Apply smooth rotation
        modelGroupRef.current.rotation.y = mouseRef.current.x;
        modelGroupRef.current.rotation.x = mouseRef.current.y * 0.35;

        // Subtle organic breathing motion anchored at the bottom
        modelGroupRef.current.position.y =
          basePositionYRef.current + Math.sin(elapsedTime * 1.5) * 0.012;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMoveWindow);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  return (
    <div className="relative w-full h-full flex items-end justify-center cursor-grab active:cursor-grabbing">
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full relative z-20 flex items-end justify-center pointer-events-auto"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 90%, black 98%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 90%, black 98%, transparent 100%)",
        }}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-30 pointer-events-none">
          <div className="relative w-14 h-14 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
            <div
              className="absolute inset-2 rounded-full border-2 border-amber-400/30 border-b-amber-400 animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.2s",
              }}
            />
          </div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-white">
            Đang tải mô hình 3D...
          </span>
          <span className="text-[11px] font-mono text-cyan-400 mt-1">
            {loadingProgress}%
          </span>
        </div>
      )}
    </div>
  );
}
