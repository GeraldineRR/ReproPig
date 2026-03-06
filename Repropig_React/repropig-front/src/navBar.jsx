import { Link } from "react-router-dom"
import * as bootstrap from "bootstrap"
import { useNavigate } from "react-router-dom"

const NavBar = () => {

    const navigate = useNavigate()

    const revisarOffCanvas = (ruta) => {

        const offcanvasElement = document.getElementById('offcanvasScrolling')
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement)

        if (bsOffcanvas) {
            document.getElementById('botonCerrarOffCanvas').click()

        }

        setTimeout(() => {

            navigate(ruta)
        }, 150)
    }


    return (
        <>
            <header className="text-white py-3 shadow-sm" style={{ backgroundColor: "#c0417c" }}>
                <div className="container d-flex justify-content-between align-items-center">

                    <button className="btn btn-primary d-lg-none"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasScrolling"
                        aria-controls="offcanvasScrolling">
                        ≡
                    </button>

                    {/* LOGO + NOMBRE */}
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white text-success fw-bold rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 45, height: 45 }}>
                            <h2>🐷</h2>
                        </div>
                        <div>
                            <h2 className="m-0 fw-semibold">ReproPig</h2>
                            <small className="opacity-75">Gestión de porcinos</small>
                        </div>
                    </div>


                    <nav className="navbar navbar-expand-lg  d-none d-lg-block" style={{ backgroundColor: "#c0417c" }}>
                        <div className="container-fluid">
                            <Link className="navbar-brand" to={"/"}>Home</Link>
                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div className="collapse navbar-collapse" id="navbarNavDropdown">
                                <ul className="navbar-nav">
                                    <li className="nav-item">
                                        <Link className="nav-link" to={"/porcino"}>Porcinos</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to={"/raza"}>Razas</Link>
                                    </li>
                                    <li className="nav-item dropdown">
                                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            Opciones
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li><a className="dropdown-item" href="#">Action</a></li>
                                            <li><a className="dropdown-item" href="#">Another action</a></li>
                                            <li><a className="dropdown-item" href="#">Something else here</a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                </div>

            </header>
            {/* MENU LATERAL DESPLEGABLE - OFFCANVAS */}
            <div class="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasScrolling" aria-labelledby="offcanvasScrollingLabel">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvasScrollingLabel">Reproducción Porcina</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" id="botonCerrarOffCanvas"></button>
                </div>
                <div class="offcanvas-body">
                    <ul className="navbar-nav">
                        <li className="nav-item border-bottom">
                            <button onClick={() => revisarOffCanvas('/')} className="nav-link text-start">Home</button>
                        </li>

                        <li className="nav-item border-bottom">
                            <button onClick={() => revisarOffCanvas('/porcino')} className="nav-link text-start">Porcinos</button>
                        </li>

                        <li className="nav-item border-bottom">
                            <button onClick={() => revisarOffCanvas('/raza')} className="nav-link text-start">Razas</button>
                        </li>
                    </ul>
                </div>
            </div>

        </>
    )
}

export default NavBar