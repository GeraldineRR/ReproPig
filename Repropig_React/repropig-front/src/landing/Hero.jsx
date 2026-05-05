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
    <group ref={group} scale={0.9} position={[0, -1.2, 0]} rotation={[0, 0.4, 0]}>
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
      marginTop: "0px",
      background: "rgba(255, 255, 255, 0.85)",
      border: "1px solid rgba(255,200,210,0.4)",
      backdropFilter: "blur(16px)",
      borderRadius: "20px",
      padding: "16px 20px",
      maxWidth: "460px",
      width: "100%",
      boxShadow: "0 10px 30px rgba(216, 27, 96, 0.08)",
      animation: "rp-fadeUp 0.6s ease 0.4s both",
    }}>
      {/* Fila superior */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ fontSize:"2rem", lineHeight:1, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}>{ctx.icon}</div>
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:"1.05rem", color:"#2d1b2e" }}>{ctx.period}</div>
            <div style={{ fontSize:"0.8rem", color:"#5a4b5c", marginTop:"2px", fontWeight:500 }}>{timeStr}</div>
          </div>
        </div>
        <div style={{ fontSize:"0.75rem", color:"#8a4f58", textAlign:"right", textTransform:"capitalize", lineHeight:1.4, fontWeight:600 }}>
          {dateStr}
        </div>
      </div>

      {/* Divisor */}
      <div style={{ height:"1px", background:"linear-gradient(90deg, rgba(216, 27, 96, 0.1), transparent)", margin:"10px 0" }} />

      {/* Recomendación */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom:"8px" }}>
        <span style={{ fontSize: "1.1rem" }}>💡</span>
        <div style={{ fontSize:"0.75rem", fontWeight:800, color:"#B05068", letterSpacing:"0.5px", textTransform:"uppercase" }}>
          Recomendación del momento
        </div>
      </div>
      <div style={{ fontSize:"1rem", fontWeight:600, color:"#2d1b2e", minHeight:"24px", paddingLeft: "32px" }}>
        {ctx.recs[recIdx]}
      </div>

      {/* Puntitos */}
      <div style={{ display:"flex", gap:"8px", marginTop:"16px", paddingLeft: "32px" }}>
        {ctx.recs.map((_, i) => (
          <span key={i} style={{
            width:"6px", height:"6px", borderRadius:"50%",
            background: i === recIdx ? "#ec4899" : "rgba(236, 72, 153, 0.2)",
            transform: i === recIdx ? "scale(1.4)" : "scale(1)",
            transition: "all 0.3s ease",
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
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

        .rp-hero {
          min-height: 100vh;
          background: linear-gradient(120deg, #F7A8B8 0%, #FBBFD0 25%, #FDD5C0 60%, #FDE8D8 100%);
          display: flex; flex-direction: column; justify-content: flex-start;
          position: relative; overflow: hidden;
          font-family: 'Inter', sans-serif;
          padding: 60px 0 40px;
        }

        .rp-hero-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 40px;
          display: grid; grid-template-columns: 1fr 440px;
          align-items: center; width: 100%;
          position: relative; z-index: 1;
          gap: 30px;
        }

        .rp-right-col {
          display: flex; flex-direction: column; align-items: center;
          order: 2;
        }

        .rp-pig-canvas-wrap {
          width: 100%; height: 340px; position: relative;
        }

        .rp-sparkle {
          position: absolute; font-size: 1.6rem;
          animation: rp-twinkle 3s ease-in-out infinite;
          pointer-events: none; z-index: 2;
        }
        .rp-sparkle.s1 { top: 60px;  left: 40px;  animation-delay: 0s; }
        .rp-sparkle.s2 { top: 120px;  right: 20px; animation-delay: 1.1s; font-size: 1.2rem; }
        .rp-sparkle.s3 { bottom: 80px; left: 30px; animation-delay: 2.2s; font-size: 1rem; }

        @keyframes rp-twinkle {
          0%,100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
          50%      { transform: scale(1.3) rotate(15deg); opacity: 0.5; }
        }

        .rp-hero-content { 
          padding-right: 20px; 
          order: 1; 
        }

        .rp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
          color: #B05068; font-size: 0.78rem; font-weight: 700;
          padding: 6px 14px; border-radius: 20px; margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(176, 80, 104, 0.1);
          animation: rp-fadeUp 0.5s ease both;
        }

        .rp-hero-h1 {
          font-family: 'Nunito', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 800; color: #8a4f58; line-height: 1.15; margin-bottom: 8px;
          animation: rp-fadeUp 0.55s ease 0.1s both;
        }
        .rp-hero-h1 .rp-accent {
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 900; display: block; color: #fff; line-height: 1;
          text-shadow: 0 2px 15px rgba(138, 79, 88, 0.3);
        }

        .rp-hero-sub {
          font-size: 1rem; color: #5A333E;
          margin: 16px 0 24px 0; font-weight: 500; max-width: 480px; line-height: 1.65;
          animation: rp-fadeUp 0.55s ease 0.2s both;
        }

        .rp-buttons {
          display: flex; gap: 16px;
          animation: rp-fadeUp 0.6s ease 0.3s both;
        }

        .rp-btn-primary {
          background: #ec4899; /* pink-500 */
          color: white; padding: 14px 28px; border-radius: 12px;
          font-weight: 600; font-size: 1.05rem; text-decoration: none;
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.25);
          transition: all 0.3s ease;
        }
        .rp-btn-primary:hover {
          background: #db2777; /* pink-600 */
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(236, 72, 153, 0.35);
        }

        .rp-btn-outline {
          background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.6);
          color: white; padding: 14px 28px; border-radius: 12px;
          font-weight: 600; font-size: 1.05rem; text-decoration: none;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        .rp-btn-outline:hover {
          background: rgba(255,255,255,0.3); border-color: white;
        }

        @keyframes rp-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 960px) {
          .rp-hero-inner { grid-template-columns: 1fr; padding: 40px 24px 60px; text-align: center; gap: 20px; }
          .rp-right-col { order: 1; width: 100%; }
          .rp-pig-canvas-wrap { height: 300px; }
          .rp-hero-content { order: 2; padding-right: 0; display: flex; flex-direction: column; align-items: center; }
          .rp-hero-h1 .rp-accent { display: inline; }
        }
      `}</style>

      <section className="rp-hero">
        <div className="rp-hero-inner">

          {/* ── CONTENIDO ── */}
          <div className="rp-hero-content">
            <div className="rp-badge">🚀 Plataforma Líder</div>
            <h1 className="rp-hero-h1">
              ReproPig
              <span className="rp-accent">Gestión Reproductiva Inteligente</span>
            </h1>
            <p className="rp-hero-sub">
              Control eficiente y avanzado del proceso porcícola. Registra montas, colectas, inseminaciones y partos desde una sola plataforma profesional.
            </p>
            
            <div className="rp-buttons">
              <a href="#modulos" className="rp-btn-primary">Explorar Módulos</a>
            </div>
          </div>

          {/* ── CERDITO 3D Y CLIMA (DERECHA) ── */}
          <div className="rp-right-col">
            <div className="rp-pig-canvas-wrap">
              <span className="rp-sparkle s1">✨</span>
              <span className="rp-sparkle s2">💕</span>
              <span className="rp-sparkle s3">⭐</span>

              <Canvas
                camera={{ position: [0, 1.8, 8], fov: 45 }}
                style={{ width: "100%", height: "100%", background: "transparent" }}
                gl={{ alpha: true, antialias: true }}
              >
                <ambientLight intensity={1.4} />
                <directionalLight position={[5, 8, 5]}   intensity={1.6} castShadow />
                <directionalLight position={[-4, 3, -2]} intensity={0.7} color="#FFD0DC" />
                <pointLight       position={[0, 4, 2]}   intensity={0.9} color="#FFC0CB" />
                <Environment preset="sunset" />
                <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={5} blur={2} color="#8a4f58"/>
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
            
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <WeatherCard />
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

useGLTF.preload("/models/piglet/scene.gltf")

export default Hero