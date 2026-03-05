import { Suspense, useRef, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, OrbitControls, Environment, ContactShadows, useAnimations } from "@react-three/drei"

// ── Modelo 3D del lechón ──
function PigletModel() {
  const group = useRef()
  const { scene, animations } = useGLTF("/models/piglet/scene.gltf")
  const { actions, names } = useAnimations(animations, group)

  useEffect(() => {
    if (names.length > 0) {
      actions[names[0]]?.play()
    }
  }, [actions, names])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    group.current.rotation.y = Math.sin(t * 0.4) * 0.15
  })

  return (
    <group ref={group} scale={0.6} position={[0, -1.4, 0]} rotation={[0, 0.4, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// ── Card de clima/hora con recomendaciones porcícolas ──
const getTimeContext = () => {
  const h = new Date().getHours()
  if (h >= 5  && h < 9)  return { period: "Mañana",        icon: "🌅", color: "#FFD580", bg: "rgba(255,213,128,0.2)",  recs: ["Revisar cerdas en celo", "Alimentación matutina", "Registrar novedades nocturnas"] }
  if (h >= 9  && h < 12) return { period: "Media mañana",  icon: "☀️", color: "#FFB347", bg: "rgba(255,179,71,0.18)",  recs: ["Colecta de semen programada", "Inseminaciones del día", "Control de temperatura"] }
  if (h >= 12 && h < 14) return { period: "Mediodía",      icon: "🌤️", color: "#FF8C69", bg: "rgba(255,140,105,0.18)", recs: ["Revisar ventilación", "Hidratación de reproductoras", "Evitar manejo en calor pico"] }
  if (h >= 14 && h < 17) return { period: "Tarde",         icon: "🌇", color: "#E8A0A8", bg: "rgba(232,160,168,0.2)",  recs: ["Segunda alimentación", "Revisión de parturientas", "Actualizar registros del día"] }
  if (h >= 17 && h < 20) return { period: "Atardecer",     icon: "🌆", color: "#C97A85", bg: "rgba(201,122,133,0.18)", recs: ["Detección de celo vespertino", "Cierre de instalaciones", "Reporte del día"] }
  return                         { period: "Noche",         icon: "🌙", color: "#9B7FBD", bg: "rgba(155,127,189,0.18)", recs: ["Monitoreo pasivo", "Vigilar cerdas próximas a parir", "Preparar plan del mañana"] }
}

function WeatherCard() {
  const [ctx]    = useState(getTimeContext)
  const [recIdx, setRecIdx] = useState(0)

  const now     = new Date()
  const timeStr = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
  const dateStr = now.toLocaleDateString("es-CO",  { weekday: "long", day: "numeric", month: "long" })

  useEffect(() => {
    const t = setInterval(() => setRecIdx(i => (i + 1) % ctx.recs.length), 3200)
    return () => clearInterval(t)
  }, [ctx])

  return (
    <div style={{
      marginTop: "28px",
      background: ctx.bg,
      border: "1.5px solid rgba(255,255,255,0.7)",
      backdropFilter: "blur(14px)",
      borderRadius: "20px",
      padding: "18px 22px",
      maxWidth: "460px",
      boxShadow: "0 4px 24px rgba(180,80,100,0.12)",
      animation: "rp-fadeUp 0.55s ease 0.4s both",
    }}>
      {/* Fila superior */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"2rem", lineHeight:1 }}>{ctx.icon}</span>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"1rem", color:"#fff" }}>{ctx.period}</div>
            <div style={{ fontSize:"0.8rem", color:"rgba(255,255,255,0.75)", marginTop:"1px" }}>{timeStr}</div>
          </div>
        </div>
        <div style={{ fontSize:"0.74rem", color:"rgba(255,255,255,0.65)", textAlign:"right", textTransform:"capitalize", lineHeight:1.4 }}>
          {dateStr}
        </div>
      </div>

      {/* Divisor */}
      <div style={{ height:"1px", background:"rgba(255,255,255,0.3)", marginBottom:"12px" }} />

      {/* Recomendación */}
      <div style={{ fontSize:"0.7rem", fontWeight:700, color:"rgba(255,255,255,0.65)", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:"5px" }}>
        💡 Recomendación del momento
      </div>
      <div style={{ fontSize:"0.95rem", fontWeight:600, color:"#fff", minHeight:"24px" }}>
        {ctx.recs[recIdx]}
      </div>

      {/* Puntitos */}
      <div style={{ display:"flex", gap:"6px", marginTop:"12px" }}>
        {ctx.recs.map((_, i) => (
          <span key={i} style={{
            width:"6px", height:"6px", borderRadius:"50%",
            background: i === recIdx ? "#fff" : "rgba(255,255,255,0.3)",
            transform: i === recIdx ? "scale(1.3)" : "scale(1)",
            transition: "all 0.3s",
            display: "inline-block"
          }}/>
        ))}
      </div>
    </div>
  )
}

function Hero() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500&display=swap');

        .rp-hero {
          min-height: 100vh;
          background: linear-gradient(120deg, #F7A8B8 0%, #FBBFD0 25%, #FDD5C0 60%, #FDE8D8 100%);
          display: flex; align-items: center;
          position: relative; overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          padding-top: 68px;
        }

        .rp-hero-blob {
          position: absolute; top: -80px; right: -80px;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,182,193,0.35) 0%, transparent 70%);
          pointer-events: none;
        }
        .rp-hero-blob2 {
          position: absolute; bottom: -60px; left: 30%;
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(253,220,199,0.4) 0%, transparent 70%);
          pointer-events: none;
        }

        .rp-hero-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 40px;
          display: grid; grid-template-columns: 420px 1fr;
          align-items: center; width: 100%;
          position: relative; z-index: 1;
        }

        .rp-pig-canvas-wrap {
          width: 420px; height: 440px; position: relative;
        }

        .rp-sparkle {
          position: absolute; font-size: 1.4rem;
          animation: rp-twinkle 3s ease-in-out infinite;
          pointer-events: none; z-index: 2;
        }
        .rp-sparkle.s1 { top: 40px;  left: 20px;  animation-delay: 0s; }
        .rp-sparkle.s2 { top: 80px;  right: 10px; animation-delay: 1.1s; font-size: 1rem; }
        .rp-sparkle.s3 { bottom: 60px; left: 10px; animation-delay: 2.2s; font-size: 0.9rem; }

        @keyframes rp-twinkle {
          0%,100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50%      { transform: scale(1.4) rotate(20deg); opacity: 0.4; }
        }

        .rp-hero-content { padding-left: 20px; }

        .rp-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
          color: #B05068; font-size: 0.78rem; font-weight: 700;
          padding: 6px 14px; border-radius: 20px; margin-bottom: 20px;
          animation: rp-fadeUp 0.5s ease both;
        }

        .rp-hero-h1 {
          font-family: 'Nunito', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 8px;
          text-shadow: 0 2px 20px rgba(160,60,80,0.2);
          animation: rp-fadeUp 0.55s ease 0.1s both;
        }
        .rp-hero-h1 .rp-accent {
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 900; display: block; color: #fff; line-height: 1;
        }

        .rp-hero-sub {
          font-size: 1rem; color: rgba(255,255,255,0.88);
          margin: 16px 0 0; font-weight: 300; max-width: 480px; line-height: 1.65;
          animation: rp-fadeUp 0.55s ease 0.2s both;
        }

        @keyframes rp-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .rp-hero-inner { grid-template-columns: 1fr; padding: 40px 24px 60px; text-align: center; }
          .rp-pig-canvas-wrap { width: 100%; height: 300px; margin-bottom: 16px; }
          .rp-hero-content { padding-left: 0; }
        }
      `}</style>

      <section className="rp-hero">
        <div className="rp-hero-blob" />
        <div className="rp-hero-blob2" />

        <div className="rp-hero-inner">

          {/* ── CERDITO 3D — sin cambios ── */}
          <div className="rp-pig-canvas-wrap">
            <span className="rp-sparkle s1">✨</span>
            <span className="rp-sparkle s2">💕</span>
            <span className="rp-sparkle s3">⭐</span>

            <Canvas
              camera={{ position: [0, 2, 8], fov: 42 }}
              style={{ width: "100%", height: "100%", background: "transparent" }}
              gl={{ alpha: true, antialias: true }}
            >
              <ambientLight intensity={1.4} />
              <directionalLight position={[5, 8, 5]}   intensity={1.6} castShadow />
              <directionalLight position={[-4, 3, -2]} intensity={0.7} color="#FFD0DC" />
              <pointLight       position={[0, 4, 2]}   intensity={0.9} color="#FFC0CB" />
              <Environment preset="sunset" />
              <ContactShadows position={[0, -1.4, 0]} opacity={0.5} scale={3} blur={1.5} color="#C06080"/>
              <Suspense fallback={null}>
                <PigletModel />
              </Suspense>
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 3.5}
                maxPolarAngle={Math.PI / 2.2}
              />
            </Canvas>
          </div>

          {/* ── CONTENIDO ── */}
          <div className="rp-hero-content">
            <div className="rp-hero-eyebrow">🐷 Sistema Integral Porcícola</div>

            <h1 className="rp-hero-h1">
              ReproPig
              <span className="rp-accent">Gestión Reproductiva Inteligente</span>
            </h1>

            <p className="rp-hero-sub">
              Control eficiente de gestión reproductiva de porcinos
              en un solo sistema moderno y profesional.
            </p>

            <WeatherCard />
          </div>

        </div>
      </section>
    </>
  )
}

useGLTF.preload("/models/piglet/scene.gltf")

export default Hero