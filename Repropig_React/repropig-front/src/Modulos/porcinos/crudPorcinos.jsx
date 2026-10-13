import { useState, useEffect } from "react"
import apiAxios from "../../api/axiosConfig.js"
import DataTable from 'react-data-table-component'
import PorcinoForm from "./porcinoForm.jsx"
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { QRCodeSVG } from 'qrcode.react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { customTableStyles } from "../../styles/tableStyles.js"

const CrudPorcinos = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const [porcinos, setPorcinos] = useState([])
    const [loadingId, setLoadingId] = useState(null);

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

    // Función para alternar el estado del porcino
    const toggleEstado = async (id) => {
        setLoadingId(id);

        try {
            const res = await apiAxios.put(`/porcino/${id}/toggle-estado`);

            setPorcinos(prev =>
                prev.map(p =>
                    p.Id_Porcino === id
                        ? { ...p, Estado: res.data.Estado }
                        : p
                )
            );

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    const [porcinoEdit, setPorcinoEdit] = useState(null)
    const [porcinoQR, setPorcinoQR] = useState(null)
    const [filterText, setFilterText] = useState('')
    const [filterTipo, setFilterTipo] = useState('Todos')
    const [createTipo, setCreateTipo] = useState('Todos')
    const [filterPartoId, setFilterPartoId] = useState(null)
    const [partosMap, setPartosMap] = useState({})

    const columnsTable = [
        { name: 'Nombre', selector: row => row.Nom_Porcino, },
        { name: 'Chapeta', selector: row => row.Num_Chapeta, },
        { name: 'Placa Sena', selector: row => row.Plac_Sena_Porcino, },
        { name: 'Raza', selector: row => row.raza?.Nom_Raza || '—', sortable: false, },
        {
            name: 'Sexo', selector: row => {
                const sexo = row.Gen_Porcino?.trim().toLowerCase()
                if (sexo === 'm') {
                    return (<span className="fw-normal"> <i className="fa-solid fa-mars text-primary me-1"></i> Macho </span>)
                }

                if (sexo === 'h') {
                    return (<span className="fw-normal"> <i className="fa-solid fa-venus text-danger me-1"></i> Hembra </span>)
                }
                return 'N/A'
            }
        },
        { name: 'Tipo', selector: row => row.Tipo_Cerdo, },

        { name: 'Procedencia', selector: row => (<span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${row.Proc_Porcino?.trim().toLowerCase() === 'interno' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'}`} > {row.Proc_Porcino} </span>), },
        { name: 'Lugar Proc.', selector: row => row.Lug_Proc_Porcino, },
        { name: 'Fecha Nac.', selector: row => row.Fec_Nac_Porcino, },
        { name: 'Fecha Lleg', selector: row => row.Fec_Llegada, },
        {
            name: 'Peso Lleg (kg)', selector: row => {
                const peso = row.Peso_Llegada
                if (!peso) return 'No aplica'
                let tailwind = ''
                let icono = ''
                if (peso < 1) {
                    tailwind = 'bg-red-50 text-red-700 ring-red-600/20'
                    icono = '⚠'
                } else if (peso < 2) {
                    tailwind = 'bg-red-50 text-red-700 ring-red-600/20'
                    icono = '!'
                } else {
                    tailwind = 'bg-green-50 text-green-700 ring-green-600/20'
                    icono = '✓'
                }
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${tailwind}`}> {icono} {peso} kg </span>)
            }
        },

        {
            name: 'Edad Llegada',
            selector: row => {
                const edad = calcularEdadLlegada(row.Fec_Nac_Porcino, row.Fec_Llegada)
                return edad !== null ? `${edad} meses` : 'N/A'
            }
        },
        {
            name: 'Edad Actual', selector: row => {
                const edad = calcularEdadActual(row.Fec_Nac_Porcino)
                return `${edad} meses`
            },
        },
        {
            name: 'Rendimiento',
            selector: row => {
                const isHembra = row.Gen_Porcino?.trim().toLowerCase() === 'h'
                if (!isHembra) return <span className="text-gray-400 text-xs">—</span>
                
                const infoPartos = partosMap[row.Id_Porcino]
                if (!infoPartos || infoPartos.totalPartos === 0) {
                    return <span className="text-gray-400 text-xs">Sin partos</span>
                }

                const promedio = Number((infoPartos.totalNacidos / infoPartos.totalPartos).toFixed(1))
                if (promedio < 14) {
                    return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20" title={`Promedio de ${promedio} lechones por parto (< 14)`}>
                            ⚠️ Mala ({promedio})
                        </span>
                    )
                }
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20" title={`Promedio de ${promedio} lechones por parto (≥ 14)`}>
                        ⭐ Excelente ({promedio})
                    </span>
                )
            }
        },
        {
            name: 'Estado',
            selector: row => (
                <button
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset transition-colors ${row.Estado === 'Activo' ? 'bg-green-50 text-green-700 ring-green-600/20 hover:bg-green-100' : 'bg-red-50 text-red-700 ring-red-600/20 hover:bg-red-100'}`}
                    onClick={() => toggleEstado(row.Id_Porcino)}
                    disabled={loadingId === row.Id_Porcino}
                >
                    {loadingId === row.Id_Porcino
                        ? '...'
                        : row.Estado}
                </button>
            )
        },
        {
            name: 'Acciones', cell: row => (
                <div className="flex gap-2 items-center justify-end w-full">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" onClick={() => handleEdit(row)} title="Editar">
                        <i className="fa-solid fa-pencil text-xs"></i>
                    </button>
                    {row.Gen_Porcino?.trim().toLowerCase() === 'h' && (
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors" onClick={() => handleShowQR(row)} title="Ver QR de Cerda">
                            <i className="fa-solid fa-qrcode text-xs"></i>
                        </button>
                    )}
                    {row.Gen_Porcino?.trim().toLowerCase() === 'h' && (
                        <Link to={`/perfil-cerda/${row.Id_Porcino}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Perfil Completo">
                            <i className="fa-solid fa-eye text-xs"></i>
                        </Link>
                    )}
                </div>
            ),
            width: '150px'
        }
    ]


    // =========================================================
    // CARGAR DATOS AL INICIAR
    // =========================================================


    useEffect(() => {
        getAllPorcinos()
    }, [])

    useEffect(() => {
        if (location.state?.filterPartoId) {
            setFilterPartoId(location.state.filterPartoId)
            setFilterTipo('Lechon')
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.state])

    const getAllPorcinos = async () => {
        try {
            const [resPorcinos, resPartos] = await Promise.all([
                apiAxios.get('/porcino/'),
                apiAxios.get('/partos/').catch(() => ({ data: [] }))
            ])
            setPorcinos(resPorcinos.data)

            const map = {}
            resPartos.data.forEach(p => {
                const idCerda = p.Id_Porcino
                if (!map[idCerda]) map[idCerda] = { totalPartos: 0, totalNacidos: 0 }
                map[idCerda].totalPartos += 1
                const nacidosParto = (p.Nac_vivos || 0) + (p.Nac_muertos || 0) + (p.Nac_momias || 0)
                map[idCerda].totalNacidos += nacidosParto
            })
            setPartosMap(map)
        } catch (err) {
            console.error("Error al cargar porcinos o partos:", err)
        }
    }

    const newListPorcinos = porcinos.filter(porcino => {

        const textToSearch = filterText.toLowerCase()

        const chapeta = porcino.Num_Chapeta?.toString().toLowerCase() || ''
        const nombre = porcino.Nom_Porcino?.toLowerCase() || ''
        const placa = porcino.Plac_Sena_Porcino?.toString().toLowerCase() || ''
        const procedencia = porcino.Proc_Porcino?.toLowerCase() || ''
        const sexoBase = porcino.Gen_Porcino?.trim().toLowerCase() || ''
        let sexo = ''
        if (sexoBase === 'm') sexo = 'macho'
        else if (sexoBase === 'h') sexo = 'hembra'
        else sexo = sexoBase

        const pasaTexto = (
            chapeta.includes(textToSearch) ||
            nombre.includes(textToSearch) ||
            placa.includes(textToSearch) ||
            procedencia.includes(textToSearch) ||
            sexo.includes(textToSearch)
        )

        const tipoPorcino = (porcino.Tipo_Cerdo || 'Adulto').trim().toLowerCase()
        const pasaTipo =
            filterTipo === 'Todos' ||
            tipoPorcino === filterTipo.toLowerCase()

        const pasaParto = filterPartoId ? Number(porcino.Id_parto) === Number(filterPartoId) : true

        return pasaTexto && pasaTipo && pasaParto
    })

    const hideModal = () => {
        setPorcinoEdit(null)
        document.getElementById('closeModal').click()
    }

    const handleEdit = (porcino) => {
        setPorcinoEdit(porcino)

        const modal = new bootstrap.Modal(document.getElementById('exampleModal'))
        modal.show()
    }

    const handleShowQR = (porcino) => {
        setPorcinoQR(porcino)
        const modal = new bootstrap.Modal(document.getElementById('qrModal'))
        modal.show()
    }

    const downloadQR = (conFicha = true) => {
        if (!porcinoQR) return
        const svgElement = document.getElementById('porcinoQrSvg')
        if (!svgElement) return

        const svgXml = new XMLSerializer().serializeToString(svgElement)
        const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' })
        const URL = window.URL || window.webkitURL || window
        const blobURL = URL.createObjectURL(svgBlob)

        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const cleanName = (porcinoQR.Nom_Porcino || 'porcino').replace(/\s+/g, '_')
            const chapeta = porcinoQR.Num_Chapeta || ''

            if (conFicha) {
                // Tarjeta imprimible de alta resolución (600x750)
                const width = 600
                const height = 750
                canvas.width = width
                canvas.height = height

                // Fondo blanco
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, width, height)

                // Marco decorativo
                ctx.strokeStyle = '#f1f5f9'
                ctx.lineWidth = 12
                ctx.strokeRect(20, 20, width - 40, height - 40)

                // Cabecera institucional
                ctx.fillStyle = '#e11d48'
                ctx.font = 'bold 24px sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText('REPROPIG · IDENTIFICACIÓN', width / 2, 75)

                // Nombre del porcino
                ctx.fillStyle = '#0f172a'
                ctx.font = 'bold 34px sans-serif'
                ctx.fillText(porcinoQR.Nom_Porcino || 'Porcino', width / 2, 130)

                // Chapeta
                ctx.fillStyle = '#475569'
                ctx.font = '600 22px sans-serif'
                ctx.fillText(`Chapeta: ${chapeta || '—'}`, width / 2, 170)

                // Código QR (390x390)
                const qrSize = 390
                ctx.drawImage(img, (width - qrSize) / 2, 205, qrSize, qrSize)

                // Pie de página
                ctx.fillStyle = '#64748b'
                ctx.font = '16px sans-serif'
                ctx.fillText('Escanea para ver historial reproductivo completo', width / 2, 645)

                ctx.fillStyle = '#94a3b8'
                ctx.font = '14px monospace'
                ctx.fillText(window.location.origin, width / 2, 680)

                const pngUrl = canvas.toDataURL('image/png')
                const downloadLink = document.createElement('a')
                downloadLink.href = pngUrl
                downloadLink.download = `Ficha_QR_${cleanName}_${chapeta}.png`
                document.body.appendChild(downloadLink)
                downloadLink.click()
                document.body.removeChild(downloadLink)
            } else {
                // Solo el código QR nítido (500x500)
                const qrSize = 500
                canvas.width = qrSize
                canvas.height = qrSize
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, qrSize, qrSize)
                ctx.drawImage(img, 20, 20, qrSize - 40, qrSize - 40)

                const pngUrl = canvas.toDataURL('image/png')
                const downloadLink = document.createElement('a')
                downloadLink.href = pngUrl
                downloadLink.download = `QR_${cleanName}_${chapeta}.png`
                document.body.appendChild(downloadLink)
                downloadLink.click()
                document.body.removeChild(downloadLink)
            }

            URL.revokeObjectURL(blobURL)
        }
        img.src = blobURL
    }

    return (
        <>

            <div className="container mt-5">

                <div className="row d-flex mb-3 justify-content-between align-items-center g-2">
                    {/* Row 1: Search + Type filters + Register button */}
                    <div className="col-md-5 col-12">
                        <div className="input-group">
                            <input className="form-control" value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder="🔍 Buscar un nombre, chapeta, placa o procedencia..." />
                        </div>
                    </div>

                    <div className="col-auto">
                        <div className="btn-group" role="group" aria-label="Filtrar por tipo">
                            {['Todos', 'Adulto', 'Lechon'].map(tipo => (
                                <button
                                    key={tipo}
                                    type="button"
                                    className={`btn ${filterTipo === tipo
                                        ? 'btn-dark'
                                        : 'btn-outline-dark'
                                        }`}
                                    onClick={() => { setFilterTipo(tipo); setFilterPartoId(null); }}
                                >
                                    {tipo === 'Todos' ? '🐷 Todos' : tipo === 'Adulto' ? '🐗 Adultos' : '🐽 Lechones'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-auto ms-auto">
                        {filterTipo === 'Adulto' && (
                            <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => { setPorcinoEdit(null); setCreateTipo('Adulto'); }}>
                                🐗 + Registrar Adulto
                            </button>
                        )}
                        {filterTipo === 'Lechon' && (
                            <button type="button" className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => { setPorcinoEdit(null); setCreateTipo('Lechon'); }}>
                                🐽 + Registrar Lechón
                            </button>
                        )}
                        {filterTipo === 'Todos' && (
                            <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => { setPorcinoEdit(null); setCreateTipo('Todos'); }}>
                                🐷 + Registrar Porcino
                            </button>
                        )}
                    </div>

                    {/* Row 2: Parto filter banner (only when active) */}
                    {filterPartoId && (
                        <div className="col-12 mt-1">
                            <div className="alert alert-info py-2 px-3 m-0 d-flex justify-content-between align-items-center w-100 shadow-sm rounded-3">
                                <span>🔍 Filtrando por lechones del <b>Parto #{filterPartoId}</b></span>
                                <button 
                                    className="btn btn-sm btn-outline-danger" 
                                    onClick={() => { setFilterPartoId(null); setFilterTipo('Todos'); }}
                                >
                                    Quitar Filtro
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <DataTable
                    title={<h4 className="fw-bold text-gray-800 m-0 py-2">Porcinos</h4>}
                    columns={columnsTable}
                    data={newListPorcinos}
                    keyField="Id_Porcino"
                    pagination
                    highlightOnHover
                    pointerOnHover
                    striped
                    customStyles={customTableStyles}
                />


                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">{porcinoEdit ? "Editar Porcino" : "Agregar Porcino"}</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModal"></button>
                            </div>
                            <div className="modal-body">
                                <PorcinoForm key={porcinoEdit ? porcinoEdit.Id_Porcino : `new_${createTipo}`} hideModal={hideModal} porcinoEdit={porcinoEdit} reload={getAllPorcinos} initialTipo={createTipo} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal para Código QR */}
                <div className="modal fade" id="qrModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '370px' }}>
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className="modal-header border-0 pb-0 pt-3 px-4">
                                <h6 className="modal-title fw-bold text-secondary mb-0">Código QR del Animal</h6>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body text-center pt-2 pb-4 px-4">
                                {porcinoQR && (
                                    <>
                                        <h4 className="mb-0 text-danger fw-bold">{porcinoQR.Nom_Porcino}</h4>
                                        <p className="text-muted small mb-3">Chapeta: <span className="fw-semibold text-dark">{porcinoQR.Num_Chapeta || '—'}</span></p>
                                        
                                        <div className="p-3 bg-white d-inline-block rounded-3 shadow-sm border mb-3">
                                            <QRCodeSVG
                                                id="porcinoQrSvg"
                                                value={`${window.location.origin}/perfil-cerda/${porcinoQR.Id_Porcino}`}
                                                size={220}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        </div>

                                        <p className="text-muted small px-2 mb-3">
                                            Escanea con tu celular o descarga el código QR para imprimir e identificar la paridera o corral.
                                        </p>

                                        <div className="d-grid gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold shadow-sm"
                                                onClick={() => downloadQR(true)}
                                            >
                                                <i className="fa-solid fa-download"></i> Descargar Ficha QR (PNG)
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-2"
                                                onClick={() => downloadQR(false)}
                                            >
                                                <i className="fa-regular fa-image"></i> Descargar solo código QR
                                            </button>
                                        </div>
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