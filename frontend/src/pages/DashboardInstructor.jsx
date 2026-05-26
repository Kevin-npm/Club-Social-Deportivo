import { useState } from 'react';
import { Activity, Users, TrendingUp, CalendarDays, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardInstructor = () => {
    const [metricas, setMetricas] = useState({
        clasesImpartidas: 24,
        alumnosTotales: 342,
        promedioOcupacion: 85,
    });

    const dataGrafica = [
        { mes: 'Ene', clases: 15, alumnos: 120 },
        { mes: 'Feb', clases: 18, alumnos: 150 },
        { mes: 'Mar', clases: 20, alumnos: 210 },
        { mes: 'Abr', clases: 24, alumnos: 342 },
    ];

    return (
        <div className="space-y-4 p-4 md:p-6 text-gray-200 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                        <Activity className="text-yellow-400" size={28} /> 
                        Mi Rendimiento
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Métricas personales y estadísticas de tus clases</p>
                </div>
                
                <button className="bg-[#1a1d23] border border-gray-800 hover:border-yellow-400 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-lg self-start text-sm">
                    <Filter size={16} className="text-gray-400" />
                    Filtrar por Mes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                
                <div className="bg-[#14171c] border border-gray-800 rounded-xl p-3 md:p-4 shadow-xl group hover:border-yellow-400/50 transition-colors">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Clases Impartidas</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">{metricas.clasesImpartidas}</h3>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1 font-medium bg-green-500/10 w-max px-2 py-0.5 rounded">
                        <TrendingUp size={12} /> +3 este mes
                    </p>
                </div>

                <div className="bg-[#14171c] border border-gray-800 rounded-xl p-3 md:p-4 shadow-xl group hover:border-blue-400/50 transition-colors">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Alumnos Totales</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">{metricas.alumnosTotales}</h3>
                    <p className="text-xs text-blue-400 mt-2 font-medium bg-blue-500/10 w-max px-2 py-0.5 rounded">
                        Suma de todas tus sesiones
                    </p>
                </div>

                <div className="bg-[#14171c] border border-gray-800 rounded-xl p-3 md:p-4 shadow-xl group hover:border-green-400/50 transition-colors">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Promedio de Ocupación</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl md:text-3xl font-extrabold text-white">{metricas.promedioOcupacion}</h3>
                        <span className="text-lg text-gray-400 font-bold mb-0.5">%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mt-2 overflow-hidden">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: `${metricas.promedioOcupacion}%` }}></div>
                    </div>
                </div>

            </div>

            <div className="bg-[#14171c] border border-gray-800 rounded-xl p-4 md:p-5 shadow-xl max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2"><TrendingUp size={18} className="text-blue-400"/> Crecimiento de Alumnos</h3>
                        <p className="text-gray-500 text-xs mt-0.5">Evolución de asistencias durante el cuatrimestre</p>
                    </div>
                </div>
                
                <div className="h-[200px] md:h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataGrafica} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAlumnos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis dataKey="mes" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                            <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.8rem', color: '#fff', fontSize: '13px' }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="alumnos" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAlumnos)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default DashboardInstructor;