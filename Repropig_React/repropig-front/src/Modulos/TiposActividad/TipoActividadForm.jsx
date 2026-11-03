import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const TipoActividadForm = ({ hideModal, tipoEdit }) => {
    const MySwal = withReactContent(Swal)

    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [estado, setEstado] = useState('Activo')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (tipoEdit) {
            setNombre(tipoEdit.Nombre || '')
            setDescripcion(tipoEdit.Descripcion || '')
            setEstado(tipoEdit.Estado || 'Activo')
        } else {
            setNombre('')
            setDescripcion('')
            setEstado('Activo')
        }
    }, [tipoEdit])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const trimmedNombre = nombre.trim()
        if (!trimmedNombre) {
            MySwal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor ingresa el nombre del tipo de actividad.'
            })
            return
        }

        const data = {
            Nombre: trimmedNombre,
            Descripcion: descripcion.trim() || null,
            Estado: estado
        }

        setLoading(true)
        try {
            if (tipoEdit) {
                await apiAxios.put(`/tipos_actividad/${tipoEdit.Id_Tipo}`, data)
                MySwal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Tipo de actividad actualizado correctamente.',
                    timer: 1500,
                    showConfirmButton: false
                })
            } else {
                await apiAxios.post('/tipos_actividad/', data)
                MySwal.fire({
                    icon: 'success',
                    title: '¡Registrado!',
                    text: 'Tipo de actividad registrado correctamente.',
                    timer: 1500,
                    showConfirmButton: false
                })
            }
            hideModal()
        } catch (error) {
            console.error("Error al guardar tipo de actividad:", error)
            const mensaje = error.response?.data?.message || 'No se pudo guardar el tipo de actividad.'
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: mensaje
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
            <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xl shadow-inner mb-2">
                    📋
                </div>
                <h5 className="font-bold text-gray-800 text-lg">
                    {tipoEdit ? 'Editar Tipo de Actividad' : 'Registrar Tipo de Actividad'}
                </h5>
                <p className="text-xs text-gray-500">
                    Define las actividades que se podrán registrar en las sesiones de camada y cerda
                </p>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Nombre de la Actividad <span className="text-rose-500">*</span>
                </label>
                <input
                    type="text"
                    required
                    placeholder="Ej. Vacunación, Descolmillado, Hierro..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Descripción / Observaciones <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>
                <textarea
                    rows="3"
                    placeholder="Detalles sobre el procedimiento, dosis típica o especificaciones..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 resize-none"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />
            </div>

            {tipoEdit && (
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Estado
                    </label>
                    <select
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                    >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
                    onClick={hideModal}
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : (tipoEdit ? 'Actualizar Tipo' : 'Guardar Tipo')}
                </button>
            </div>
        </form>
    )
}

export default TipoActividadForm
