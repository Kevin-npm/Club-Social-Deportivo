import React, { useState } from 'react';
import { UploadCloud, FileCheck2 } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000/api/socios/importar";

const SocioImport = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setError('');
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Por favor selecciona un archivo CSV o TXT.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Importación exitosa.');
                setFile(null);
                document.getElementById('file-upload').value = '';
            } else {
                setError(data.error || data.message || 'Ocurrió un error al importar los datos.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-gray-800 bg-[#14171c]">
                <div className="border-b border-gray-800 px-6 py-5">
                    <h2 className="text-3xl font-bold text-white">Importación Diaria de Socios</h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Sube el archivo CSV exportado del sistema principal para sincronizar de manera masiva.
                    </p>
                </div>

                <div className="p-6 sm:p-10 max-w-2xl mx-auto">
                    {error && (
                        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                            {message}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Archivo de Datos
                            </label>
                            <div className={`mt-1 flex justify-center rounded-xl border ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-dashed border-gray-700 bg-[#0f131a]'} px-6 pb-8 pt-10 transition hover:border-yellow-400`}>
                                <div className="space-y-2 text-center">
                                    {file ? (
                                        <FileCheck2 className="mx-auto h-12 w-12 text-emerald-400" />
                                    ) : (
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                                    )}
                                    <div className="flex text-sm text-gray-400 justify-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md font-medium text-yellow-400 hover:text-yellow-300 focus-within:outline-none"
                                        >
                                            <span>{file ? 'Cambiar archivo' : 'Seleccionar archivo'}</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv,.txt" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        CSV delimitado por comas.
                                    </p>
                                </div>
                            </div>
                            {file && (
                                <p className="mt-3 text-sm text-gray-400 text-center font-medium">
                                    Archivo seleccionado: <span className="text-white">{file.name}</span>
                                </p>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleUpload}
                                disabled={loading || !file}
                                className={`w-full flex justify-center rounded-xl py-3 px-4 text-sm font-semibold transition ${
                                    loading || !file 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-sm shadow-yellow-400/20'
                                }`}
                            >
                                {loading ? 'Procesando e Importando...' : 'Iniciar Importación'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SocioImport;
