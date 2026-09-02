import apiAxios from "../../api/axiosConfig.js";

import { useState, useEffect } from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import DataTable from "react-data-table-component";

import Seguimiento_CerdaForm
    from "./Seguimiento_CerdaForm.jsx";

import * as bootstrap
    from "bootstrap/dist/js/bootstrap.bundle.min.js";

import Swal from "sweetalert2";

import WithReactContent
    from "sweetalert2-react-content";


const CrudSeguimiento_Cerda = () => {

    // ==========================================
    // ESTADOS
    // ==========================================

    const [
        Seguimiento_Cerda,
        setSeguimiento_Cerda
    ] = useState([]);

    const [
        Seguimiento_CerdaEdit,
        setSeguimiento_CerdaEdit
    ] = useState(null);

    const [
        filterText,
        setFilterText
    ] = useState("");

    const [
        modalKey,
        setModalKey
    ] = useState(0);


    const {
        id: partoIdParams
    } = useParams();

    const navigate = useNavigate();

    const MySwal =
        WithReactContent(Swal);


    // ==========================================
    // OBTENER TODOS
    // ==========================================

    const getAllSeguimiento_Cerda =
        async () => {

            try {

                const response =
                    await apiAxios.get(
                        "/Seguimiento_Cerda"
                    );

                console.log(
                    "Seguimientos:",
                    response.data
                );

                setSeguimiento_Cerda(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

            } catch (error) {

                console.error(
                    "Error cargando Seguimiento_Cerda:",
                    error.response?.data ||
                    error.message
                );

                setSeguimiento_Cerda([]);

                MySwal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        error.response?.data?.message ||
                        "No se pudieron cargar los seguimientos."
                });
            }
        };


    // ==========================================
    // CARGAR AL INICIAR
    // ==========================================

    useEffect(() => {

        getAllSeguimiento_Cerda();

    }, []);


    // ==========================================
    // CAMBIAR ESTADO
    // ==========================================

    const toggleEstado = async (row) => {

        const esActivo =
            row.Estado === "Activo" ||
            row.Estado === "A" ||
            !row.Estado;

        const accion =
            esActivo
                ? "inactivar"
                : "activar";


        const result =
            await MySwal.fire({

                title:
                    `¿Deseas ${accion} este seguimiento de cerda?`,

                text:
                    `El seguimiento #${row.Id_Seguimiento_Cerda} pasará a estar ${
                        esActivo
                            ? "Inactivo"
                            : "Activo"
                    }.`,

                icon: "question",

                showCancelButton: true,

                confirmButtonColor:
                    esActivo
                        ? "#d33"
                        : "#198754",

                cancelButtonColor:
                    "#6c757d",

                confirmButtonText:
                    `Sí, ${accion}`,

                cancelButtonText:
                    "Cancelar"
            });


        if (!result.isConfirmed) {
            return;
        }


        try {

            await apiAxios.put(
                `/Seguimiento_Cerda/${row.Id_Seguimiento_Cerda}/toggle-estado`
            );


            await MySwal.fire({

                icon: "success",

                title:
                    "Estado actualizado",

                timer: 1500,

                showConfirmButton: false
            });


            getAllSeguimiento_Cerda();


        } catch (error) {

            console.error(
                "Error cambiando estado:",
                error.response?.data ||
                error.message
            );


            MySwal.fire({

                icon: "error",

                title: "Error",

                text:
                    error.response?.data?.message ||
                    "No se pudo cambiar el estado."
            });
        }
    };


    // ==========================================
    // EDITAR
    // ==========================================

    const handleEdit = (row) => {

        setSeguimiento_CerdaEdit(row);

        setModalKey(
            prev => prev + 1
        );


        const modalElement =
            document.getElementById(
                "exampleModal"
            );


        if (modalElement) {

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.show();
        }
    };


    // ==========================================
    // NUEVO
    // ==========================================

    const handleNuevo = () => {

        setSeguimiento_CerdaEdit(null);

        setModalKey(
            prev => prev + 1
        );


        setTimeout(() => {

            const modalElement =
                document.getElementById(
                    "exampleModal"
                );


            if (modalElement) {

                const modal =
                    bootstrap.Modal.getOrCreateInstance(
                        modalElement
                    );

                modal.show();
            }

        }, 0);
    };


    // ==========================================
    // CERRAR MODAL
    // ==========================================

    const hideModal = () => {

        setSeguimiento_CerdaEdit(null);

        setModalKey(
            prev => prev + 1
        );


        const modalElement =
            document.getElementById(
                "exampleModal"
            );


        if (modalElement) {

            const modal =
                bootstrap.Modal.getInstance(
                    modalElement
                );

            if (modal) {
                modal.hide();
            }
        }
    };


    // ==========================================
    // FILTRO
    // ==========================================

    const newListSeguimiento_Cerda =
        Seguimiento_Cerda.filter(row => {

            const textToSearch =
                filterText
                    .toLowerCase()
                    .trim();


            const Id =
                String(
                    row?.Id_Seguimiento_Cerda || ""
                ).toLowerCase();


            const Fecha =
                String(
                    row?.Fecha || ""
                ).toLowerCase();


            const Hora =
                String(
                    row?.Hora || ""
                ).toLowerCase();


            const Observaciones =
                String(
                    row?.Observaciones || ""
                ).toLowerCase();


            const Estado =
                String(
                    row?.Estado || ""
                ).toLowerCase();


            const IdPorcino =
                String(
                    row?.Id_Porcino || ""
                ).toLowerCase();


            const IdCiclo =
                String(
                    row?.Id_Ciclo || ""
                ).toLowerCase();


            return (

                Id.includes(textToSearch) ||

                Fecha.includes(textToSearch) ||

                Hora.includes(textToSearch) ||

                Observaciones.includes(textToSearch) ||

                Estado.includes(textToSearch) ||

                IdPorcino.includes(textToSearch) ||

                IdCiclo.includes(textToSearch)
            );
        });


    // ==========================================
    // COLUMNAS
    // ==========================================

    const columnsTable = [

        {
            name: "Id",

            selector:
                row =>
                    row.Id_Seguimiento_Cerda,

            width: "80px"
        },


        {
            name: "Fecha",

            selector:
                row =>
                    row.Fecha || "—",

            sortable: true
        },


        {
            name: "Hora",

            selector:
                row =>
                    row.Hora || "—"
        },


        {
            name: "Cerda",

            selector:
                row =>
                    row.Id_Porcino || "—"
        },


        {
            name: "Id Ciclo",

            selector:
                row =>
                    row.Id_Ciclo || "—"
        },


        {
            name: "Responsable",

            selector:
                row =>
                    row.Id_Responsable || "—"
        },


        {
            name: "Medicamento",

            selector:
                row =>
                    row.Id_Medicamento || "—"
        },


        {
            name: "Observaciones",

            selector:
                row =>
                    row.Observaciones || "—",

            wrap: true
        },


        // ======================================
        // ESTADO
        // ======================================

        {
            name: "Estado",

            cell: row => {

                const esActivo =
                    row.Estado === "Activo" ||
                    row.Estado === "A" ||
                    !row.Estado;


                return (

                    <button

                        className={
                            `badge border-0 ${
                                esActivo
                                    ? "bg-success"
                                    : "bg-danger"
                            }`
                        }

                        onClick={() =>
                            toggleEstado(row)
                        }

                        style={{
                            cursor: "pointer"
                        }}

                    >

                        {
                            esActivo
                                ? "Activo"
                                : "Inactivo"
                        }

                    </button>
                );
            },

            width: "110px"
        },


        // ======================================
        // ACCIONES
        // ======================================

        {
            name: "Acciones",

            cell: row => (

                <div className="d-flex gap-1">

                    <button

                        className="btn btn-sm btn-info"

                        onClick={() =>
                            handleEdit(row)
                        }

                        title="Editar"

                    >

                        <i className="fa-solid fa-pencil"></i>

                    </button>


                    <button

                        className={
                            `btn btn-sm ${
                                row.Estado === "Inactivo" ||
                                row.Estado === "I"
                                    ? "btn-success"
                                    : "btn-warning"
                            }`
                        }

                        onClick={() =>
                            toggleEstado(row)
                        }

                        title={
                            row.Estado === "Inactivo" ||
                            row.Estado === "I"
                                ? "Activar"
                                : "Inactivar"
                        }

                    >

                        <i
                            className={
                                `fa-solid ${
                                    row.Estado === "Inactivo" ||
                                    row.Estado === "I"
                                        ? "fa-check"
                                        : "fa-ban"
                                }`
                            }
                        ></i>

                    </button>

                </div>
            ),

            width: "130px"
        }
    ];


    // ==========================================
    // RETURN
    // ==========================================

    return (

        <>

            <div className="container mt-5">


                {/* ==============================
                    CABECERA
                ============================== */}

                <div
                    className="
                        row
                        d-flex
                        mb-3
                        justify-content-between
                        align-items-center
                    "
                >


                    <div className="col-md-7 d-flex gap-2">


                        {partoIdParams && (

                            <button

                                className="btn btn-secondary"

                                onClick={() =>
                                    navigate("/partos")
                                }

                                title="Volver a Partos"

                            >

                                <i className="fa-solid fa-arrow-left"></i>

                            </button>

                        )}


                        <div className="input-group">

                            <span className="input-group-text">

                                🔍

                            </span>


                            <input

                                type="text"

                                className="form-control"

                                value={filterText}

                                onChange={
                                    e =>
                                        setFilterText(
                                            e.target.value
                                        )
                                }

                                placeholder="
                                    Buscar por ID, fecha,
                                    hora, observaciones...
                                "

                            />

                        </div>

                    </div>


                    <div className="col-md-3 text-end">


                        <button

                            type="button"

                            className="btn btn-success"

                            onClick={handleNuevo}

                        >

                            + Registrar seguimiento

                        </button>


                    </div>

                </div>


                {/* ==============================
                    TABLA
                ============================== */}

                <DataTable

                    title={
                        partoIdParams
                            ? `Seguimiento Cerda - Parto #${partoIdParams}`
                            : "Seguimiento Cerda"
                    }

                    columns={columnsTable}

                    data={
                        newListSeguimiento_Cerda
                    }

                    keyField={
                        "Id_Seguimiento_Cerda"
                    }

                    pagination

                    highlightOnHover

                    pointerOnHover

                    striped

                    responsive

                    noDataComponent={
                        "No hay seguimientos registrados"
                    }

                />


                {/* ==============================
                    MODAL
                ============================== */}

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

                                    {
                                        Seguimiento_CerdaEdit
                                            ? "Editar Seguimiento"
                                            : "Agregar Seguimiento"
                                    }

                                </h1>


                                <button

                                    type="button"

                                    className="btn-close"

                                    onClick={hideModal}

                                    aria-label="Close"

                                ></button>

                            </div>


                            <div className="modal-body">

                                <Seguimiento_CerdaForm

                                    key={modalKey}

                                    hideModal={
                                        hideModal
                                    }

                                    Seguimiento_CerdaEdit={
                                        Seguimiento_CerdaEdit
                                    }

                                    reload={
                                        getAllSeguimiento_Cerda
                                    }

                                    partoIdParams={
                                        partoIdParams
                                    }

                                />

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </>

    );
};


export default CrudSeguimiento_Cerda;