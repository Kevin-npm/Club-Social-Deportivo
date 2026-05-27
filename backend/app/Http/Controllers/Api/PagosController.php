<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pago;
use App\Models\Socio;
use App\Models\CatMetodoPago;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PagosController extends Controller
{
    /**
     * GET /api/pagos
     * Lista pagos con filtros opcionales
     * ?id_socio=1  ?fecha_inicio=2026-01-01  ?fecha_fin=2026-04-01
     */
    public function index(Request $request)
    {
        $query = Pago::with(['socio', 'metodo'])
            ->orderBy('fecha_pago', 'desc');

        if ($request->filled('id_socio')) {
            $query->where('id_socio', $request->id_socio);
        }

        if ($request->filled('fecha_inicio')) {
            $query->where('fecha_pago', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin')) {
            $query->where('fecha_pago', '<=', $request->fecha_fin . ' 23:59:59');
        }

        $pagos = $query->get();

        return response()->json([
            'status' => 'success',
            'total'  => $pagos->count(),
            'data'   => $pagos,
        ]);
    }

    /**
     * GET /api/pagos/{id}
     * Detalle de un pago
     */
    public function show($id)
    {
        $pago = Pago::with(['socio', 'metodo'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $pago,
        ]);
    }

    /**
     * POST /api/pagos
     * Registra un pago, genera folio y actualiza membresía a Vigente
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_socio'   => 'required|exists:tbl_socios,id_socio',
            'id_metodo'  => 'required|exists:cat_metodos_pago,id_metodo',
            'monto'      => 'required|numeric|min:0.01',
            'concepto'   => 'required|string|max:60',
            'referencia' => 'nullable|string|max:120',
        ]);

        // Generar folio único: PAG-YYYYMMDD-XXXXXX
        $folio = $this->generarFolio();

        DB::beginTransaction();
        try {
            // 1. Crear el pago
            $pago = Pago::create([
                ...$validated,
                'folio_digital' => $folio,
                'fecha_pago'    => now(),
            ]);

            // 2. Actualizar estatus financiero del socio a Vigente
            Socio::where('id_socio', $validated['id_socio'])
                ->update(['estatus_financiero' => 'Vigente']);

            DB::commit();

            $pago->load(['socio', 'metodo']);

            return response()->json([
                'status'  => 'success',
                'message' => 'Pago registrado correctamente. Membresía actualizada a Vigente.',
                'data'    => $pago,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Error al registrar el pago: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/pagos/metodos
     * Catálogo de métodos de pago activos
     */
    public function getMetodos()
    {
        $metodos = CatMetodoPago::where('activo', true)
            ->select('id_metodo', 'nombre_metodo')
            ->orderBy('nombre_metodo')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $metodos,
        ]);
    }

    /**
     * Genera un folio único con formato PAG-YYYYMMDD-XXXXXX
     */
    private function generarFolio(): string
    {
        $fecha = Carbon::now()->format('Ymd');
        do {
            $random = strtoupper(substr(uniqid(), -6));
            $folio  = "PAG-{$fecha}-{$random}";
        } while (Pago::where('folio_digital', $folio)->exists());

        return $folio;
    }
}