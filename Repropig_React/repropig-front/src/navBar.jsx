import { Link, NavLink, useNavigate } from 'react-router-dom';
import * as bootstrap from "bootstrap";

const NavBar = () => {
  const navigate = useNavigate();

  const revisarOffCanvas = (ruta) => {
    const offcanvasElement = document.getElementById("offcanvasScrolling");
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);

    
    if (bsOffcanvas) {
      bsOffcanvas.hide();
    } else {
      
      const botonCerrar = document.getElementById("botonCerrarOffCanvas");
      if (botonCerrar) botonCerrar.click();
    }

    
    setTimeout(() => {
      navigate(ruta);
    }, 150);
  };

  return (
    <>
      
      <header className="py-2 shadow-sm sticky-top text-white" style={{ backgroundColor: '#e662c9' }}>
        <div className="container d-flex justify-content-between align-items-center">
          
          <div className="d-flex align-items-center gap-3">
            
            <button 
              className="btn text-white border-0 p-0 shadow-none" 
              type="button" 
              data-bs-toggle="offcanvas" 
              data-bs-target="#offcanvasScrolling"
            >
              <span className="fs-3">☰</span>
            </button>

            <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none text-white">
              <div className="bg-white text-dark fw-bold rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 42, height: 42, fontSize: '16px'}}>
                AR
              </div>
              <div className="d-flex flex-column">
                <h2 className="m-0 fw-bold h5">REPROPIG</h2>
                <small className="opacity-75" style={{ fontSize: '11px', marginTop: '-4px' }}>
                 Reproduccion de Porcinos 
                </small>
              </div>
            </Link>
          </div>

          
          <nav className="d-none d-lg-block">
            <ul className="nav align-items-center">
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/">Inicio</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/Partos">Partos</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/Montas">Montas</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/Inseminacion">Inseminacion</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/Raza">Raza</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/porcinos">Porcinos</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/colecta">Colecta</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/Seguimiento_Cerda">Seguimiento Cerda</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/Seguimiento_Camada">Seguimiento Camada</NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/Medicamentos">Medicamentos</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/Responsables">Responsables</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-white px-2 small opacity-80" to="/Reproducciones">Reproducciones</NavLink>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-white px-2 small opacity-80" href="#" role="button" data-bs-toggle="dropdown">
                  Opciones
                </a>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                  <li><Link className="dropdown-item" to="#">Perfil</Link></li>
                  <li><Link className="dropdown-item" to="#">Configuración</Link></li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      
      <div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="offcanvasScrolling">
        <div className="offcanvas-header border-bottom py-3">
          <h5 className="offcanvas-title fw-normal" style={{ color: '#444' }}>REPROPIG</h5>
          <button 
            type="button" 
            className="btn-close" 
            data-bs-dismiss="offcanvas" 
            aria-label="Close" 
            id="botonCerrarOffCanvas"
          ></button>
        </div>
        
       
        <div className="offcanvas-body p-0">
          <div className="list-group list-group-flush">
            <button onClick={() => revisarOffCanvas('/')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Inicio
            </button>
            <button onClick={() => revisarOffCanvas('/Partos')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Partos
            </button>
            <button onClick={() => revisarOffCanvas('/Montas')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Montas
            </button>
            <button onClick={() => revisarOffCanvas('/Inseminacion')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Inseminacion
            </button>
            <button onClick={() => revisarOffCanvas('/Raza')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Raza
            </button>
            <button onClick={() => revisarOffCanvas('/porcinos')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Porcinos
            </button>
            <button onClick={() => revisarOffCanvas('/colecta')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Colecta
            </button>
            <button onClick={() => revisarOffCanvas('/Seguimiento_Cerda')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Seguimiento Cerda
            </button>
            <button onClick={() => revisarOffCanvas('/Seguimiento_Camada')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Seguimiento Camada
            </button>
            <button onClick={() => revisarOffCanvas('/Medicamentos')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Medicamentos
            </button>
            <button onClick={() => revisarOffCanvas('/Responsables')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
              Responsables
            </button>
            <button onClick={() => revisarOffCanvas('/Reproducciones')} className="list-group-item list-group-item-action py-3 border-bottom text-secondary">
             Reproduccion
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;