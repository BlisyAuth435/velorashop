import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroThreeSceneProps {
  className?: string;
  featuredProductName?: string;
  featuredProductImage?: string;
}

export const HeroThreeScene: React.FC<HeroThreeSceneProps> = ({
  className = '',
  featuredProductName = 'Velora Master-IH Smart Induction Vessel',
  featuredProductImage = 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=900&q=80',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const goldPoint = new THREE.PointLight(0xd4af37, 3.5, 12);
    goldPoint.position.set(3, 3, 4);
    scene.add(goldPoint);

    const blueRim = new THREE.PointLight(0x48cae4, 2.0, 10);
    blueRim.position.set(-4, -2, 2);
    scene.add(blueRim);

    // Main 3D Composition Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Outer Floating Luxury Rings (Planetary Gyroscope aesthetic)
    const ring1Geo = new THREE.TorusGeometry(2.4, 0.035, 24, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    mainGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.8, 0.025, 24, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.3,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    mainGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(3.2, 0.02, 24, 100);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.6,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 4;
    mainGroup.add(ring3);

    // Ambient floating golden dust particles
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Central Floating Capsule Geometry
    const centralGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const centralMat = new THREE.MeshPhysicalMaterial({
      color: 0x181a24,
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const centralMesh = new THREE.Mesh(centralGeo, centralMat);
    mainGroup.add(centralMesh);

    // Mouse parallax tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = x * 1.5;
      mouseRef.current.targetY = y * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const render = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Group rotation
      mainGroup.rotation.y = elapsedTime * 0.25 + mouseRef.current.x;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.2 + mouseRef.current.y;

      ring1.rotation.z = elapsedTime * 0.3;
      ring2.rotation.y = elapsedTime * -0.2;
      ring3.rotation.x = elapsedTime * 0.15;

      centralMesh.rotation.y = elapsedTime * -0.4;
      centralMesh.position.y = Math.sin(elapsedTime * 1.2) * 0.15;

      // Slight camera parallax
      camera.position.x = mouseRef.current.x * 0.8;
      camera.position.y = -mouseRef.current.y * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    render();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-[460px] lg:h-[580px] flex items-center justify-center ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 pointer-events-none" />

      {/* Floating Center Holographic Product Card */}
      <div className="relative z-10 w-72 sm:w-80 p-5 rounded-3xl glass-panel border border-white/15 shadow-2xl backdrop-blur-2xl animate-float-slow group hover:scale-105 transition-transform duration-500">
        {/* Glow ambient background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />

        <div className="relative">
          {/* Top Tag */}
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[11px] font-semibold tracking-wider uppercase">
              3D Interactive Model
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Product Floating Image */}
          <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-neutral-900/80 mb-4 border border-white/5">
            <img
              src={featuredProductImage}
              alt={featuredProductName}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-white drop-shadow-md">Induction Series 2026</span>
              <span className="text-amber-300 font-bold">৳9,450</span>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-white line-clamp-1 mb-1 font-heading">
            {featuredProductName}
          </h4>
          <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
            Precision electromagnetic induction cooking with ceramic aerospace shield.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>360° Real-time Orbit</span>
            </div>
            <a
              href="#showcase3d"
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 decoration-amber-400/40"
            >
              Enter Studio →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
