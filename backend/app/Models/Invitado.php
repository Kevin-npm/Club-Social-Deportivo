<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invitado extends Model
{
    protected $table = 'tbl_invitados';
    protected $primaryKey = 'id_invitado';

    public $timestamps = true;

    protected $fillable = [
        'id_socio',
        'nombre',
        'apellidos',
        'fecha_registro',
        'estatus',
        'observaciones',
    ];

    protected $casts = [
        'fecha_registro' => 'date',
    ];

    public function socio()
    {
        return $this->belongsTo(Socio::class, 'id_socio', 'id_socio');
    }
}
