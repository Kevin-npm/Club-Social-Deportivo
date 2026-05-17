<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    use HasFactory;

    protected $table = 'tbl_notificaciones';

    protected $primaryKey = 'id_notificacion';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = true;

    protected $fillable = [
        'id_socio',
        'titulo',
        'mensaje',
        'leido_boolean',
    ];

    protected $casts = [
        'id_socio' => 'integer',
        'leido_boolean' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELACIONES
    |--------------------------------------------------------------------------
    */

    public function socio()
    {
        return $this->belongsTo(Socio::class, 'id_socio', 'id_socio');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeNoLeidas($query)
    {
        return $query->where('leido_boolean', false);
    }

    /*
    |--------------------------------------------------------------------------
    | MÉTODOS AUXILIARES
    |--------------------------------------------------------------------------
    */

    public function marcarComoLeida()
    {
        return $this->update([
            'leido_boolean' => true,
        ]);
    }
}