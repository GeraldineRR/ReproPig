import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    background: linear-gradient(135deg,
      #fff5f0 0%,
      #fdeee8 20%,
      #fce4d8 40%,
      #faf0ea 60%,
      #fde8e0 80%,
      #fff2ec 100%
    );
    background-size: 300% 300%;
    animation: gradientShift 10s ease infinite;
    position: relative;
    overflow: hidden;
  }

  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Blobs muy suaves */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    animation: floatBlob 7s ease-in-out infinite;
  }
  .blob-1 {
    width: 500px; height: 500px;
    background: #fcd5be;
    opacity: 0.45;
    top: -160px; left: -140px;
    animation-delay: 0s;
  }
  .blob-2 {
    width: 380px; height: 380px;
    background: #f9c4ae;
    opacity: 0.35;
    bottom: -100px; right: -100px;
    animation-delay: 2.5s;
  }
  .blob-3 {
    width: 220px; height: 220px;
    background: #fde2d4;
    opacity: 0.4;
    top: 45%; left: 68%;
    animation-delay: 5s;
  }
  .blob-4 {
    width: 180px; height: 180px;
    background: #fbd0c0;
    opacity: 0.3;
    top: 10%; right: 15%;
    animation-delay: 3.5s;
  }

  @keyframes floatBlob {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-28px) scale(1.04); }
  }

  /* Card */
  .login-card {
    position: relative;
    width: 430px;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.75);
    border-radius: 32px;
    padding: 54px 46px;
    box-shadow:
      0 8px 40px rgba(220, 140, 110, 0.12),
      0 2px 10px rgba(255, 255, 255, 0.6) inset;
    animation: cardIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    z-index: 1;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(36px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Logo */
  .login-logo {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 6px;
  }
  .login-logo-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #f9c4ae, #f0a882);
    border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 21px;
    box-shadow: 0 4px 14px rgba(240,168,130,0.4);
  }
  .login-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 21px;
    font-weight: 600;
    background: linear-gradient(135deg, #c0714a, #d9825e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.5px;
  }

  .login-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    font-weight: 600;
    color: #5a2e1a;
    margin-top: 28px;
    line-height: 1.2;
  }
  .login-subtitle {
    font-size: 14px;
    color: #b8856a;
    margin-top: 6px;
    font-weight: 300;
    letter-spacing: 0.2px;
  }

  /* Form */
  .login-form {
    margin-top: 34px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .field-label {
    font-size: 11.5px;
    font-weight: 500;
    color: #c09070;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 7px;
    display: block;
  }

  .field-wrap { position: relative; }

  .field-icon {
    position: absolute;
    left: 15px; top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    color: #f0a882;
    pointer-events: none;
    line-height: 1;
  }

  .login-input {
    width: 100%;
    padding: 13px 16px 13px 42px;
    background: rgba(255, 255, 255, 0.65);
    border: 1.5px solid rgba(240, 168, 130, 0.25);
    border-radius: 13px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: #4a2010;
    outline: none;
    transition: all 0.22s ease;
    backdrop-filter: blur(4px);
  }
  .login-input::placeholder { color: #d4b0a0; }
  .login-input:focus {
    border-color: #f0a882;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 0 0 3px rgba(240,168,130,0.15), 0 2px 8px rgba(240,168,130,0.1);
    transform: translateY(-1px);
  }

  .forgot-link { text-align: right; margin-top: -8px; }
  .forgot-link a {
    font-size: 12.5px;
    color: #d9825e;
    text-decoration: none;
    font-weight: 400;
    transition: opacity 0.2s;
  }
  .forgot-link a:hover { opacity: 0.65; text-decoration: underline; }

  /* Botón */
  .login-btn {
    margin-top: 6px;
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #f9c4ae 0%, #f0a882 45%, #e0896a 100%);
    color: #fff;
    border: none;
    border-radius: 13px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15.5px;
    font-weight: 500;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.28s ease;
    box-shadow: 0 5px 20px rgba(224,137,106,0.38);
    position: relative;
    overflow: hidden;
  }
  .login-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.22), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(224,137,106,0.48);
  }
  .login-btn:hover::before { opacity: 1; }
  .login-btn:active { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  /* Spinner */
  .btn-spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.38);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Divider */
  .divider {
    display: flex; align-items: center; gap: 12px;
    color: #d4b0a0;
    font-size: 12px;
  }
  .divider::before, .divider::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(240,168,130,0.28), transparent);
  }

  /* Register */
  .register-link {
    text-align: center;
    font-size: 14px;
    color: #b8856a;
  }
  .register-link a {
    color: #d9825e;
    font-weight: 500;
    text-decoration: none;
    transition: opacity 0.2s;
    border-bottom: 1px solid rgba(217,130,94,0.35);
    padding-bottom: 1px;
  }
  .register-link a:hover { opacity: 0.7; }

  /* Error */
  .login-error {
    background: rgba(255,200,180,0.2);
    border: 1px solid rgba(220,120,100,0.25);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #a04030;
    text-align: center;
    animation: shake 0.4s ease;
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    25%      { transform: translateX(-5px); }
    75%      { transform: translateX(5px); }
  }

  /* Éxito */
  .login-success {
    text-align: center;
    padding: 18px 0;
    animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }
  .success-ring {
    width: 68px; height: 68px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f9c4ae, #e0896a);
    display: flex; align-items: center; justify-content: center;
    font-size: 30px;
    margin: 0 auto 14px;
    box-shadow: 0 6px 22px rgba(224,137,106,0.38);
  }
  .success-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    color: #5a2e1a;
    margin-bottom: 6px;
  }
  .success-sub { font-size: 13.5px; color: #b8856a; }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }

  /* Ojo botón */
  .eye-btn {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer; font-size: 15px;
    color: #d4b0a0;
    line-height: 1; padding: 0;
    transition: color 0.2s;
  }
  .eye-btn:hover { color: #e0896a; }

  /* Decorativos card */
  .card-deco {
    position: absolute;
    pointer-events: none;
    opacity: 0.12;
    font-size: 72px;
    animation: rotateDeco 30s linear infinite;
  }
  .card-deco-1 { top: -18px; right: 24px; animation-duration: 28s; }
  .card-deco-2 { bottom: 14px; left: 18px; font-size: 52px; animation-direction: reverse; animation-duration: 20s; }
  @keyframes rotateDeco {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @media (max-width: 500px) {
    .login-card { width: 95vw; padding: 40px 28px; border-radius: 24px; }
    .login-title { font-size: 26px; }
  }
`;

export default function Login() {
  const [form, setForm]         = useState({ email: "", password: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Credenciales incorrectas.");
      localStorage.setItem("token", data.token);
      setSuccess(true);
      setTimeout(() => { window.location.href = "/dashboard"; }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        {/* Blobs de fondo */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />

        <div className="login-card">
          {/* Decorativos */}
          <span className="card-deco card-deco-1">🌸</span>
          <span className="card-deco card-deco-2">✿</span>

          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">🐷</div>
            <span className="login-logo-text">ReproPig</span>
          </div>

          {success ? (
            <div className="login-success">
              <div className="success-ring">✓</div>
              <p className="success-title">¡Bienvenida de vuelta!</p>
              <p className="success-sub">Redirigiendo al dashboard…</p>
            </div>
          ) : (
            <>
              
              <h1 className="login-title">Iniciar Sesion</h1>

              <form className="login-form" onSubmit={handleSubmit}>

                {/* Email */}
                <div>
                  <label className="field-label">Correo electrónico</label>
                  <div className="field-wrap">
                    <span className="field-icon">✉️</span>
                    <input
                      className="login-input"
                      type="email"
                      name="email"
                      placeholder="tu@correo.com"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="field-label">Contraseña</label>
                  <div className="field-wrap">
                    <span className="field-icon">🔒</span>
                    <input
                      className="login-input"
                      type={showPass ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="forgot-link">
                  <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
                </div>

                {error && <div className="login-error">⚠️ {error}</div>}

                <button className="login-btn" type="submit" disabled={loading}>
                  {loading
                    ? <><span className="btn-spinner" />Ingresando…</>
                    : "Iniciar sesión"
                  }
                </button>

                <div className="divider">o</div>

                <p className="register-link">
                  ¿No tienes cuenta?{" "}
                  <a href="/register">Regístrate aquí</a>
                </p>

              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}