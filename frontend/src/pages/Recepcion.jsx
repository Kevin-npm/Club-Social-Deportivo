import { useState, useMemo, useEffect } from 'react';
import { Search, CalendarDays, Baby, CreditCard, AlertTriangle, Clock, X, Edit, Trash2, CheckCircle2, UserCheck, Loader2, CheckCircle, BellRing, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLudoteca } from '../context/LudotecaContext';

const ITEMS_PER_PAGE = 10;

const Recepcion = () => {
    const [tabActiva, setTabActiva] = useState('ludoteca');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [modalEditar, setModalEditar] = useState(false);
    const [reservaEditando, setReservaEditando] = useState(null);

    const [reservas, setReservas] = useState([
        { id: 'RES-001', socio: 'Adrián Pérez', espacio: 'Cancha de Futbol Rápido', fecha: '2026-04-02', horario: '18:00 - 19:00', estatus: 'Confirmada' },
        { id: 'RES-002', socio: 'Bryan Mendoza', espacio: 'Cancha Grande Super', fecha: '2026-04-02', horario: '19:00 - 20:30', estatus: 'Pendiente' },
        { id: 'RES-003', socio: 'Kevin Rosario', espacio: 'Cancha de Tenis 1', fecha: '2026-04-03', horario: '08:00 - 10:00', estatus: 'Confirmada' },
    ]);

    const catalogoInstalaciones = [
        "Cancha de Futbol Rápido", "Cancha Grande Super", "Cancha de Tenis 1",
        "Cancha de Tenis 2", "Cancha de Basquetbol", "Alberca Olímpica", "Gimnasio Principal"
    ];

    const confirmarReserva = (id) => setReservas(reservas.map(res => res.id === id ? { ...res, estatus: 'Confirmada' } : res));
    const eliminarReserva = (id) => { if (window.confirm(`¿Estás seguro de cancelar la reserva ${id}?`)) setReservas(reservas.filter(res => res.id !== id)); };
    const abrirModalEditar = (reserva) => { setReservaEditando({ ...reserva }); setModalEditar(true); };
    const guardarEdicion = (e) => {
        e.preventDefault();
        setReservas(reservas.map(res => res.id === reservaEditando.id ? reservaEditando : res));
        setModalEditar(false);
        alert(`✅ Reserva ${reservaEditando.id} actualizada con éxito.`);
    };

    const [modalLudoteca, setModalLudoteca] = useState(false);
    const [modalTiempo, setModalTiempo] = useState({ visible: false, id_socio: null });
    const [minutosManual, setMinutosManual] = useState('');

    const { ninosLudoteca, agregarNino, removerNino, ajustarTiempo, resetTiempo } = useLudoteca();

    const obtenerEstadoTiempo = (segundos) => {
        const minutosTotales = segundos / 60;
        let label, clase, linea;
        if (minutosTotales >= 120) {
            label = "TIEMPO EXCEDIDO";
            clase = "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse";
            linea = "bg-red-500 animate-pulse";
        } else if (minutosTotales >= 105) {
            label = "PRÓXIMO A VENCER";
            clase = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
            linea = "bg-yellow-400";
        } else {
            label = "CON TIEMPO";
            clase = "text-green-400 bg-green-500/10 border-green-500/20";
            linea = "bg-green-500";
        }
        return { label, clase, linea };
    };

    const darSalida = async (id_socio) => {
        if (window.confirm(`¿Confirmar salida oficial en el sistema para socio #${id_socio}?`)) {
            try {
                const res = await fetch('http://localhost:8000/api/ludoteca/salida', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ id_nino: id_socio })
                });
                const data = await res.json();

                if (res.status === 200 && data.status === 'success') {
                    removerNino(id_socio);
                    alert('✅ ' + data.message);
                } else {
                    alert('❌ Error: ' + (data.message || 'No se pudo registrar la salida.'));
                }
            } catch {
                alert('❌ Error crítico de conexión con el servidor.');
            }
        }
    };

    const aplicarTiempo = async (minutosExtra) => {
        const id_socio = modalTiempo.id_socio;
        if (!minutosExtra || isNaN(minutosExtra) || minutosExtra <= 0) return;

        if (window.confirm(`¿Añadir ${minutosExtra} minutos extra al tiempo del socio #${id_socio}?`)) {
            const ok = await ajustarTiempo(id_socio, minutosExtra);
            if (!ok) {
                alert('❌ Error al ajustar el tiempo en el servidor.');
                return;
            }
            setModalTiempo({ visible: false, id_socio: null });
            setMinutosManual('');
        }
    };

    const restablecerTiempo = async (id_socio) => {
        if (window.confirm(`¿Estás seguro de reiniciar el cronómetro a 00:00:00 para el socio #${id_socio}?`)) {
            const ok = await resetTiempo(id_socio);
            if (!ok) {
                alert('❌ Error al reiniciar el tiempo en el servidor.');
            }
        }
    };

    const [buscandoNino, setBuscandoNino] = useState(false); const [nombreNino, setNombreNino] = useState('');
    const [buscandoTutor, setBuscandoTutor] = useState(false); const [nombreTutor, setNombreTutor] = useState('');
    const simularBusqueda = (id, tipo) => {
        if (!id) { tipo === 'nino' ? setNombreNino('') : setNombreTutor(''); return; }
        tipo === 'nino' ? setBuscandoNino(true) : setBuscandoTutor(true);
        setTimeout(() => {
            let nombreEncontrado = `Socio #${id}`;
            if (id === '19') nombreEncontrado = 'Kali Rosario Berrospe';
            if (id === '18') nombreEncontrado = 'Kevin Manuel Rosario Berrospe';
            if (tipo === 'nino') { setNombreNino(nombreEncontrado); setBuscandoNino(false); }
            else { setNombreTutor(nombreEncontrado); setBuscandoTutor(false); }
        }, 800);
    };

    const [idVerificar, setIdVerificar] = useState('');
    const [resultadoMembresia, setResultadoMembresia] = useState(null);
    const [verificando, setVerificando] = useState(false);

    const verificarAcceso = async (e) => {
        e.preventDefault();
        if (!idVerificar) return;
        setVerificando(true);
        setResultadoMembresia(null);

        try {
            const res = await fetch(`http://localhost:8000/api/socios/${idVerificar}/verificar-acceso`);
            const data = await res.json();
            setResultadoMembresia(data);
        } catch {
            setResultadoMembresia({ status: 'error', message: 'Error al conectar con el servidor.' });
        }
        setVerificando(false);
    };

    const filteredReservas = useMemo(() => {
        if (!searchQuery) return reservas;
        const q = searchQuery.toLowerCase();
        return reservas.filter(r =>
            r.id.toLowerCase().includes(q) ||
            r.socio.toLowerCase().includes(q) ||
            r.espacio.toLowerCase().includes(q)
        );
    }, [reservas, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredReservas.length / ITEMS_PER_PAGE));
    const paginatedReservas = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredReservas.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredReservas, currentPage]);

    const statsReservas = {
        total: reservas.length,
        pendientes: reservas.filter(r => r.estatus === 'Pendiente').length,
        confirmadas: reservas.filter(r => r.estatus === 'Confirmada').length,
    };

    const filteredNinos = useMemo(() => {
        if (!searchQuery) return ninosLudoteca;
        const q = searchQuery.toLowerCase();
        return ninosLudoteca.filter(n =>
            n.nombre_nino.toLowerCase().includes(q) ||
            String(n.id_socio).includes(q)
        );
    }, [ninosLudoteca, searchQuery]);

    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    return (
        <div className="space-y-4 p-4 md:p-6 text-gray-200">
            {/* ENCABEZADO Y BUSCADOR */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                        <BellRing className="text-yellow-400" size={28} /> Control de Recepción
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">Gestión de accesos, ludoteca y reservaciones</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar socio..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-yellow-400 transition"
                    />
                </div>
            </div>

            {/* TABS */}
            <div className="flex flex-wrap gap-1.5 bg-[#14171c] p-1 rounded-xl border border-gray-800 w-full sm:w-max">
                <button onClick={() => setTabActiva('reservas')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${tabActiva === 'reservas' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                    <CalendarDays size={16} /> Reservaciones
                </button>
                <button onClick={() => setTabActiva('ludoteca')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${tabActiva === 'ludoteca' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                    <Baby size={16} /> Ludoteca Live
                </button>
                <button onClick={() => setTabActiva('membresias')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${tabActiva === 'membresias' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                    <CreditCard size={16} /> Estatus Socios
                </button>
            </div>

            {/* --- PESTAÑA 1: RESERVAS --- */}
            {tabActiva === 'reservas' && (
                <div className="animate-in fade-in duration-300 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800">
                            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase">Total</p>
                            <p className="text-lg md:text-xl font-bold">{statsReservas.total}</p>
                        </div>
                        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800">
                            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase">Pendientes</p>
                            <p className="text-lg md:text-xl font-bold text-yellow-400">{statsReservas.pendientes}</p>
                        </div>
                        <div className="bg-[#14171c] p-3 md:p-4 rounded-xl border border-gray-800">
                            <p className="text-gray-500 text-[10px] md:text-xs font-medium uppercase">Confirmadas</p>
                            <p className="text-lg md:text-xl font-bold text-green-400">{statsReservas.confirmadas}</p>
                        </div>
                    </div>

                    <div className="bg-[#14171c] rounded-xl border border-gray-800 overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-gray-800">
                            <h2 className="text-base md:text-lg font-bold">Reservaciones de Hoy</h2>
                        </div>

                        {paginatedReservas.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">No se encontraron reservaciones.</div>
                        ) : (
                            <>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                                                <th className="px-4 py-3 font-medium">ID Reserva</th>
                                                <th className="px-4 py-3 font-medium">Socio</th>
                                                <th className="px-4 py-3 font-medium">Instalación</th>
                                                <th className="px-4 py-3 font-medium">Fecha</th>
                                                <th className="px-4 py-3 font-medium">Horario</th>
                                                <th className="px-4 py-3 font-medium">Estatus</th>
                                                <th className="px-4 py-3 font-medium text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {paginatedReservas.map((reserva, idx) => (
                                                <tr key={reserva.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'} hover:bg-gray-800/30`}>
                                                    <td className="px-4 py-3 font-medium text-sm text-white">{reserva.id}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-400">{reserva.socio}</td>
                                                    <td className="px-4 py-3 text-sm text-yellow-400">{reserva.espacio}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-400">{reserva.fecha}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-400">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={13} className="text-gray-500" />
                                                            {reserva.horario}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                                            reserva.estatus === 'Confirmada' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                            reserva.estatus === 'Denegada' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                        }`}>{reserva.estatus}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center gap-2">
                                                            {reserva.estatus === 'Pendiente' && (
                                                                <button onClick={() => confirmarReserva(reserva.id)} className="p-1.5 hover:bg-gray-700 rounded-full text-green-400 transition" title="Confirmar">
                                                                    <CheckCircle2 size={15} />
                                                                </button>
                                                            )}
                                                            <button onClick={() => abrirModalEditar(reserva)} className="p-1.5 hover:bg-gray-700 rounded-full text-blue-400 transition" title="Editar">
                                                                <Edit size={15} />
                                                            </button>
                                                            <button onClick={() => eliminarReserva(reserva.id)} className="p-1.5 hover:bg-gray-700 rounded-full text-red-400 transition" title="Cancelar">
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="md:hidden divide-y divide-gray-800">
                                    {paginatedReservas.map((reserva) => (
                                        <div key={reserva.id} className="p-4 space-y-2 hover:bg-gray-800/20 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-sm text-white">{reserva.id}</h3>
                                                    <p className="text-xs text-gray-400">{reserva.socio}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                                    reserva.estatus === 'Confirmada' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    reserva.estatus === 'Denegada' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>{reserva.estatus}</span>
                                            </div>
                                            <p className="text-xs text-yellow-400">{reserva.espacio}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <CalendarDays size={12} />
                                                    {reserva.fecha}
                                                    <Clock size={12} />
                                                    {reserva.horario}
                                                </div>
                                                <div className="flex gap-1">
                                                    {reserva.estatus === 'Pendiente' && (
                                                        <button onClick={() => confirmarReserva(reserva.id)} className="p-1.5 hover:bg-gray-700 rounded-full text-green-400 transition" title="Confirmar">
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => abrirModalEditar(reserva)} className="p-1.5 hover:bg-gray-700 rounded-full text-blue-400 transition" title="Editar">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button onClick={() => eliminarReserva(reserva.id)} className="p-1.5 hover:bg-gray-700 rounded-full text-red-400 transition" title="Cancelar">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-gray-800">
                                        <p className="text-xs text-gray-500">
                                            {filteredReservas.length} reservaciones — Pág. {currentPage} de {totalPages}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                                                        page === currentPage
                                                            ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
                                                            : 'text-gray-500 hover:bg-gray-800 hover:text-white'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* --- PESTAÑA 2: LUDOTECA --- */}
            {tabActiva === 'ludoteca' && (
                <div className="animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                            Niños en Ludoteca <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-lg font-extrabold">{ninosLudoteca.length}</span>
                        </h2>
                        <button onClick={() => setModalLudoteca(true)} className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 w-max shadow-lg shadow-yellow-400/20">
                            + Registrar Ingreso
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredNinos.length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-10 text-sm">
                                {searchQuery ? 'No se encontraron niños.' : 'No hay niños registrados en este momento.'}
                            </p>
                        ) : (
                            filteredNinos.map((nino) => {
                                const { label, clase, linea } = obtenerEstadoTiempo(nino.segundos_transcurridos || 0);
                                return (
                                    <div key={nino.id_socio} className="bg-[#1a1d23] border border-gray-800 rounded-xl p-3 md:p-4 relative overflow-hidden group hover:border-gray-600 transition-colors flex flex-col justify-between">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${linea}`}></div>

                                        <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-sm md:text-base text-white truncate">#{nino.id_socio} - {nino.nombre_nino}</h3>
                                                <p className="text-[11px] text-gray-400 truncate">Tutor: {nino.tutor}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between my-2 gap-2">
                                            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border ${clase}`}>
                                                {label}
                                            </span>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] text-gray-500">Límite: 2h</p>
                                                <p className="text-[10px] text-gray-600">{Math.floor((nino.segundos_transcurridos || 0) / 3600)}h {Math.floor(((nino.segundos_transcurridos || 0) % 3600) / 60)}m</p>
                                            </div>
                                        </div>

                                        <div className="mt-2 pt-3 border-t border-gray-800 flex justify-between items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => setModalTiempo({ visible: true, id_socio: nino.id_socio })} className="text-[10px] md:text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-2 py-1.5 rounded border border-blue-500/20 transition-all">⏱️ Añadir</button>
                                                <button onClick={() => restablecerTiempo(nino.id_socio)} className="text-[10px] md:text-xs font-bold bg-gray-700/50 text-gray-300 hover:bg-gray-700 px-2 py-1.5 rounded border border-gray-600 transition-all">🔄 Reset</button>
                                            </div>
                                            <button onClick={() => darSalida(nino.id_socio)} className="text-[10px] md:text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 py-1.5 rounded border border-red-500/20 transition-all uppercase tracking-wider">
                                                Dar Salida
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* --- PESTAÑA 3: MEMBRESÍAS --- */}
            {tabActiva === 'membresias' && (
                <div className="animate-in fade-in duration-300">
                    <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 mb-4">
                        <CreditCard className="text-yellow-400" size={20} /> Verificación de Accesos
                    </h2>
                    <div className="bg-[#14171c] border border-gray-800 rounded-xl p-4 md:p-5">
                        <form onSubmit={verificarAcceso} className="flex flex-col sm:flex-row gap-3 mb-4">
                            <input type="number" placeholder="Ingrese ID del Socio..." required value={idVerificar} onChange={(e) => setIdVerificar(e.target.value)} className="w-full sm:flex-1 bg-[#0f1115] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-400 outline-none text-sm" />
                            <button type="submit" disabled={verificando} className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm w-full sm:w-max">
                                {verificando ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} Verificar
                            </button>
                        </form>
                        {resultadoMembresia ? (
                            <div className={`p-5 rounded-xl border-2 flex items-start gap-4 transition-all ${
                                resultadoMembresia.status === 'success' ? 'bg-green-500/10 border-green-500/30' :
                                resultadoMembresia.status === 'warning' ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800/50 border-gray-700'
                            }`}>
                                {resultadoMembresia.status === 'success' ? <CheckCircle className="text-green-400 mt-1 shrink-0" size={28} /> : <AlertTriangle className={resultadoMembresia.status === 'warning' ? "text-red-400 mt-1 shrink-0" : "text-gray-400 mt-1 shrink-0"} size={28} />}
                                <div className="w-full">
                                    <h3 className={`text-lg md:text-xl font-bold mb-2 pb-2 border-b ${
                                        resultadoMembresia.status === 'success' ? 'text-green-400 border-green-500/20' :
                                        resultadoMembresia.status === 'warning' ? 'text-red-400 border-red-500/20' : 'text-gray-300 border-gray-700'
                                    }`}>
                                        {resultadoMembresia.message}
                                    </h3>
                                    {resultadoMembresia.socio && (
                                        <div className="space-y-2 mt-3 text-gray-300 text-sm">
                                            <p className="flex justify-between"><span className="text-gray-500 font-bold uppercase text-xs">Socio Titular:</span> <span className="font-medium text-white">{resultadoMembresia.socio}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500 font-bold uppercase text-xs">Membresía:</span> <span className="text-yellow-400 font-medium">{resultadoMembresia.tipo_membresia}</span></p>
                                            <p className="flex justify-between items-center">
                                                <span className="text-gray-500 font-bold uppercase text-xs">Estatus Financiero:</span>
                                                <span className={`px-3 py-0.5 rounded-lg text-xs font-extrabold ${
                                                    resultadoMembresia.estatus === 'Vigente' ? 'bg-green-500 text-black' : 'bg-red-500 text-white animate-pulse'
                                                }`}>{resultadoMembresia.estatus}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-xl">
                                <CreditCard className="mx-auto mb-3 text-gray-600" size={36} />
                                <p className="text-gray-500 text-sm">Ingrese un ID de socio para verificar su estatus.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* MODALES FLOTANTES */}
            {/* ========================================== */}

            {/* MODAL 1: EDITAR RESERVA */}
            {modalEditar && reservaEditando && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-[#1c1f26] border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Edit className="text-yellow-400" /> Modificar Reserva</h2>
                            <button onClick={() => setModalEditar(false)} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <form className="space-y-4" onSubmit={guardarEdicion}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ID Reserva</label>
                                    <input type="text" disabled value={reservaEditando.id} className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-gray-500 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Estatus</label>
                                    <select
                                        value={reservaEditando.estatus}
                                        onChange={(e) => setReservaEditando({ ...reservaEditando, estatus: e.target.value })}
                                        className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Confirmada">Confirmada</option>
                                        <option value="Denegada">Denegada</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Instalación</label>
                                <select
                                    value={reservaEditando.espacio}
                                    onChange={(e) => setReservaEditando({ ...reservaEditando, espacio: e.target.value })}
                                    className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                                >
                                    {catalogoInstalaciones.map(inst => (
                                        <option key={inst} value={inst}>{inst}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha</label>
                                    <input
                                        type="date"
                                        value={reservaEditando.fecha}
                                        onChange={(e) => setReservaEditando({ ...reservaEditando, fecha: e.target.value })}
                                        className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Horario</label>
                                    <input
                                        type="text"
                                        value={reservaEditando.horario}
                                        onChange={(e) => setReservaEditando({ ...reservaEditando, horario: e.target.value })}
                                        className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-xs text-blue-400 mt-2 flex gap-3">
                                <span>ℹ️</span>
                                <p>La validación de disponibilidad de fechas se conectará en el siguiente Sprint con Laravel.</p>
                            </div>

                            <button type="submit" className="w-full font-bold text-lg py-4 rounded-xl mt-4 text-black bg-yellow-400 hover:bg-yellow-500 shadow-lg transition-all">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: REGISTRAR INGRESO LUDOTECA */}
            {modalLudoteca && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-[#1c1f26] border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Baby className="text-yellow-400" /> Registrar Ingreso</h2>
                            <button onClick={() => { setModalLudoteca(false); setNombreNino(''); setNombreTutor(''); }} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-sm text-blue-400 mt-4 mb-4 flex gap-3">
                            <span>ℹ️</span>
                            <p>El sistema validará automáticamente que el menor tenga entre <strong>3 y 6 años</strong> de edad según el reglamento.</p>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const datos = { id_nino: formData.get('id_nino'), id_tutor: formData.get('id_tutor') };

                            try {
                                const res = await fetch('http://localhost:8000/api/ludoteca/ingreso', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                    body: JSON.stringify(datos)
                                });
                                const data = await res.json();

                                if (res.status !== 200 || data.status === 'error' || data.message?.includes('could not be found')) {
                                    alert("❌ Error: " + (data.message || "Ruta no encontrada"));
                                } else {
                                    alert("✅ " + data.message);
                                    const nuevoNino = {
                                        id_socio: datos.id_nino,
                                        nombre_nino: nombreNino || 'Niño Nuevo',
                                        tutor: `${nombreTutor || 'Tutor Nuevo'} (${datos.id_tutor})`,
                                        tiempo_entrada: new Date().toISOString()
                                    };
                                    agregarNino(nuevoNino);
                                    setModalLudoteca(false); setNombreNino(''); setNombreTutor('');
                                }
                            } catch { alert("❌ Error crítico: ¿Está prendido el servidor de Laravel?"); }
                        }} className="space-y-5">

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ID Niño (Socio Dependiente)</label>
                                <input
                                    type="number" name="id_nino" required placeholder="Ej. 1024"
                                    onChange={(e) => simularBusqueda(e.target.value, 'nino')}
                                    className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                                />
                                <div className="mt-2 h-8">
                                    {buscandoNino ? <p className="text-sm text-yellow-500 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Buscando en BD...</p>
                                        : nombreNino ? <p className="text-sm text-green-400 font-bold flex items-center gap-2 bg-green-500/10 w-max px-2 py-1 rounded"><UserCheck size={14} /> {nombreNino}</p> : null}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ID Tutor Responsable</label>
                                <input
                                    type="number" name="id_tutor" required placeholder="Ej. 1023"
                                    onChange={(e) => simularBusqueda(e.target.value, 'tutor')}
                                    className="w-full bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                                />
                                <div className="mt-2 h-8">
                                    {buscandoTutor ? <p className="text-sm text-yellow-500 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Buscando en BD...</p>
                                        : nombreTutor ? <p className="text-sm text-green-400 font-bold flex items-center gap-2 bg-green-500/10 w-max px-2 py-1 rounded"><UserCheck size={14} /> {nombreTutor}</p> : null}
                                </div>
                            </div>

                            <button type="submit" className="w-full font-bold text-lg py-4 rounded-xl mt-4 text-black bg-yellow-400 hover:bg-yellow-500 shadow-lg shadow-yellow-400/20 transition-all">Validar e Iniciar Estancia</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: AÑADIR TIEMPO PERSONALIZADO */}
            {modalTiempo.visible && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-[#1c1f26] border border-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="text-blue-400" /> Añadir Tiempo</h2>
                            <button onClick={() => { setModalTiempo({ visible: false, id_socio: null }); setMinutosManual(''); }} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Minutos Personalizados</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={minutosManual}
                                        onChange={(e) => setMinutosManual(e.target.value)}
                                        placeholder="Ej. 20"
                                        className="flex-1 bg-[#0f1115] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                                    />
                                    <button onClick={() => aplicarTiempo(parseInt(minutosManual))} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 rounded-lg transition-colors">Aplicar</button>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-gray-800">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Botones Rápidos</label>
                                <div className="grid grid-cols-4 gap-2">
                                    <button onClick={() => aplicarTiempo(15)} className="bg-[#0f1115] hover:bg-blue-500/20 hover:text-blue-400 border border-gray-700 hover:border-blue-500/50 text-gray-300 font-bold py-3 rounded-lg transition-all">+15m</button>
                                    <button onClick={() => aplicarTiempo(30)} className="bg-[#0f1115] hover:bg-blue-500/20 hover:text-blue-400 border border-gray-700 hover:border-blue-500/50 text-gray-300 font-bold py-3 rounded-lg transition-all">+30m</button>
                                    <button onClick={() => aplicarTiempo(45)} className="bg-[#0f1115] hover:bg-blue-500/20 hover:text-blue-400 border border-gray-700 hover:border-blue-500/50 text-gray-300 font-bold py-3 rounded-lg transition-all">+45m</button>
                                    <button onClick={() => aplicarTiempo(60)} className="bg-[#0f1115] hover:bg-blue-500/20 hover:text-blue-400 border border-gray-700 hover:border-blue-500/50 text-gray-300 font-bold py-3 rounded-lg transition-all">+1h</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Recepcion;
