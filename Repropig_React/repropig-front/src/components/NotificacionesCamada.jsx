import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiAxios from "../api/axiosConfig";

export default function NotificacionesCamada() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [abierto, setAbierto] = useState(false);
    const [filtroCategoria, setFiltroCategoria] = useState("todas");
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotificaciones = async () => {
        try {
            setCargando(true);
            const response = await apiAxios.get('/segcamada/notificaciones');
            setNotificaciones(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
            setNotificaciones([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchNotificaciones();
        // Refrescar automáticamente cada 3 minutos
        const interval = setInterval(fetchNotificaciones, 3 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const total = notificaciones.length;
    const totalAtrasado = notificaciones.filter(n => n.tipo === 'atrasado').length;
    const totalHoy = notificaciones.filter(n => n.tipo === 'hoy').length;
    const totalCamada = notificaciones.filter(n => n.categoria === 'camada').length;
    const totalCalendario = notificaciones.filter(n => n.categoria === 'calendario' || n.categoria === 'cerda').length;

    // Filtrar por pestaña
    const notificacionesFiltradas = notificaciones.filter(n => {
        if (filtroCategoria === "camada") return n.categoria === "camada";
        if (filtroCategoria === "calendario") return n.categoria === "calendario" || n.categoria === "cerda";
        return true;
    });

    const handleClickNotif = (notif) => {
        setAbierto(false);
        try {
            if (notif.categoria === 'camada') {
                // Notificación de seguimiento de camada → ir al parto específico
                const ruta = notif.ruta || (notif.idParto ? `/actividades_camada/parto/${notif.idParto}` : '/dashboard');
                navigate(ruta);
            } else if (notif.categoria === 'calendario') {
                // Notificación de calendario reproductivo → abrir el ciclo específico
                if (notif.idCiclo) {
                    navigate(`/calendario?ciclo=${notif.idCiclo}`);
                } else {
                    navigate('/calendario');
                }
            } else if (notif.categoria === 'cerda') {
                // Notificación de seguimiento de cerda
                navigate(notif.ruta || '/seguimiento_cerda');
            } else if (notif.ruta) {
                navigate(notif.ruta);
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Error navegando desde notificación:", err);
            navigate('/dashboard');
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: "relative" }}>
            {/* Botón Campana */}
            <button
                onClick={() => setAbierto(!abierto)}
                style={{
                    background: total > 0 ? "rgba(255,255,255,0.95)" : "white",
                    border: totalAtrasado > 0
                        ? "1.5px solid #ef4444"
                        : total > 0
                            ? "1.5px solid #f472b6"
                            : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.2s ease",
                    boxShadow: totalAtrasado > 0
                        ? "0 0 10px rgba(239,68,68,0.3)"
                        : total > 0
                            ? "0 0 8px rgba(244,114,182,0.3)"
                            : "0 1px 3px rgba(0,0,0,0.08)"
                }}
                title={total > 0 ? `${total} alertas pendientes` : "Sin notificaciones"}
                className={total > 0 ? "notif-bell-animate" : ""}
            >
                <i
                    className="fa-solid fa-bell"
                    style={{
                        fontSize: "17px",
                        color: totalAtrasado > 0 ? "#dc2626" : total > 0 ? "#ec4899" : "#9ca3af"
                    }}
                ></i>

                {/* Badge contador */}
                {total > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "-5px",
                            right: "-5px",
                            background: totalAtrasado > 0
                                ? "linear-gradient(135deg, #dc2626, #ef4444)"
                                : "linear-gradient(135deg, #f43f5e, #ec4899)",
                            color: "white",
                            borderRadius: "999px",
                            minWidth: total > 9 ? "22px" : "18px",
                            height: "18px",
                            padding: "0 4px",
                            fontSize: "10px",
                            fontWeight: "800",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #fff",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.25)"
                        }}
                    >
                        {total}
                    </span>
                )}
            </button>

            {/* Menú Desplegable */}
            {abierto && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 10px)",
                        right: 0,
                        width: "420px",
                        maxWidth: "calc(100vw - 32px)",
                        maxHeight: "520px",
                        background: "white",
                        borderRadius: "18px",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)",
                        border: "1px solid #fbcfe8",
                        overflow: "hidden",
                        zIndex: 1000,
                        animation: "notifDropIn 0.2s ease-out",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    {/* Encabezado */}
                    <div
                        style={{
                            padding: "16px 20px 12px",
                            background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
                            borderBottom: "1px solid #fbcfe8"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "20px" }}>🔔</span>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: "800", color: "#831843", fontSize: "15px" }}>
                                        Alertas y Seguimiento
                                    </h3>
                                    <p style={{ margin: 0, fontSize: "11px", color: "#9d174d", fontWeight: "600" }}>
                                        Camadas, Cerdas y Calendario
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <button
                                    onClick={fetchNotificaciones}
                                    style={{
                                        background: "white",
                                        border: "1px solid #f472b6",
                                        borderRadius: "8px",
                                        width: "28px",
                                        height: "28px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        color: "#ec4899",
                                        fontSize: "12px",
                                        transition: "all 0.2s ease"
                                    }}
                                    title="Actualizar notificaciones"
                                >
                                    <i className={`fa-solid fa-rotate-right ${cargando ? 'fa-spin' : ''}`}></i>
                                </button>
                                {total > 0 && (
                                    <span
                                        style={{
                                            background: totalAtrasado > 0 ? "#fee2e2" : "#fef3c7",
                                            color: totalAtrasado > 0 ? "#991b1b" : "#92400e",
                                            padding: "3px 8px",
                                            borderRadius: "999px",
                                            fontSize: "11px",
                                            fontWeight: "800",
                                            border: totalAtrasado > 0 ? "1px solid #fca5a5" : "1px solid #fde68a"
                                        }}
                                    >
                                        {total} {total === 1 ? 'alerta' : 'alertas'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Pestañas de Filtrado */}
                        <div style={{ display: "flex", gap: "6px" }}>
                            <button
                                onClick={() => setFiltroCategoria("todas")}
                                style={{
                                    flex: 1,
                                    padding: "6px 10px",
                                    borderRadius: "10px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    background: filtroCategoria === "todas" ? "#be185d" : "rgba(255,255,255,0.7)",
                                    color: filtroCategoria === "todas" ? "white" : "#831843",
                                    boxShadow: filtroCategoria === "todas" ? "0 2px 6px rgba(190,24,93,0.3)" : "none"
                                }}
                            >
                                Todas ({total})
                            </button>
                            <button
                                onClick={() => setFiltroCategoria("camada")}
                                style={{
                                    flex: 1,
                                    padding: "6px 10px",
                                    borderRadius: "10px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    background: filtroCategoria === "camada" ? "#be185d" : "rgba(255,255,255,0.7)",
                                    color: filtroCategoria === "camada" ? "white" : "#831843",
                                    boxShadow: filtroCategoria === "camada" ? "0 2px 6px rgba(190,24,93,0.3)" : "none"
                                }}
                            >
                                🍼 Camada ({totalCamada})
                            </button>
                            <button
                                onClick={() => setFiltroCategoria("calendario")}
                                style={{
                                    flex: 1.3,
                                    padding: "6px 10px",
                                    borderRadius: "10px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    background: filtroCategoria === "calendario" ? "#be185d" : "rgba(255,255,255,0.7)",
                                    color: filtroCategoria === "calendario" ? "white" : "#831843",
                                    boxShadow: filtroCategoria === "calendario" ? "0 2px 6px rgba(190,24,93,0.3)" : "none"
                                }}
                            >
                                📅 Cerdas & Ciclos ({totalCalendario})
                            </button>
                        </div>
                    </div>

                    {/* Lista de Notificaciones */}
                    <div style={{ flex: 1, maxHeight: "380px", overflowY: "auto", padding: "10px" }}>
                        {notificacionesFiltradas.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "36px 20px", color: "#9ca3af" }}>
                                <div style={{ fontSize: "36px", marginBottom: "8px" }}>✨</div>
                                <p style={{ fontWeight: "700", fontSize: "14px", margin: 0, color: "#4b5563" }}>
                                    No hay eventos pendientes
                                </p>
                                <p style={{ fontSize: "12px", margin: "4px 0 0", color: "#9ca3af" }}>
                                    {filtroCategoria === "camada"
                                        ? "El seguimiento de camadas está al día"
                                        : filtroCategoria === "calendario"
                                            ? "No hay fechas proyectadas pendientes"
                                            : "Todos los procesos reproductivos están al día"}
                                </p>
                            </div>
                        ) : (
                            notificacionesFiltradas.map((notif, idx) => {
                                const isAtrasado = notif.tipo === 'atrasado';
                                const isHoy = notif.tipo === 'hoy';

                                const bgCard = isAtrasado
                                    ? "linear-gradient(135deg, #fff1f2, #ffe4e6)"
                                    : isHoy
                                        ? "linear-gradient(135deg, #fff7ed, #ffedd5)"
                                        : "#f8fafc";

                                const borderCard = isAtrasado
                                    ? "1px solid #fecdd3"
                                    : isHoy
                                        ? "1px solid #fed7aa"
                                        : "1px solid #e2e8f0";

                                const catBadgeColor = notif.categoria === 'camada'
                                    ? { bg: "#fce7f3", text: "#9d174d", border: "#fbcfe8", label: "🍼 Camada" }
                                    : notif.categoria === 'calendario'
                                        ? { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe", label: "📅 Calendario" }
                                        : { bg: "#fef3c7", text: "#92400e", border: "#fde68a", label: "🐖 Cerda" };

                                return (
                                    <div
                                        key={notif.id || `notif-${idx}`}
                                        onClick={() => handleClickNotif(notif)}
                                        style={{
                                            padding: "12px 14px",
                                            margin: "6px 0",
                                            borderRadius: "14px",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            background: bgCard,
                                            border: borderCard,
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "12px"
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        {/* Icono de Alerta */}
                                        <div
                                            style={{
                                                width: "38px",
                                                height: "38px",
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                background: isAtrasado
                                                    ? "linear-gradient(135deg, #dc2626, #ef4444)"
                                                    : isHoy
                                                        ? "linear-gradient(135deg, #ea580c, #f97316)"
                                                        : "linear-gradient(135deg, #2563eb, #3b82f6)",
                                                color: "white",
                                                fontSize: "16px",
                                                boxShadow: isAtrasado
                                                    ? "0 3px 8px rgba(220,38,38,0.3)"
                                                    : isHoy
                                                        ? "0 3px 8px rgba(234,88,12,0.3)"
                                                        : "0 3px 8px rgba(37,99,235,0.3)"
                                            }}
                                        >
                                            {isAtrasado ? '🚨' : isHoy ? '⚠️' : '📋'}
                                        </div>

                                        {/* Contenido */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "3px" }}>
                                                {/* Badge Tipo Urgencia */}
                                                <span
                                                    style={{
                                                        fontSize: "9.5px",
                                                        fontWeight: "800",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.5px",
                                                        color: isAtrasado ? "#991b1b" : isHoy ? "#c2410c" : "#1d4ed8",
                                                        background: isAtrasado ? "#fee2e2" : isHoy ? "#ffedd5" : "#dbeafe",
                                                        padding: "1.5px 6px",
                                                        borderRadius: "5px"
                                                    }}
                                                >
                                                    {isAtrasado ? 'ATRASADO' : isHoy ? 'HOY' : 'RECORDATORIO'}
                                                </span>

                                                {/* Badge Categoría */}
                                                <span
                                                    style={{
                                                        fontSize: "9.5px",
                                                        fontWeight: "700",
                                                        color: catBadgeColor.text,
                                                        background: catBadgeColor.bg,
                                                        border: `1px solid ${catBadgeColor.border}`,
                                                        padding: "1px 6px",
                                                        borderRadius: "5px"
                                                    }}
                                                >
                                                    {catBadgeColor.label}
                                                </span>

                                                {notif.nombreCerda && (
                                                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569", marginLeft: "auto" }}>
                                                        {notif.nombreCerda}
                                                    </span>
                                                )}
                                            </div>

                                            <p style={{
                                                margin: "3px 0 0",
                                                fontSize: "12.5px",
                                                fontWeight: "600",
                                                color: "#1e293b",
                                                lineHeight: "1.35"
                                            }}>
                                                {notif.mensaje}
                                            </p>

                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginTop: "5px",
                                                fontSize: "11px",
                                                color: "#64748b"
                                            }}>
                                                <span>
                                                    📅 {notif.fechaProgramada}
                                                </span>
                                                <span style={{ color: "#ec4899", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                                                    Ir al módulo <i className="fa-solid fa-chevron-right" style={{ fontSize: "9px" }}></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pie del modal */}
                    <div style={{
                        padding: "10px 16px",
                        background: "#faf5ff",
                        borderTop: "1px solid #f3e8ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "11.5px",
                        color: "#6b7280"
                    }}>
                        <span style={{ fontWeight: "600" }}>
                            {totalAtrasado > 0 ? `🚨 ${totalAtrasado} atrasadas` : '✅ Sin atrasos críticos'}
                        </span>
                    </div>
                </div>
            )}

            {/* Animaciones CSS */}
            <style>{`
                @keyframes notifDropIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes notifBellRing {
                    0% { transform: rotate(0deg); }
                    15% { transform: rotate(14deg); }
                    30% { transform: rotate(-12deg); }
                    45% { transform: rotate(10deg); }
                    60% { transform: rotate(-8deg); }
                    75% { transform: rotate(4deg); }
                    100% { transform: rotate(0deg); }
                }
                .notif-bell-animate i {
                    animation: notifBellRing 1.5s ease-in-out infinite;
                    animation-delay: 3s;
                }
            `}</style>
        </div>
    );
}
