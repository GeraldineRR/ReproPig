import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from "react-data-table-component"
import PorcinoForm from "./porcinoForm.jsx"
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js"
import { QRCodeSVG } from "qrcode.react"
import { Link } from "react-router-dom"
import { customTableStyles } from "../../styles/tableStyles.js"

const CrudPorcinos = () => {

    const [porcinos, setPorcinos] = useState([])
    const [loadingId, setLoadingId] = useState(null)

    const [porcinoEdit, setPorcinoEdit] = useState(null)
    const [porcinoQR, setPorcinoQR] = useState(null)

    const [filterText, setFilterText] = useState("")
    
    // Se conserva el filtro de Adultos / Lechones
    const [filterTipo, setFilterTipo] = useState("Todos")


    // =========================================================
    // CALCULAR EDAD AL MOMENTO DE LLEGADA
    // =========================================================

    const calcularEdadLlegada = (fechaNacimiento, fechaLlegada) => {

        if (!fechaNacimiento || !fechaLlegada) return null

        const nacimiento = new Date(fechaNacimiento)
        const llegada = new Date(fechaLlegada)

        let años = llegada.getFullYear() - nacimiento.getFullYear()
        let meses = llegada.getMonth() - nacimiento.getMonth()

        if (meses < 0) {
            años--
            meses += 12
        }

        return años * 12 + meses
    }


    // =========================================================
    // CALCULAR EDAD ACTUAL
    // =========================================================

    const calcularEdadActual = (fechaNacimiento) => {

        if (!fechaNacimiento) return 0

        const nacimiento = new Date(fechaNacimiento)
        const hoy = new Date()

        if (hoy < nacimiento) return 0

        let años = hoy.getFullYear() - nacimiento.getFullYear()
        let meses = hoy.getMonth() - nacimiento.getMonth()

        if (meses < 0) {
            años--
            meses += 12
        }

        return años * 12 + meses
    }


    // =========================================================
    // OBTENER PORCINOS
    // =========================================================

    const getAllPorcinos = async () => {

        try {

            const response = await apiAxios.get("/porcino/")

            setPorcinos(response.data)

        } catch (error) {

            console.error("Error al obtener porcinos:", error)

        }
    }


    // =========================================================
    // CARGAR DATOS AL INICIAR
    // =========================================================

    useEffect(() => {

        getAllPorcinos()

    }, [])


    // =========================================================
    // CAMBIAR ESTADO DEL PORCINO
    // =========================================================

    const toggleEstado = async (id) => {

        setLoadingId(id)

        try {

            const res = await apiAxios.put(
                `/porcino/${id}/toggle-estado`
            )

            setPorcinos(prev =>
                prev.map(p =>
                    p.Id_Porcino === id
                        ? {
                            ...p,
                            Estado: res.data.Estado
                        }
                        : p
                )
            )

        } catch (error) {

            console.error(
                "Error cambiando estado:",
                error
            )

        } finally {

            setLoadingId(null)

        }
    }


    // =========================================================
    // COLUMNAS DE LA TABLA
    // =========================================================

    const columnsTable = [

        {
            name: "Nombre",
            selector: row => row.Nom_Porcino || "—"
        },

        {
            name: "Chapeta",
            selector: row => row.Num_Chapeta || "—"
        },

        {
            name: "Placa Sena",
            selector: row => row.Plac_Sena_Porcino || "—"
        },

        {
            name: "Raza",
            selector: row => row.raza?.Nom_Raza || "—",
            sortable: false
        },

        {
            name: "Sexo",

            selector: row => {

                const sexo =
                    row.Gen_Porcino
                        ?.trim()
                        .toLowerCase()

                if (sexo === "m") {

                    return (
                        <span className="fw-normal">
                            <i className="fa-solid fa-mars text-primary me-1"></i>
                            Macho
                        </span>
                    )
                }

                if (sexo === "h") {

                    return (
                        <span className="fw-normal">
                            <i className="fa-solid fa-venus text-danger me-1"></i>
                            Hembra
                        </span>
                    )
                }

                return "N/A"
            }
        },

        {
            name: "Procedencia",

            selector: row => (

                <span
                    className={`badge rounded-pill px-2 py-1 ${
                        row.Proc_Porcino
                            ?.trim()
                            .toLowerCase() === "interno"
                            ? "bg-success"
                            : "bg-primary"
                    }`}
                >
                    {row.Proc_Porcino || "—"}
                </span>

            )
        },

        {
            name: "Lugar Proc.",
            selector: row =>
                row.Lug_Proc_Porcino || "—"
        },

        {
            name: "Fecha Nac.",
            selector: row =>
                row.Fec_Nac_Porcino || "—"
        },

        {
            name: "Fecha Lleg",
            selector: row =>
                row.Fec_Llegada || "—"
        },

        {
            name: "Peso Lleg (kg)",

            selector: row => {

                const peso = row.Peso_Llegada

                if (!peso) {
                    return "No aplica"
                }

                let clase = ""
                let icono = ""

                if (peso < 1) {

                    clase = "bg-danger"
                    icono = "⚠"

                } else if (peso < 2) {

                    clase = "bg-danger-subtle text-danger"
                    icono = "!"

                } else {

                    clase = "bg-success"
                    icono = "✓"
                }

                return (

                    <span
                        className={`badge ${clase} px-2 py-1`}
                    >
                        {icono} {peso} kg
                    </span>

                )
            }
        },

        {
            name: "Edad Llegada",

            selector: row => {

                const edad =
                    calcularEdadLlegada(
                        row.Fec_Nac_Porcino,
                        row.Fec_Llegada
                    )

                return edad !== null
                    ? `${edad} meses`
                    : "N/A"
            }
        },

        {
            name: "Edad Actual",

            selector: row => {

                const edad =
                    calcularEdadActual(
                        row.Fec_Nac_Porcino
                    )

                return `${edad} meses`
            }
        },

        {
            name: "Estado",

            selector: row => (

                <button
                    className={`badge border-0 ${
                        row.Estado === "Activo"
                            ? "bg-success"
                            : "bg-danger"
                    }`}

                    onClick={() =>
                        toggleEstado(row.Id_Porcino)
                    }

                    disabled={
                        loadingId === row.Id_Porcino
                    }
                >

                    {loadingId === row.Id_Porcino
                        ? "..."
                        : row.Estado
                    }

                </button>

            )
        },

        {
            name: "Acciones",

            cell: row => (

                <div className="d-flex gap-2">

                    {/* EDITAR */}
                    <button
                        className="btn btn-sm bg-info"
                        onClick={() =>
                            handleEdit(row)
                        }
                        title="Editar"
                    >
                        <i className="fa-solid fa-pencil"></i>
                    </button>


                    {/* QR SOLO PARA HEMBRAS */}
                    {row.Gen_Porcino
                        ?.trim()
                        .toLowerCase() === "h" && (

                        <button
                            className="btn btn-sm btn-dark"
                            onClick={() =>
                                handleShowQR(row)
                            }
                            title="Ver QR de Cerda"
                        >
                            <i className="fa-solid fa-qrcode"></i>
                        </button>

                    )}


                    {/* PERFIL SOLO PARA HEMBRAS */}
                    {row.Gen_Porcino
                        ?.trim()
                        .toLowerCase() === "h" && (

                        <Link
                            to={`/perfil-cerda/${row.Id_Porcino}`}
                            className="btn btn-sm btn-primary"
                            title="Ver Perfil Completo"
                        >
                            <i className="fa-solid fa-eye"></i>
                        </Link>

                    )}

                </div>
            ),

            width: "150px"
        }

    ]


    // =========================================================
    // FILTRADO
    // =========================================================

    const newListPorcinos = porcinos.filter(porcino => {

        const textToSearch =
            filterText
                .toLowerCase()
                .trim()


        // -------------------------
        // DATOS PARA BÚSQUEDA
        // -------------------------

        const chapeta =
            porcino.Num_Chapeta
                ?.toString()
                .toLowerCase() || ""

        const nombre =
            porcino.Nom_Porcino
                ?.toLowerCase() || ""

        const placa =
            porcino.Plac_Sena_Porcino
                ?.toString()
                .toLowerCase() || ""

        const procedencia =
            porcino.Proc_Porcino
                ?.toLowerCase() || ""

        const sexoBase =
            porcino.Gen_Porcino
                ?.trim()
                .toLowerCase() || ""


        let sexo = ""

        if (sexoBase === "m") {

            sexo = "macho"

        } else if (sexoBase === "h") {

            sexo = "hembra"

        } else {

            sexo = sexoBase

        }


        // -------------------------
        // FILTRO DE TEXTO
        // -------------------------

        const pasaTexto = (

            chapeta.includes(textToSearch) ||

            nombre.includes(textToSearch) ||

            placa.includes(textToSearch) ||

            procedencia.includes(textToSearch) ||

            sexo.includes(textToSearch)

        )


        // -------------------------
        // FILTRO ADULTOS / LECHONES
        // -------------------------
        //
        // IMPORTANTE:
        // Tipo_Cerdo NO aparece en la tabla.
        // Solo se utiliza internamente
        // para que los botones sigan funcionando.
        //

        const pasaTipo =

            filterTipo === "Todos" ||

            porcino.Tipo_Cerdo
                ?.trim()
                .toLowerCase() ===
                filterTipo.toLowerCase()


        return pasaTexto && pasaTipo

    })


    // =========================================================
    // CERRAR MODAL
    // =========================================================

    const hideModal = () => {

        setPorcinoEdit(null)

        const closeButton =
            document.getElementById("closeModal")

        if (closeButton) {
            closeButton.click()
        }
    }


    // =========================================================
    // EDITAR PORCINO
    // =========================================================

    const handleEdit = (porcino) => {

        setPorcinoEdit(porcino)

        const modal =
            new bootstrap.Modal(
                document.getElementById("exampleModal")
            )

        modal.show()
    }


    // =========================================================
    // MOSTRAR QR
    // =========================================================

    const handleShowQR = (porcino) => {

        setPorcinoQR(porcino)

        const modal =
            new bootstrap.Modal(
                document.getElementById("qrModal")
            )

        modal.show()
    }


    // =========================================================
    // INTERFAZ
    // =========================================================

    return (

        <>

            <div className="container mt-5">


                {/* =====================================================
                    BUSCADOR + FILTROS + BOTÓN
                ====================================================== */}

                <div className="row d-flex mb-3 justify-content-between align-items-center">


                    {/* BUSCADOR */}

                    <div className="col-5">

                        <div className="input-group">

                            <span className="input-group-text">
                                🔍
                            </span>

                            <input
                                className="form-control"

                                value={filterText}

                                onChange={(e) =>
                                    setFilterText(
                                        e.target.value
                                    )
                                }

                                placeholder="Buscar un nombre, chapeta, placa o procedencia..."
                            />

                        </div>

                    </div>


                    {/* FILTRO */}

                    <div className="col-auto">

                        <div
                            className="btn-group"
                            role="group"
                            aria-label="Filtrar por tipo"
                        >

                            {[
                                "Todos",
                                "Adulto",
                                "Lechon"
                            ].map(tipo => (

                                <button
                                    key={tipo}
                                    type="button"

                                    className={`btn ${
                                        filterTipo === tipo
                                            ? "btn-dark"
                                            : "btn-outline-dark"
                                    }`}

                                    onClick={() =>
                                        setFilterTipo(tipo)
                                    }
                                >

                                    {tipo === "Todos"
                                        ? "🐷 Todos"
                                        : tipo === "Adulto"
                                            ? "🐗 Adultos"
                                            : "🐽 Lechones"
                                    }

                                </button>

                            ))}

                        </div>

                    </div>


                    {/* REGISTRAR */}

                    <div className="col-auto">

                        <button
                            type="button"
                            className="btn btn-success"

                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"

                            onClick={() =>
                                setPorcinoEdit(null)
                            }
                        >
                            + Registrar porcino
                        </button>

                    </div>

                </div>


                {/* =====================================================
                    TABLA
                ====================================================== */}

                <DataTable

                    title={
                        <h4 className="fw-bold text-gray-800 m-0 py-2">
                            Porcinos
                        </h4>
                    }

                    columns={columnsTable}

                    data={newListPorcinos}

                    keyField="Id_Porcino"

                    pagination

                    highlightOnHover

                    pointerOnHover

                    striped

                    responsive

                    customStyles={customTableStyles}

                />


                {/* =====================================================
                    MODAL AGREGAR / EDITAR
                ====================================================== */}

                <div
                    className="modal fade"
                    id="exampleModal"
                    tabIndex="-1"
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true"
                >

                    <div className="modal-dialog">

                        <div className="modal-content">


                            <div className="modal-header">

                                <h1
                                    className="modal-title fs-5"
                                    id="exampleModalLabel"
                                >
                                    {porcinoEdit
                                        ? "Editar Porcino"
                                        : "Agregar Porcino"
                                    }
                                </h1>

                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    id="closeModal"
                                >
                                </button>

                            </div>


                            <div className="modal-body">

                                <PorcinoForm

                                    key={
                                        porcinoEdit
                                            ? porcinoEdit.Id_Porcino
                                            : "new"
                                    }

                                    hideModal={hideModal}

                                    porcinoEdit={porcinoEdit}

                                    reload={getAllPorcinos}

                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    MODAL QR
                ====================================================== */}

                <div
                    className="modal fade"
                    id="qrModal"
                    tabIndex="-1"
                    aria-hidden="true"
                >

                    <div className="modal-dialog modal-sm modal-dialog-centered">

                        <div className="modal-content border-0 shadow">


                            <div className="modal-header border-0 pb-0">

                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                </button>

                            </div>


                            <div className="modal-body text-center pt-0 pb-4">

                                {porcinoQR && (

                                    <>

                                        <h5 className="mb-1 text-danger fw-bold">
                                            {porcinoQR.Nom_Porcino}
                                        </h5>


                                        <p className="text-muted small mb-3">
                                            Chapeta: {porcinoQR.Num_Chapeta}
                                        </p>


                                        <div className="p-3 bg-white d-inline-block rounded shadow-sm border">

                                            <QRCodeSVG

                                                value={`${window.location.origin}/perfil-cerda/${porcinoQR.Id_Porcino}`}

                                                size={200}

                                            />

                                        </div>


                                        <p className="text-muted mt-3 small px-3">
                                            Escanea este código con tu celular para ver el historial reproductivo completo.
                                        </p>

                                    </>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </>

    )
}

export default CrudPorcinos