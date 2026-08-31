import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { animate, createTimeline, stagger } from "animejs";
import * as THREE from "three";

// ─── Constants ───────────────────────────────────────────────────────────────

const NOIR_COLORS = {
  darkWood: "#0a0704",
  medWood: "#1a1208",
  lightWood: "#2a1c0f",
  gold: "#d4922a",
  warmWhite: "#ffe8a0",
  cream: "#c8b89a",
  doorFrame: "#1e150a",
  floorDark: "#0d0906",
  wallAccent: "#15100a",
};

// ─── Dust Particles (3D Point Cloud) ─────────────────────────────────────────

function DustParticles({ count = 120, visible }: { count?: number; visible: boolean }) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const height = -0.5 - Math.random() * 4.5;
      const spread = Math.abs(height) * 0.35;
      const radius = Math.random() * spread;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 1;

      speeds[i] = 0.15 + Math.random() * 0.4;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, offsets };
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !visible) return;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    const time = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const speed = speeds[i];
      const offset = offsets[i];

      pos.array[i * 3] += Math.sin(time * speed + offset) * 0.0004;
      pos.array[i * 3 + 1] += Math.cos(time * speed * 0.7 + offset) * 0.0003;
      pos.array[i * 3 + 2] += Math.sin(time * speed * 0.5 + offset + 1) * 0.0003;

      if (Math.abs(pos.array[i * 3]) > 2.5 || pos.array[i * 3 + 1] < -5.5 || pos.array[i * 3 + 1] > 0) {
        const angle = Math.random() * Math.PI * 2;
        const height = -0.5 - Math.random() * 4.5;
        const spread = Math.abs(height) * 0.35;
        const radius = Math.random() * spread;
        pos.array[i * 3] = Math.cos(angle) * radius;
        pos.array[i * 3 + 1] = height;
        pos.array[i * 3 + 2] = Math.sin(angle) * radius - 1;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={meshRef} position={[0, 3.2, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={NOIR_COLORS.warmWhite}
        size={0.02}
        transparent
        opacity={visible ? 0.6 : 0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Hanging Lamp ────────────────────────────────────────────────────────────

function HangingLamp({ lampOn }: { lampOn: boolean }) {
  const bulbRef = useRef<THREE.PointLight>(null);
  const bulbMeshRef = useRef<THREE.Mesh>(null);
  const spotRef = useRef<THREE.SpotLight>(null);

  useFrame(({ clock }) => {
    if (!bulbRef.current || !lampOn) return;
    const t = clock.getElapsedTime();

    // Organic flicker
    const flicker =
      1 -
      0.08 * Math.sin(t * 12.3) -
      0.05 * Math.sin(t * 23.7) -
      0.12 * Math.sin(t * 3.1) * (Math.sin(t * 0.7) > 0.8 ? 1 : 0) -
      0.03 * Math.random();

    const intensity = Math.max(0.1, flicker) * 3.5;
    bulbRef.current.intensity = intensity;

    if (bulbMeshRef.current) {
      const mat = bulbMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = intensity * 1.2;
    }

    if (spotRef.current) {
      spotRef.current.intensity = intensity * 12;
    }
  });

  return (
    <group position={[0, 3.8, -1]}>
      {/* Cord */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 1.2, 8]} />
        <meshStandardMaterial color="#3a2808" roughness={0.9} />
      </mesh>

      {/* Shade (cone) */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.35, 0.22, 16, 1, true]} />
        <meshStandardMaterial
          color="#6a4a10"
          roughness={0.7}
          metalness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Shade rim */}
      <mesh position={[0, -0.06, 0]}>
        <torusGeometry args={[0.35, 0.012, 8, 24]} />
        <meshStandardMaterial color="#9a7424" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Bulb */}
      <mesh ref={bulbMeshRef} position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={NOIR_COLORS.warmWhite}
          emissive={NOIR_COLORS.warmWhite}
          emissiveIntensity={lampOn ? 4 : 0}
          toneMapped={false}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        ref={bulbRef}
        position={[0, -0.05, 0]}
        color={NOIR_COLORS.warmWhite}
        intensity={lampOn ? 3.5 : 0}
        distance={12}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />

      {/* Spotlight (directional cone) */}
      <spotLight
        ref={spotRef}
        position={[0, -0.1, 0]}
        target-position={[0, -6, 0]}
        angle={0.65}
        penumbra={0.4}
        color={NOIR_COLORS.gold}
        intensity={lampOn ? 40 : 0}
        distance={10}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Volumetric light cone mesh */}
      {lampOn && (
        <mesh position={[0, -2.2, 0]}>
          <coneGeometry args={[1.8, 4.2, 32, 1, true]} />
          <meshBasicMaterial
            color={NOIR_COLORS.gold}
            transparent
            opacity={0.035}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Room Geometry ───────────────────────────────────────────────────────────

function Room() {
  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: NOIR_COLORS.darkWood,
        roughness: 0.92,
        metalness: 0.05,
      }),
    []
  );

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: NOIR_COLORS.floorDark,
        roughness: 0.95,
        metalness: 0.02,
      }),
    []
  );

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Right wall */}
      <mesh position={[5, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#050302" roughness={1} />
      </mesh>

      {/* Baseboard trim — back wall */}
      <mesh position={[0, -1.0, -3.98]}>
        <boxGeometry args={[14, 0.15, 0.05]} />
        <meshStandardMaterial color={NOIR_COLORS.lightWood} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Baseboard trim — left wall */}
      <mesh position={[-4.98, -1.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[14, 0.15, 0.05]} />
        <meshStandardMaterial color={NOIR_COLORS.lightWood} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Baseboard trim — right wall */}
      <mesh position={[4.98, -1.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[14, 0.15, 0.05]} />
        <meshStandardMaterial color={NOIR_COLORS.lightWood} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Wall panel detail lines — back wall vertical */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <mesh key={`pv-${i}`} position={[x, 2, -3.97]}>
          <boxGeometry args={[0.02, 7, 0.02]} />
          <meshStandardMaterial color={NOIR_COLORS.wallAccent} roughness={0.8} />
        </mesh>
      ))}
      {/* Wall panel detail lines — back wall horizontal */}
      {[0.5, 2.5, 4].map((y, i) => (
        <mesh key={`ph-${i}`} position={[0, y, -3.97]}>
          <boxGeometry args={[14, 0.02, 0.02]} />
          <meshStandardMaterial color={NOIR_COLORS.wallAccent} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ─── 3D Door ─────────────────────────────────────────────────────────────────

function Door3D({ isOpen, onOpened }: { isOpen: boolean; onOpened?: () => void }) {
  const doorRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.SpotLight>(null);
  const doorRotation = useRef(0);
  const targetRotation = useRef(0);
  const velocity = useRef(0);
  const hasNotified = useRef(false);

  const doorWidth = 1.0;
  const doorHeight = 2.4;
  const doorDepth = 0.08;
  const frameThickness = 0.1;

  useEffect(() => {
    if (isOpen) {
      targetRotation.current = -Math.PI / 2.3;
      hasNotified.current = false;
    }
  }, [isOpen]);

  useFrame(() => {
    if (!doorRef.current) return;

    // Spring physics
    const diff = targetRotation.current - doorRotation.current;
    const springForce = diff * 4.5;
    const damping = velocity.current * 3.2;
    velocity.current += (springForce - damping) * 0.016;
    doorRotation.current += velocity.current * 0.016;

    doorRef.current.rotation.y = doorRotation.current;

    if (lightRef.current) {
      const openAmount = Math.abs(doorRotation.current / (Math.PI / 2.3));
      lightRef.current.intensity = openAmount * 8;
    }

    if (isOpen && !hasNotified.current && Math.abs(diff) < 0.1) {
      hasNotified.current = true;
      onOpened?.();
    }
  });

  return (
    <group position={[-3.2, 0, -3.9]}>
      {/* Door frame — top */}
      <mesh position={[doorWidth / 2, doorHeight / 2 + frameThickness / 2 - 1.2, 0]} castShadow>
        <boxGeometry args={[doorWidth + frameThickness * 2, frameThickness, 0.15]} />
        <meshStandardMaterial color={NOIR_COLORS.lightWood} roughness={0.7} metalness={0.15} />
      </mesh>
      {/* Door frame — left */}
      <mesh position={[-frameThickness / 2, doorHeight / 4 - 1.2, 0]} castShadow>
        <boxGeometry args={[frameThickness, doorHeight + frameThickness, 0.15]} />
        <meshStandardMaterial color={NOIR_COLORS.lightWood} roughness={0.7} metalness={0.15} />
      </mesh>
      {/* Door frame — right */}
      <mesh position={[doorWidth + frameThickness / 2, doorHeight / 4 - 1.2, 0]} castShadow>
        <boxGeometry args={[frameThickness, doorHeight + frameThickness, 0.15]} />
        <meshStandardMaterial color={NOIR_COLORS.lightWood} roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Door panel — pivot group at left edge */}
      <group ref={doorRef} position={[0, 0, 0]}>
        {/* Main door panel */}
        <mesh position={[doorWidth / 2, doorHeight / 4 - 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[doorWidth, doorHeight, doorDepth]} />
          <meshStandardMaterial color={NOIR_COLORS.medWood} roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Door inset panel (upper) */}
        <mesh position={[doorWidth / 2, doorHeight / 4 - 1.2 + 0.45, 0.042]}>
          <boxGeometry args={[doorWidth * 0.65, doorHeight * 0.3, 0.008]} />
          <meshStandardMaterial color={NOIR_COLORS.darkWood} roughness={0.85} />
        </mesh>

        {/* Door inset panel (lower) */}
        <mesh position={[doorWidth / 2, doorHeight / 4 - 1.2 - 0.35, 0.042]}>
          <boxGeometry args={[doorWidth * 0.65, doorHeight * 0.32, 0.008]} />
          <meshStandardMaterial color={NOIR_COLORS.darkWood} roughness={0.85} />
        </mesh>

        {/* Doorknob plate */}
        <mesh position={[doorWidth * 0.85, -0.05 - 1.2 + doorHeight / 4, doorDepth / 2 + 0.01]}>
          <cylinderGeometry args={[0.025, 0.03, 0.015, 12]} />
          <meshStandardMaterial color="#d4922a" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Doorknob sphere */}
        <mesh
          position={[doorWidth * 0.85, -0.05 - 1.2 + doorHeight / 4, doorDepth / 2 + 0.035]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#d4922a" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* Light behind door */}
      <spotLight
        ref={lightRef}
        position={[doorWidth / 2, doorHeight / 2 - 1.2, -0.8]}
        target-position={[doorWidth / 2 + 2, -1.2, 2]}
        angle={0.9}
        penumbra={0.6}
        color="#ffe8a0"
        intensity={0}
        distance={8}
        decay={2}
      />

      {/* Warm glow rectangle behind door */}
      <mesh position={[doorWidth / 2, doorHeight / 4 - 1.2, -0.12]}>
        <planeGeometry args={[doorWidth, doorHeight]} />
        <meshBasicMaterial
          color="#ffe8a0"
          transparent
          opacity={isOpen ? 0.15 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Camera Rig ──────────────────────────────────────────────────────────────

function CameraRig({ entering }: { entering: boolean }) {
  const { camera } = useThree();
  const progress = useRef(0);
  const startPos = useMemo(() => new THREE.Vector3(0, 1.2, 5), []);
  const endPos = useMemo(() => new THREE.Vector3(-2.5, 1.0, -3), []);
  const startLookAt = useMemo(() => new THREE.Vector3(0, 1.5, -2), []);
  const endLookAt = useMemo(() => new THREE.Vector3(-3.2, 1.0, -5), []);
  const lookAtTarget = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.position.copy(startPos);
    camera.lookAt(startLookAt);
  }, [camera, startPos, startLookAt]);

  useFrame((_, delta) => {
    if (!entering) {
      // Subtle idle sway
      const t = performance.now() * 0.0003;
      camera.position.x = startPos.x + Math.sin(t) * 0.03;
      camera.position.y = startPos.y + Math.cos(t * 0.7) * 0.015;
      camera.lookAt(startLookAt);
      return;
    }

    // Dolly toward door
    progress.current = Math.min(1, progress.current + delta * 0.55);
    const eased = 1 - Math.pow(1 - progress.current, 3);

    camera.position.lerpVectors(startPos, endPos, eased);
    lookAtTarget.lerpVectors(startLookAt, endLookAt, eased);
    camera.lookAt(lookAtTarget);
  });

  return null;
}

// ─── HTML Title Overlay ──────────────────────────────────────────────────────

function TitleOverlay({
  personName,
  personTitle,
  onEnter,
  entering,
}: {
  personName: string;
  personTitle: string;
  onEnter: () => void;
  entering: boolean;
}) {
  const [showEnter, setShowEnter] = useState(false);
  const divisionRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const enterWrapRef = useRef<HTMLDivElement>(null);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = createTimeline({ defaults: { ease: "outCubic" } });

    tl.add(divisionRef.current!, {
      opacity: [0, 0.5],
      translateX: [-40, 0],
      letterSpacing: ["1em", "0.4em"],
      duration: 900,
      ease: "outCubic",
    }, 2200);

    if (nameRef.current) {
      const chars = nameRef.current.querySelectorAll(".name-char");
      tl.add(chars, {
        opacity: [0, 1],
        translateY: [25, 0],
        duration: 600,
        delay: stagger(40),
        ease: "outCubic",
      }, 2800);
    }

    tl.add(subtitleRef.current!, {
      opacity: [0, 0.55],
      translateY: [15, 0],
      duration: 700,
      ease: "outCubic",
    }, 3800);

    tl.add({
      duration: 100,
      onComplete: () => setShowEnter(true),
    }, 4400);

    return () => { tl.pause(); };
  }, []);

  useEffect(() => {
    if (!showEnter || !enterBtnRef.current) return;

    animate(enterWrapRef.current!, {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 700,
      ease: "outCubic",
    });

    const pulse = animate(enterBtnRef.current!, {
      boxShadow: [
        "0 0 0px 0px rgba(212,146,42,0)",
        "0 0 25px 6px rgba(212,146,42,0.35)",
        "0 0 0px 0px rgba(212,146,42,0)",
      ],
      borderColor: [
        "rgba(212,146,42,0.5)",
        "rgba(212,146,42,1)",
        "rgba(212,146,42,0.5)",
      ],
      duration: 2400,
      loop: true,
      ease: "inOutSine",
    });

    return () => { pulse.pause(); };
  }, [showEnter]);

  useEffect(() => {
    if (!entering || !overlayRef.current) return;
    animate(overlayRef.current, {
      opacity: [1, 0],
      duration: 800,
      ease: "inCubic",
    });
  }, [entering]);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      style={{ zIndex: 15 }}
    >
      <div
        ref={divisionRef}
        style={{
          opacity: 0,
          color: NOIR_COLORS.gold,
          fontFamily: "'Special Elite', serif",
          fontSize: "0.7rem",
          letterSpacing: "0.4em",
          marginBottom: "12px",
          textTransform: "uppercase",
        }}
      >
        CASE FILES DIVISION
      </div>

      <h1
        ref={nameRef}
        style={{
          fontFamily: "'Playfair Display', serif",
          color: NOIR_COLORS.gold,
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          letterSpacing: "0.12em",
          fontWeight: 700,
          textShadow: "0 0 60px rgba(212,146,42,0.4), 0 0 120px rgba(212,146,42,0.15)",
          whiteSpace: "nowrap",
        }}
      >
        {personName.split("").map((char, i) => (
          <span
            key={i}
            className="name-char"
            style={{
              display: "inline-block",
              opacity: 0,
              minWidth: char === " " ? "0.3em" : undefined,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>

      <div
        ref={subtitleRef}
        style={{
          opacity: 0,
          color: NOIR_COLORS.cream,
          fontFamily: "'Special Elite', serif",
          fontSize: "0.8rem",
          letterSpacing: "0.2em",
          marginTop: "8px",
        }}
      >
        {personTitle}
      </div>

      {showEnter && !entering && (
        <div
          ref={enterWrapRef}
          style={{ opacity: 0, marginTop: "60px", pointerEvents: "auto" }}
        >
          <button
            ref={enterBtnRef}
            onClick={onEnter}
            style={{
              border: "1px solid rgba(212,146,42,0.5)",
              color: NOIR_COLORS.gold,
              background: "transparent",
              fontFamily: "'Special Elite', serif",
              letterSpacing: "0.35em",
              padding: "12px 40px",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
          >
            ▶ ENTER
          </button>
          <div
            style={{
              color: NOIR_COLORS.gold,
              fontFamily: "'Special Elite', serif",
              letterSpacing: "0.2em",
              fontSize: "0.6rem",
              marginTop: "8px",
              opacity: 0.25,
              textAlign: "center",
            }}
          >
            AUTHORIZED PERSONNEL ONLY
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main IntroScene3D Component ─────────────────────────────────────────────

export default function IntroScene3D({
  onEnter,
  personName,
  personTitle,
}: {
  onEnter: () => void;
  personName: string;
  personTitle: string;
}) {
  const [lampOn, setLampOn] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLampOn(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = useCallback(() => {
    if (entering) return;
    setEntering(true);
    setDoorOpen(true);
  }, [entering]);

  const handleDoorOpened = useCallback(() => {
    setTimeout(onEnter, 600);
  }, [onEnter]);

  return (
    <div className="fixed inset-0" style={{ background: "#030201" }}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
        }}
        camera={{ fov: 55, near: 0.1, far: 50, position: [0, 1.2, 5] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.015} color="#1a1208" />

        <Room />
        <HangingLamp lampOn={lampOn} />
        <DustParticles count={150} visible={lampOn} />
        <Door3D isOpen={doorOpen} onOpened={handleDoorOpened} />
        <CameraRig entering={entering} />

        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
          />
          <Vignette eskil={false} offset={0.25} darkness={0.9} />
          <Noise opacity={0.06} />
        </EffectComposer>
      </Canvas>

      <TitleOverlay
        personName={personName}
        personTitle={personTitle}
        onEnter={handleEnter}
        entering={entering}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 20,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 100%)",
        }}
      />
    </div>
  );
}
