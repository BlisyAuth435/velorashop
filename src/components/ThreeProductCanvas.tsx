import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Compass, Sparkles, Eye, Check } from 'lucide-react';
import { Product, ProductColor } from '../types';

interface ThreeProductCanvasProps {
  product: Product;
  selectedColor?: ProductColor;
  onColorChange?: (color: ProductColor) => void;
  className?: string;
}

export const ThreeProductCanvas: React.FC<ThreeProductCanvasProps> = ({
  product,
  selectedColor,
  onColorChange,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeAngle, setActiveAngle] = useState<'iso' | 'front' | 'top' | 'side'>('iso');
  const [currentColor, setCurrentColor] = useState<ProductColor>(
    selectedColor || (product.colors && product.colors[0]) || { name: 'Titanium Graphite', hex: '#24262f' }
  );

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const mainMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationVelocity = useRef<{ x: number; y: number }>({ x: 0, y: 0.005 });

  // Update internal color if prop changes
  useEffect(() => {
    if (selectedColor) {
      setCurrentColor(selectedColor);
    }
  }, [selectedColor]);

  // Update 3D material color when currentColor changes
  useEffect(() => {
    if (mainMeshRef.current && mainMeshRef.current.material) {
      const mat = mainMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(currentColor.hex);
    }
  }, [currentColor]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.8, 2.2, 3.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6eb, 2.8);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x738aff, 2.2);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const warmFillLight = new THREE.PointLight(0xd4af37, 1.8, 8);
    warmFillLight.position.set(0, -1, 3);
    scene.add(warmFillLight);

    // Subtle Ground Shadow Disc
    const groundGeo = new THREE.PlaneGeometry(8, 8);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.15;
    ground.receiveShadow = true;
    scene.add(ground);

    // Pedestal Ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.35, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -1.14;
    scene.add(ringMesh);

    // Procedural High-Fidelity 3D Model Group
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Determine model type from product
    const modelType = product.model3dType || (product.category.toLowerCase().includes('cooker') ? 'cooker' : 'bottle');

    if (modelType === 'cooker') {
      // 1. Cooker Body
      const bodyGeo = new THREE.CylinderGeometry(1.0, 0.92, 1.25, 48);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(currentColor.hex),
        metalness: 0.85,
        roughness: 0.25,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      modelGroup.add(bodyMesh);
      mainMeshRef.current = bodyMesh;

      // Chrome Accent Rim
      const rimGeo = new THREE.TorusGeometry(1.01, 0.04, 16, 64);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.1,
      });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 0.62;
      modelGroup.add(rimMesh);

      // Cooker Lid Dome (Glass/Stainless)
      const lidGeo = new THREE.SphereGeometry(0.98, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.35);
      const lidMat = new THREE.MeshPhysicalMaterial({
        color: 0x1f242d,
        metalness: 0.5,
        roughness: 0.15,
        transmission: 0.3,
        thickness: 0.5,
      });
      const lidMesh = new THREE.Mesh(lidGeo, lidMat);
      lidMesh.position.y = 0.55;
      lidMesh.castShadow = true;
      modelGroup.add(lidMesh);

      // Lid Handle Cap
      const handleGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.25, 32);
      const handleMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.9,
        roughness: 0.2,
      });
      const handleMesh = new THREE.Mesh(handleGeo, handleMat);
      handleMesh.position.y = 0.98;
      modelGroup.add(handleMesh);

      // Front OLED Control Dial
      const dialGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 32);
      const dialMat = new THREE.MeshStandardMaterial({
        color: 0x050608,
        metalness: 0.9,
        roughness: 0.1,
      });
      const dialMesh = new THREE.Mesh(dialGeo, dialMat);
      dialMesh.rotation.x = Math.PI / 2;
      dialMesh.position.set(0, 0.05, 0.95);
      modelGroup.add(dialMesh);

      // LED Glow Ring around Dial
      const ledRingGeo = new THREE.TorusGeometry(0.31, 0.02, 16, 32);
      const ledRingMat = new THREE.MeshBasicMaterial({ color: 0x48cae4 });
      const ledRing = new THREE.Mesh(ledRingGeo, ledRingMat);
      ledRing.position.set(0, 0.05, 0.98);
      modelGroup.add(ledRing);

      // Side Handles
      const sideHandleGeo = new THREE.TorusGeometry(0.32, 0.05, 16, 24, Math.PI);
      const sideHandleMat = new THREE.MeshStandardMaterial({ color: 0x15161a, metalness: 0.6, roughness: 0.4 });
      
      const leftHandle = new THREE.Mesh(sideHandleGeo, sideHandleMat);
      leftHandle.rotation.z = -Math.PI / 2;
      leftHandle.position.set(-1.0, 0.25, 0);
      modelGroup.add(leftHandle);

      const rightHandle = new THREE.Mesh(sideHandleGeo, sideHandleMat);
      rightHandle.rotation.z = Math.PI / 2;
      rightHandle.position.set(1.0, 0.25, 0);
      modelGroup.add(rightHandle);

    } else if (modelType === 'bottle') {
      // Luxury Dropper / Supplement Bottle
      const bottleGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.6, 40);
      const bottleMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(currentColor.hex),
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.65,
        thickness: 1.2,
      });
      const bottleMesh = new THREE.Mesh(bottleGeo, bottleMat);
      bottleMesh.castShadow = true;
      bottleMesh.receiveShadow = true;
      modelGroup.add(bottleMesh);
      mainMeshRef.current = bottleMesh;

      // Bottle Shoulder
      const shoulderGeo = new THREE.CylinderGeometry(0.35, 0.65, 0.4, 40);
      const shoulderMat = bottleMat.clone();
      const shoulderMesh = new THREE.Mesh(shoulderGeo, shoulderMat);
      shoulderMesh.position.y = 1.0;
      modelGroup.add(shoulderMesh);

      // Gold Metallic Cap Collar
      const collarGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.45, 32);
      const collarMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.15,
      });
      const collarMesh = new THREE.Mesh(collarGeo, collarMat);
      collarMesh.position.y = 1.35;
      modelGroup.add(collarMesh);

      // Dropper Pipette Bulb
      const bulbGeo = new THREE.SphereGeometry(0.24, 24, 24);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: 0x1f2229,
        roughness: 0.8,
      });
      const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
      bulbMesh.position.y = 1.65;
      modelGroup.add(bulbMesh);

      // Luxury Label Wrapper
      const labelGeo = new THREE.CylinderGeometry(0.66, 0.66, 1.0, 40, 1, true, 0, Math.PI * 1.5);
      const labelMat = new THREE.MeshStandardMaterial({
        color: 0xf7f5f0,
        roughness: 0.4,
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.y = 0;
      modelGroup.add(labelMesh);

    } else {
      // Luxury Minimalist Floating Apparel Pod
      const baseGeo = new THREE.BoxGeometry(1.4, 0.2, 1.4);
      const baseMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(currentColor.hex),
        metalness: 0.6,
        roughness: 0.3,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.castShadow = true;
      modelGroup.add(baseMesh);
      mainMeshRef.current = baseMesh;

      // Floating Torus Emblem
      const emblemGeo = new THREE.TorusKnotGeometry(0.5, 0.14, 80, 16);
      const emblemMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.9,
        roughness: 0.15,
      });
      const emblem = new THREE.Mesh(emblemGeo, emblemMat);
      emblem.position.y = 0.65;
      emblem.castShadow = true;
      modelGroup.add(emblem);
    }

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (modelGroupRef.current) {
        if (autoRotate && !isDraggingRef.current) {
          modelGroupRef.current.rotation.y += 0.008;
        } else if (!isDraggingRef.current) {
          // Dampen velocity
          modelGroupRef.current.rotation.y += rotationVelocity.current.y;
          modelGroupRef.current.rotation.x += rotationVelocity.current.x;
          rotationVelocity.current.y *= 0.92;
          rotationVelocity.current.x *= 0.92;
        }

        // Gentle breathing float
        modelGroupRef.current.position.y = Math.sin(now * 0.0018) * 0.05;
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Mouse / Touch Event Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !modelGroupRef.current) return;
      const deltaX = e.clientX - prevMousePos.current.x;
      const deltaY = e.clientY - prevMousePos.current.y;

      const rotY = deltaX * 0.008;
      const rotX = deltaY * 0.008;

      modelGroupRef.current.rotation.y += rotY;
      modelGroupRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, modelGroupRef.current.rotation.x + rotX));

      rotationVelocity.current = { x: rotX, y: rotY };
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !modelGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.current.x;
      const deltaY = e.touches[0].clientY - prevMousePos.current.y;

      modelGroupRef.current.rotation.y += deltaX * 0.01;
      modelGroupRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, modelGroupRef.current.rotation.x + deltaY * 0.01));

      prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    // Wheel zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const factor = e.deltaY > 0 ? 1.08 : 0.92;
      const newPos = cameraRef.current.position.clone().multiplyScalar(factor);
      const dist = newPos.length();
      if (dist >= 2.5 && dist <= 8) {
        cameraRef.current.position.copy(newPos);
        setZoomLevel(Math.round((5 / dist) * 10) / 10);
      }
    };

    const el = renderer.domElement;
    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('wheel', handleWheel, { passive: false });

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [product.model3dType, product.category]);

  // Set Camera Angles
  const setCameraPreset = useCallback((preset: 'iso' | 'front' | 'top' | 'side') => {
    setActiveAngle(preset);
    if (!cameraRef.current || !modelGroupRef.current) return;

    // Reset model tilt
    modelGroupRef.current.rotation.x = 0;
    
    switch (preset) {
      case 'iso':
        cameraRef.current.position.set(2.8, 2.2, 3.8);
        break;
      case 'front':
        cameraRef.current.position.set(0, 0.4, 4.8);
        break;
      case 'top':
        cameraRef.current.position.set(0.1, 5.2, 0.8);
        break;
      case 'side':
        cameraRef.current.position.set(4.8, 0.5, 0.2);
        break;
    }
    cameraRef.current.lookAt(0, 0, 0);
  }, []);

  const handleZoomChange = (delta: number) => {
    if (!cameraRef.current) return;
    const factor = delta > 0 ? 0.85 : 1.15;
    const newPos = cameraRef.current.position.clone().multiplyScalar(factor);
    const dist = newPos.length();
    if (dist >= 2.2 && dist <= 8.5) {
      cameraRef.current.position.copy(newPos);
      setZoomLevel(Math.round((5 / dist) * 10) / 10);
    }
  };

  const handleColorPick = (col: ProductColor) => {
    setCurrentColor(col);
    if (onColorChange) onColorChange(col);
  };

  return (
    <div className={`relative w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden glass-panel select-none group ${className}`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Badges */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Time 3D Engine • Three.js</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-neutral-300">
          <Eye className="w-3.5 h-3.5 text-neutral-400" />
          <span>Drag to orbit • Scroll to zoom</span>
        </div>
      </div>

      {/* Right Floating Control Pill */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 p-1.5 rounded-2xl bg-black/70 backdrop-blur-lg border border-white/10 shadow-2xl">
        <button
          onClick={() => handleZoomChange(1)}
          title="Zoom In"
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoomChange(-1)}
          title="Zoom Out"
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-px bg-white/10 mx-1" />
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          className={`p-2 rounded-xl transition-colors ${
            autoRotate ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>
      </div>

      {/* Bottom Floating Controls: Camera Angles & Material Colors */}
      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Preset Angles */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/70 backdrop-blur-lg border border-white/10">
          <span className="px-2 text-[10px] uppercase font-bold tracking-wider text-neutral-400 hidden sm:inline">
            Angle:
          </span>
          {(['iso', 'front', 'top', 'side'] as const).map((angle) => (
            <button
              key={angle}
              onClick={() => setCameraPreset(angle)}
              className={`px-3 py-1 text-xs rounded-xl font-medium transition-all ${
                activeAngle === angle
                  ? 'bg-amber-400 text-black font-semibold shadow-lg shadow-amber-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {angle === 'iso' ? '3D Iso' : angle === 'front' ? 'Front' : angle === 'top' ? 'Top' : 'Side'}
            </button>
          ))}
        </div>

        {/* Real-time Material Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/70 backdrop-blur-lg border border-white/10">
            <span className="px-2 text-[10px] uppercase font-bold tracking-wider text-neutral-400 hidden sm:inline">
              Finish:
            </span>
            <div className="flex items-center gap-1.5">
              {product.colors.map((color) => {
                const isSelected = currentColor.name === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorPick(color)}
                    title={color.name}
                    className={`relative w-7 h-7 rounded-full transition-transform flex items-center justify-center border ${
                      isSelected ? 'scale-110 border-amber-400 shadow-md ring-2 ring-amber-400/40' : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${color.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-neutral-300 font-medium pl-1 pr-2 truncate max-w-[120px]">
              {currentColor.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
