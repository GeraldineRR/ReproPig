import { useState } from 'react'
import apiAxios from '../../api/axiosConfig'
import Swal from 'sweetalert2'
import WithReactContent from 'sweetalert2-react-content'

const RegisterUsuario = ({ hideModal, refreshTable }) => {
    const MySwal = WithReactContent(Swal)

    const [form, setForm] = useState({
        Nombres: '', Apellidos: '', Documento: '',
        Cargo: '', Telefono: '', Email: '', Password: '', confirmar: ''
    })
    const [cargando, setCargando] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.Password !== form.confirmar) {
            MySwal.fire({ icon: 'warning', title: 'Error', text: 'Las contraseñas no coinciden' })
            return
        }
        if (form.Password.length < 6) {
            MySwal.fire({ icon: 'warning', title: 'Error', text: 'La contraseña debe tener mínimo 6 caracteres' })
            return
        }
        setCargando(true)
        try {
            const { confirmar, ...datos } = form
            await apiAxios.post('/auth/register', datos)
            MySwal.fire({ icon: 'success', title: 'Usuario creado', text: `Cuenta creada para ${form.Nombres} ${form.Apellidos}` })
            hideModal()
            refreshTable()
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message })
        } finally {
            setCargando(false)
        }
    }

    const inputStyle = { borderRadius: '10px', padding: '10px 14px' }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-6 mb-3">
                    <label className="form-label fw-semibold">Nombres</label>
                    <input type="text" className="form-control" style={inputStyle}
                        value={form.Nombres} onChange={e => setForm({...form, Nombres: e.target.value})} required />
                </div>
                <div className="col-6 mb-3">
                    <label className="form-label fw-semibold">Apellidos</label>
                    <input type="text" className="form-control" style={inputStyle}
                        value={form.Apellidos} onChange={e => setForm({...form, Apellidos: e.target.value})} required />
                </div>
            </div>
            <div className="row">
                <div className="col-6 mb-3">
                    <label className="form-label fw-semibold">Documento</label>
                    <input type="text" className="form-control" style={inputStyle}
                        value={form.Documento} onChange={e => setForm({...form, Documento: e.target.value})} required />
                </div>
                <div className="col-6 mb-3">
                    <label className="form-label fw-semibold">Cargo</label>
                    <select className="form-select" style={inputStyle}
                        value={form.Cargo} onChange={e => setForm({...form, Cargo: e.target.value})} required>
                        <option value="">Seleccione</option>
                        <option value="Gestor">Gestor</option>
                        <option value="Instructor">Instructor</option>
                        <option value="Pasante">Pasante</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="col-6 mb-3">
                    <label className="form-label fw-semibold">Teléfono</label>
                    <input type="text" className="form-control" style={inputStyle}
                        value={form.Telefono} onChange={e => setForm({...form, Telefono: e.target.value})} />
                </div>
                <div className="col-6 mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input type="email" className="form-control" style={inputStyle}
                        value={form.Email} onChange={e => setForm({...form, Email: e.target.value})} required />
                </div>
            </div>
            <div className="row">
                <div className="col-6 mb-3">
                    <label className="form-label fw-semibold">Contraseña</label>
                    <input type="password" className="form-control" style={inputStyle}
                        placeholder="Mín. 6 caracteres"
                        value={form.Password} onChange={e => setForm({...form, Password: e.target.value})} required />
                </div>
                <div className="col-6 mb-3">
                    <label className="form-label fw-semibold">Confirmar</label>
                    <input type="password" className="form-control" style={inputStyle}
                        placeholder="Repetir contraseña"
                        value={form.confirmar} onChange={e => setForm({...form, confirmar: e.target.value})} required />
                </div>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={cargando}
                style={{ borderRadius: '10px', padding: '12px', fontWeight: 600 }}>
                {cargando ? 'Creando cuenta...' : '✅ Crear usuario'}
            </button>
        </form>
    )
}

export default RegisterUsuario
