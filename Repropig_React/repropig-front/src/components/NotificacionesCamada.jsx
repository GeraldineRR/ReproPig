import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiAxios from "../api/axiosConfig";

export default function NotificacionesCamada() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [abierto, setAbierto] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotificaciones = async () => {
        try {
            const response = await apiAxios.get('/segcamada/notificaciones');
            setNotificaciones(response.data);
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
        }
    };

    useEffect(() => {
        fetchNotificaciones();
        // Refresh every 5 minutes
        const interval = setInterval(fetchNotificaciones, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
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
    const totalUrgentes = totalAtrasado + totalHoy;

    return (
        <div ref={dropdownRef} style={{ position: "relative" }}>
            {/* Bell button */}
            <button
                onClick={() => setAbierto(!abierto)}
                style={{
                    background: total > 0 ? "rgba(255,255,255,0.9)" : "white",
                    border: total > 0 ? "1.5px solid #f472b6" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    width: "38px",
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.2s ease",
                    boxShadow: total > 0 ? "0 0 8px rgba(244,114,182,0.3)" : "0 1px 3px rgba(0,0,0,0.08)"
                }}
                title="Notificaciones de seguimiento"
                className={total > 0 ? "notif-bell-animate" : ""}
            >
                <i
                    className="fa-solid fa-bell"
                    style={{
                        fontSize: "16px",
                        color: total > 0 ? "#ec4899" : "#9ca3af"
                    }}
                ></i>

                {/* Badge */}
                {total > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            background: "linear-gradient(135deg, #f43f5e, #ec4899)",
                            color: "white",
                            borderRadius: "999px",
                            width: total > 9 ? "22px" : "18px",
                            height: "18px",
                            fontSize: "10px",
                            fontWeight: "800",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #fff",
                            boxShadow: "0 2px 4px rgba(244,63,94,0.4)"
                        }}
                    >
                        {total}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {abierto && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        width: "380px",
                        maxHeight: "420px",
                        background: "white",
                        borderRadius: "16px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)",
                        border: "1px solid #f3e8ff",
                        overflow: "hidden",
                        zIndex: 999,
                        animation: "notifDropIn 0.2s ease-out"
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "16px 20px",
                            background: "linear-gradient(135deg, #fdf2f8, #fce7f3)",
                            borderBottom: "1px solid #fce7f3",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "18px" }}>🔔</span>
                            <span style={{ fontWeight: "700", color: "#831843", fontSize: "14px" }}>
                                Seguimiento de Camada
                            </span>
                        </div>
                        {total > 0 && (
                            <span
                                style={{
                                    background: totalAtrasado > 0 ? "#fecaca" : totalHoy > 0 ? "#fef2f2" : "#fffbeb",
                                    color: totalAtrasado > 0 ? "#991b1b" : totalHoy > 0 ? "#dc2626" : "#d97706",
                                    padding: "2px 10px",
                                    borderRadius: "999px",
                                    fontSize: "11px",
                                    fontWeight: "700"
                                }}
                            >
                                {total} pendiente{total > 1 ? 's' : ''}{totalAtrasado > 0 ? ` (${totalAtrasado} atrasado${totalAtrasado > 1 ? 's' : ''})` : ''}
                            </span>
                        )}
                    </div>

                    {/* Body */}
                    <div style={{ maxHeight: "340px", overflowY: "auto", padding: "8px" }}>
                        {notificaciones.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "32px 20px",
                                    color: "#9ca3af"
                                }}
                            >
                                <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                                <p style={{ fontWeight: "600", fontSize: "14px", margin: 0 }}>
                                    No hay seguimientos pendientes
                                </p>
                                <p style={{ fontSize: "12px", margin: "4px 0 0" }}>
                                    Todo está al día
                                </p>
                            </div>
                        ) : (
                            notificaciones.map((notif, idx) => (
                                <div
                                    key={`${notif.idParto}-${notif.diaProgramado}`}
                                    onClick={() => {
                                        navigate(`/segcamada/parto/${notif.idParto}`);
                                        setAbierto(false);
                                    }}
                                    style={{
                                        padding: "12px 14px",
                                        margin: "4px 0",
                                        borderRadius: "12px",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                        background: notif.tipo === 'atrasado'
                                            ? "linear-gradient(135deg, #fef2f2, #ffe4e6)"
                                            : notif.tipo === 'hoy'
                                                ? "linear-gradient(135deg, #fff7ed, #ffedd5)"
                                                : "#fffbeb",
                                        border: notif.tipo === 'atrasado'
                                            ? "1px solid #fca5a5"
                                            : notif.tipo === 'hoy'
                                                ? "1px solid #fed7aa"
                                                : "1px solid #fef3c7",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "12px"
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = "translateX(4px)";
                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = "translateX(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    {/* Icon */}
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            background: notif.tipo === 'atrasado'
                                                ? "linear-gradient(135deg, #dc2626, #ef4444)"
                                                : notif.tipo === 'hoy'
                                                    ? "linear-gradient(135deg, #f43f5e, #ec4899)"
                                                    : "linear-gradient(135deg, #f59e0b, #fbbf24)",
                                            color: "white",
                                            fontSize: "16px"
                                        }}
                                    >
                                        {notif.tipo === 'atrasado' ? '🚨' : notif.tipo === 'hoy' ? '⚠️' : '📋'}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            marginBottom: "2px"
                                        }}>
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    fontWeight: "800",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px",
                                                    color: notif.tipo === 'atrasado' ? "#991b1b"
                                                        : notif.tipo === 'hoy' ? "#dc2626" : "#d97706",
                                                    background: notif.tipo === 'atrasado' ? "#fecaca"
                                                        : notif.tipo === 'hoy' ? "#fee2e2" : "#fef9c3",
                                                    padding: "1px 6px",
                                                    borderRadius: "4px"
                                                }}
                                            >
                                                {notif.tipo === 'atrasado' ? 'ATRASADO' : notif.tipo === 'hoy' ? 'HOY' : 'RECORDATORIO'}
                                            </span>
                                            <span style={{
                                                fontSize: "11px",
                                                color: "#6b7280"
                                            }}>
                                                Día {notif.diaProgramado}
                                            </span>
                                        </div>

                                        <p style={{
                                            margin: "2px 0 0",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#1f2937",
                                            lineHeight: "1.3"
                                        }}>
                                            {notif.mensaje}
                                        </p>

                                        <p style={{
                                            margin: "4px 0 0",
                                            fontSize: "11px",
                                            color: "#9ca3af"
                                        }}>
                                            {notif.tipo === 'hoy' ? 'Fecha de hoy' : 'Fecha programada'}: {notif.fechaProgramada} • Click para ir al seguimiento
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Animation styles */}
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
