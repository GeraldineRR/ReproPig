import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiAxios from "./api/axiosConfig";

function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await apiAxios.post(
        `/auth/reset-password?token=${token}`,
        { password }
      );

      setMensaje(response.data.message || "Contraseña actualizada correctamente");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Error al cambiar contraseña");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card p-4 shadow-sm">
        <h2 className="mb-4 text-center">Restablecer contraseña</h2>
        
        {mensaje && <div className="alert alert-success">{mensaje}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Nueva contraseña</label>

            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label>Confirmar contraseña</label>

            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="aceptaPoliticas"
              checked={aceptaPoliticas}
              onChange={(e) => setAceptaPoliticas(e.target.checked)}
              required
            />
            <label className="form-check-label" htmlFor="aceptaPoliticas" style={{ fontSize: '0.85rem', color: '#555' }}>
              Acepto los <a href="/terminos-condiciones" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a> y la <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad</a> del SENA.
            </label>
          </div>

          <button className="btn btn-primary w-100" style={{ background: '#C97A85', border: 'none' }} disabled={!aceptaPoliticas}>
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;