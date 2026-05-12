import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig"


function ModalCambioContrasena({ onCerrar }) {
    const { usuario, token } = useAuth()
    const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" })
    const [mostrar, setMostrar] = useState({ actual: false, nueva: false, confirmar: false })
    const [error, setError] = useState("")
    const [exito, setExito] = useState("")
    const [cargando, setCargando] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError("")
        setExito("")
    }

    const toggleMostrar = (campo) => {
        setMostrar((prev) => ({ ...prev, [campo]: !prev[campo] }))
    }

    const validar = () => {
        if (!form.actual || !form.nueva || !form.confirmar)
            return "Todos los campos son obligatorios."
        if (form.nueva.length < 6)
            return "La nueva contraseña debe tener al menos 6 caracteres."
        if (form.nueva !== form.confirmar)
            return "La nueva contraseña y la confirmación no coinciden."
        return null
    }

    const handleSubmit = async () => {
        const mensajeError = validar()
        if (mensajeError) return setError(mensajeError)

        setCargando(true)
        try {
            await apiAxios.put(
                `/responsables/${usuario.id}/cambiar-contrasena`,
                { contrasenaActual: form.actual, contrasenaNueva: form.nueva },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setExito("¡Contraseña actualizada correctamente!")
            setForm({ actual: "", nueva: "", confirmar: "" })
        } catch (err) {
            const msg = err?.response?.data?.message || "Error al cambiar la contraseña. Verifica tu contraseña actual."
            setError(msg)
        } finally {
            setCargando(false)
        }
    }

    // Campos del formulario
    const campos = [
        { name: "actual", label: "Contraseña actual", placeholder: "Ingresa tu contraseña actual" },
        { name: "nueva", label: "Nueva contraseña", placeholder: "Mínimo 6 caracteres" },
        { name: "confirmar", label: "Confirmar nueva contraseña", placeholder: "Repite la nueva contraseña" },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">

                {/* Cabecera */}
                <button
                    onClick={onCerrar}
                    className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 transition-colors text-xl"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center">
                        <i className="fa-solid fa-lock text-pink-500 text-lg"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800">Cambiar contraseña</h2>
                        <p className="text-sm text-gray-400">Actualiza tu contraseña de acceso</p>
                    </div>
                </div>

                {/* Campos */}
                <div className="space-y-4">
                    {campos.map(({ name, label, placeholder }) => (
                        <div key={name}>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                {label}
                            </label>
                            <div className="relative">
                                <input
                                    type={mostrar[name] ? "text" : "password"}
                                    name={name}
                                    value={form[name]}
                                    onChange={handleChange}
                                    placeholder={placeholder}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleMostrar(name)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
                                >
                                    <i className={`fa-solid ${mostrar[name] ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                        <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                        <span>{error}</span>
                    </div>
                )}
                {exito && (
                    <div className="mt-4 flex items-start gap-2 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-3">
                        <i className="fa-solid fa-circle-check mt-0.5"></i>
                        <span>{exito}</span>
                    </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCerrar}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={cargando}
                        className="flex-1 py-2.5 rounded-xl bg-pink-500 text-white font-bold text-sm shadow-sm hover:bg-pink-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {cargando
                            ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Guardando...</>
                            : <><i className="fa-solid fa-lock mr-2"></i>Actualizar</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function MiPerfil() {
    const { usuario } = useAuth()
    const navigate = useNavigate()
    const [perfil, setPerfil] = useState(null)
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)

    useEffect(() => {
        if (usuario && usuario.id) cargarPerfil()
    }, [usuario])

    const cargarPerfil = async () => {
        try {
            const res = await apiAxios.get(`/responsables/${usuario.id}`)
            setPerfil(res.data)
        } catch (error) {
            console.error("Error cargando perfil", error)
        } finally {
            setLoading(false)
        }
    }

    if (!usuario) return null
    if (loading) return <div className="text-center p-10 text-gray-500">Cargando tu perfil...</div>

    const data = perfil || usuario
    const puedeChangiarContrasena = ["gestor", "pasante"].includes(usuario.cargo)

    return (
        <>
            {/* Modal */}
            {modalAbierto && <ModalCambioContrasena onCerrar={() => setModalAbierto(false)} />}

            <div className="max-w-4xl mx-auto mt-4 px-4 pb-12">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-pink-600 transition-colors font-medium mb-6">
                    <i className="fa-solid fa-arrow-left mr-2"></i> Volver
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Portada */}
                    <div className="h-48 bg-gradient-to-r from-pink-300 via-pink-400 to-[#C97A85] relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>

                    {/* Foto de Perfil y Nombre */}
                    <div className="px-8 pb-8 relative">
                        <div className="flex justify-between items-end mb-4">
                            <div className="-mt-16 relative">
                                <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                                    <div className="w-full h-full bg-pink-100 rounded-full flex items-center justify-center text-5xl font-black text-pink-600 border-4 border-pink-50">
                                        {usuario.nombres ? usuario.nombres.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </div>
                            </div>
                            <div className="mb-2">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                                    usuario.cargo === 'instructor'
                                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                    <i className="fa-solid fa-medal mr-2"></i>
                                    {usuario.cargo.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="mt-2">
                            <h1 className="text-3xl font-black text-gray-800 tracking-tight">{usuario.nombres} {usuario.apellidos}</h1>
                            <p className="text-gray-500 font-medium text-lg mt-1">@{usuario.Nom_Usuario || usuario.nombres.toLowerCase()}</p>
                        </div>

                        <hr className="my-8 border-gray-100" />

                        {/* Información Detallada */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Datos Personales</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 mr-4">
                                            <i className="fa-solid fa-id-card"></i>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Documento / ID</p>
                                            <p className="font-semibold text-gray-800">{data.Documento || 'No registrado'}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 mr-4">
                                            <i className="fa-solid fa-phone"></i>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Teléfono</p>
                                            <p className="font-semibold text-gray-800">{data.Telefono || 'No registrado'}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 mr-4">
                                            <i className="fa-solid fa-envelope"></i>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Correo Electrónico</p>
                                            <p className="font-semibold text-gray-800">{data.Email || data.email || 'No registrado'}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Información de Sistema</h3>
                                <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
                                    <div className="flex items-center mb-4">
                                        <i className="fa-solid fa-shield-halved text-pink-500 text-xl mr-3"></i>
                                        <div>
                                            <p className="font-bold text-gray-800">Nivel de Acceso</p>
                                            <p className="text-sm text-gray-600">
                                                {usuario.cargo === 'instructor'
                                                    ? 'Acceso total al sistema. Eres administrador.'
                                                    : 'Acceso a registros operativos y visualización.'}
                                            </p>
                                        </div>
                                    </div>

                                    {usuario.cargo === 'instructor' ? (
                                        <>
                                            <button onClick={() => navigate('/responsables')} className="w-full mt-2 bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-sm hover:bg-pink-600 transition-colors">
                                                <i className="fa-solid fa-users-gear mr-2"></i> Administrar mi perfil y otros
                                            </button>
                                            <p className="text-xs text-center text-gray-500 mt-3">
                                                Como Instructor, puedes cambiar tu contraseña y actualizar tus datos desde el Panel de Administración.
                                            </p>
                                        </>
                                    ) : (
                                        /* ── Gestor / Pasante: botón de cambio de contraseña ── */
                                        <>
                                            <button
                                                onClick={() => setModalAbierto(true)}
                                                className="w-full mt-2 bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-sm hover:bg-pink-600 transition-colors"
                                            >
                                                <i className="fa-solid fa-lock mr-2"></i> Cambiar contraseña
                                            </button>
                                            <p className="text-xs text-center text-gray-500 mt-3">
                                                Para actualizar otros datos personales, contacta a un Instructor.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}