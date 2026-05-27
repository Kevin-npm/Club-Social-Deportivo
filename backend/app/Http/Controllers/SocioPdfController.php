<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class SocioPdfController extends Controller
{
    public function exportarPdf()
    {
        $socios = DB::table('tbl_socios')
            ->leftJoin(
                'tbl_usuarios',
                'tbl_socios.id_usuario',
                '=',
                'tbl_usuarios.id_usuario'
            )
            ->select(
                'tbl_socios.id_socio',
                'tbl_socios.nombre',
                'tbl_socios.apellidos',
                'tbl_usuarios.email',
                'tbl_socios.tipo_membresia',
                'tbl_socios.modalidad',
                'tbl_socios.estatus_financiero',
                'tbl_socios.activo'
            )
            ->orderBy('tbl_socios.id_socio', 'desc')
            ->limit(100)
            ->get();

        $pdf = Pdf::loadView('pdf.socios', compact('socios'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('socios_clubmanager360.pdf');
    }
}