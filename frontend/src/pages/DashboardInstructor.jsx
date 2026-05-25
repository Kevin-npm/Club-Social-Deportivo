import { useState } from 'react';
import { Activity, Users, TrendingUp, CalendarDays, Filter } from 'lucide-react';
// 1. Importamos los componentes de la librería de gráficas
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardInstructor = () => {
    // Estado falso para simular las tarjetas de arriba (CM3-181)
    const [metricas, setMetricas] = useState({
        clasesImpartidas: 24,
        alumnosTotales: 342,
        promedioOcupacion: 85,
    });

    // 2. Data estática para simular la gráfica de alumnos por mes (CM3-179)
    const dataGrafica = [
        { mes: 'Ene', clases: 15, alumnos: 120 },
        { mes: 'Feb', clases: 18, alumnos: 150 },
        { mes: 'Mar', clases: 20, alumnos: 210 },
        { mes: 'Abr', clases: 24, alumnos: 342 },
    ];

    return (
        <div className="space-y-6 p-4 md:p-6 text-gray-200 animate-in fade-in duration-500">
            {/* ENCABEZADO */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-white flex items-center gap-3">
                        <Activity className="text-yellow-400" size={36} /> 
                        Mi Rendimiento
                    </h1>
                    <p className="text-gray-400 mt-2">Métricas personales y estadísticas de tus clases</p>
                </div>
                
                <button className="bg-[#1a1d23] border border-gray-800 hover:border-yellow-400 text-white px-5 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-lg self-start">
                    <Filter size={18} className="text-gray-400" />
                    Filtrar por Mes
                </button>
            </div>

            {/* SECCIÓN 1: TARJETAS DE MÉTRICAS (STAT CARDS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Tarjeta 1: Clases Impartidas */}
                <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden group hover:border-yellow-400/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CalendarDays size={64} className="text-yellow-400" />
                    </div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Clases Impartidas</p>
                    <h3 className="text-5xl font-extrabold text-white">{metricas.clasesImpartidas}</h3>
                    <p className="text-xs text-green-400 mt-4 flex items-center gap-1 font-medium bg-green-500/10 w-max px-2 py-1 rounded">
                        <TrendingUp size={12} /> +3 este mes
                    </p>
                </div>

                {/* Tarjeta 2: Alumnos Totales */}
                <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-400/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} className="text-blue-400" />
                    </div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Alumnos Totales</p>
                    <h3 className="text-5xl font-extrabold text-white">{metricas.alumnosTotales}</h3>
                    <p className="text-xs text-blue-400 mt-4 font-medium bg-blue-500/10 w-max px-2 py-1 rounded">
                        Suma de todas tus sesiones
                    </p>
                </div>

                {/* Tarjeta 3: Promedio de Ocupación */}
                <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-green-400/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={64} className="text-green-400" />
                    </div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Promedio de Ocupación</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-5xl font-extrabold text-white">{metricas.promedioOcupacion}</h3>
                        <span className="text-2xl text-gray-400 font-bold mb-1">%</span>
                    </div>
                    {/* Barra de progreso visual */}
                    <div className="w-full bg-gray-800 rounded-full h-2.5 mt-4 overflow-hidden">
                        <div className="bg-green-400 h-2.5 rounded-full" style={{ width: `${metricas.promedioOcupacion}%` }}></div>
                    </div>
                </div>

            </div>

            {/* 3. SECCIÓN 2: ÁREA PARA GRÁFICAS (CM3-179) */}
            <div className="bg-[#14171c] border border-gray-800 rounded-2xl p-8 shadow-xl mt-8 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><TrendingUp className="text-blue-400"/> Crecimiento de Alumnos</h3>
                        <p className="text-gray-500 text-sm mt-1">Evolución de asistencias durante el cuatrimestre</p>
                    </div>
                </div>
                
                {/* Contenedor principal de la Gráfica */}
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataGrafica} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAlumnos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis dataKey="mes" stroke="#9ca3af" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                            <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.8rem', color: '#fff' }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="alumnos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAlumnos)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default DashboardInstructor;