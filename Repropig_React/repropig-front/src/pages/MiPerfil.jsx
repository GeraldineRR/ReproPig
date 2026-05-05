import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import apiAxios from "../api/axiosConfig"

export default function MiPerfil() {
    const { usuario } = useAuth()
    const navigate = useNavigate()
    const [perfil, setPerfil] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (usuario && usuario.id) {
            cargarPerfil()
        }
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

    // Usar los datos del perfil cargado si existen, si no, usar los de la sesión
    const data = perfil || usuario

    return (
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
                                    <>
                                        <p className="text-xs text-center text-gray-500 mt-3">
                                            Para modificar tu contraseña o datos personales, por favor contacta a un Instructor.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
