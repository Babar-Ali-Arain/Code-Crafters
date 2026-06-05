import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1428, 0.001);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 250;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // 2. Particles setup
    const particleCount = 250;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const colors = [];

    const electricColor = new THREE.Color(0x00F0FF); // Cyan
    const goldenColor = new THREE.Color(0xFFD700);  // Gold

    for (let i = 0; i < particleCount; i++) {
      positions.push(
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 800
      );
      velocities.push(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );

      const color = Math.random() > 0.4 ? electricColor : goldenColor;
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 2.5 Lines setup
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    
    // Create line geometry with enough space for many lines
    // Max lines = particleCount * (particleCount - 1) / 2
    const linesGeometry = new THREE.BufferGeometry();
    const maxLines = particleCount * particleCount;
    const linePositions = new Float32Array(maxLines * 6); // 2 points * 3 coords
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    // Start with 0 lines drawn
    linesGeometry.setDrawRange(0, 0);

    const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(linesMesh);

    // 3. Animation loop & Interaction
    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;
    const mouse = new THREE.Vector2(-9999, -9999);
    const target = new THREE.Vector3();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX - window.innerWidth / 2;
      mouseY = event.clientY - window.innerHeight / 2;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const positionsArray = geometry.attributes.position.array as Float32Array;
      const linePosArray = linesGeometry.attributes.position.array as Float32Array;

      let lineCount = 0;

      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, target);

      // Update positions for drift
      for (let i = 0; i < particleCount * 3; i += 3) {
        positionsArray[i] += velocities[i];     // X
        positionsArray[i + 1] += velocities[i + 1]; // Y
        positionsArray[i + 2] += velocities[i + 2]; // Z

        if (target) {
          const dx = positionsArray[i] - target.x;
          const dy = positionsArray[i + 1] - target.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            // Attract towards mouse
            positionsArray[i] -= (dx / dist) * force * 1.5;
            positionsArray[i + 1] -= (dy / dist) * force * 1.5;
          }
        }

        // Bounce back if they go too far
        if (Math.abs(positionsArray[i]) > 400) velocities[i] *= -1;
        if (Math.abs(positionsArray[i + 1]) > 400) velocities[i + 1] *= -1;
        if (Math.abs(positionsArray[i + 2]) > 400) velocities[i + 2] *= -1;
      }

      // Check distance to draw lines
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = positionsArray[i * 3] - positionsArray[j * 3];
          const dy = positionsArray[i * 3 + 1] - positionsArray[j * 3 + 1];
          const dz = positionsArray[i * 3 + 2] - positionsArray[j * 3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < 15000) { // Connect nodes close to each other
            linePosArray[lineCount * 6] = positionsArray[i * 3];
            linePosArray[lineCount * 6 + 1] = positionsArray[i * 3 + 1];
            linePosArray[lineCount * 6 + 2] = positionsArray[i * 3 + 2];
            linePosArray[lineCount * 6 + 3] = positionsArray[j * 3];
            linePosArray[lineCount * 6 + 4] = positionsArray[j * 3 + 1];
            linePosArray[lineCount * 6 + 5] = positionsArray[j * 3 + 2];
            lineCount++;
          }
        }
      }

      geometry.attributes.position.needsUpdate = true;
      
      linesGeometry.setDrawRange(0, lineCount * 2);
      linesGeometry.attributes.position.needsUpdate = true;

      // Smooth camera parallax
      camera.position.x += (mouseX * 0.1 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.1 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Auto constant rotation
      particles.rotation.y += 0.0005;
      particles.rotation.x += 0.0002;
      linesMesh.rotation.y += 0.0005;
      linesMesh.rotation.x += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    // 4. Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 5. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      geometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 w-full h-full z-[-1] pointer-events-none opacity-40 mix-blend-screen"
    />
  );
}
