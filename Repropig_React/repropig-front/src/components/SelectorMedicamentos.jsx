import { useState, useEffect, useRef } from "react";

export default function SelectorMedicamentos({
    medicamentos = [],
    seleccionados = [],
    onToggle,
    label = "💊 Medicamentos",
    placeholder = "Seleccionar medicamentos...",
    className = "mb-3 position-relative"
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const count = Array.isArray(seleccionados) ? seleccionados.length : 0;
    const selectedIds = (Array.isArray(seleccionados) ? seleccionados : []).map(String);

    // Filtrar medicamentos activos o que ya estén seleccionados (para edición)
    const listaMedicamentos = Array.isArray(medicamentos)
        ? medicamentos.filter(m => (!m.Estado || m.Estado === 'Activo' || m.Estado === 'A') || selectedIds.includes(String(m.Id_Medicamento)))
        : [];

    return (
        <div className={className} ref={containerRef}>
            <label className="form-label fw-semibold">
                {label} ({count})
            </label>

            <div
                className="form-control shadow-sm d-flex justify-content-between align-items-center"
                onClick={() => setIsOpen(prev => !prev)}
                style={{
                    cursor: "pointer",
                    userSelect: "none",
                    backgroundColor: "#fff",
                    minHeight: "38px"
                }}
            >
                <span className={count === 0 ? "text-muted" : "text-dark fw-medium"}>
                    {count === 0 ? placeholder : `${count} ${count === 1 ? 'seleccionado' : 'seleccionados'}`}
                </span>
                <span
                    className="text-muted small"
                    style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease"
                    }}
                >
                    ▼
                </span>
            </div>

            {isOpen && (
                <div
                    className="dropdown-menu show w-100 shadow-sm border rounded-3 p-0"
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        zIndex: 1050,
                        maxHeight: "260px",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#fff",
                        overflow: "hidden"
                    }}
                >
                    {/* Lista scrolleable */}
                    <ul
                        className="list-unstyled m-0 p-1"
                        style={{
                            maxHeight: "190px",
                            overflowY: "auto"
                        }}
                    >
                        {listaMedicamentos.length === 0 ? (
                            <li className="px-3 py-2 text-muted small">No hay medicamentos registrados</li>
                        ) : (
                            listaMedicamentos.map(m => {
                                const activo = selectedIds.includes(String(m.Id_Medicamento));
                                return (
                                    <li
                                        key={m.Id_Medicamento}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onToggle) onToggle(m.Id_Medicamento);
                                        }}
                                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2"
                                        style={{ cursor: "pointer", userSelect: "none" }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="form-check-input m-0"
                                            checked={activo}
                                            onChange={() => {}}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <span className={activo ? "fw-bold text-dark" : "text-secondary"}>
                                            {m.Nombre} {m.Tipo ? <span className="text-muted small">({m.Tipo})</span> : ""}
                                        </span>
                                    </li>
                                );
                            })
                        )}
                    </ul>

                    {/* Barra inferior con contador y botón OK */}
                    <div className="p-2 border-top bg-light d-flex justify-content-between align-items-center">
                        <small className="text-muted ms-1" style={{ fontSize: "11.5px" }}>
                            {count} {count === 1 ? "seleccionado" : "seleccionados"}
                        </small>
                        <button
                            type="button"
                            className="btn btn-sm btn-primary px-3 py-1 fw-bold d-flex align-items-center gap-1 shadow-sm"
                            style={{ fontSize: "12px", borderRadius: "6px" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                        >
                            <span>✓</span> OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

