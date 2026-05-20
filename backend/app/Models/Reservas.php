<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservas extends Model
{
    protected $table      = 'tbl_reservas';
    protected $primaryKey = 'id_reserva';
    public $timestamps = false;

    protected $fillable = [
        'id_socio',
        'id_espacio',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'folio_reserva',
        'estatus',
        'estatus_noshow',
    ];

    protected $casts = [
        'estatus_noshow' => 'boolean',
    ];

    // Relación con tbl_socios
    public function socio()
    {
        return $this->belongsTo(Socio::class, 'id_socio', 'id_socio');
    }

    // Relación con tbl_instalaciones
    public function espacio()
    {
        return $this->belongsTo(Instalaciones::class, 'id_espacio', 'id_espacio');
    }
}