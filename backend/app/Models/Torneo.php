<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Torneo extends Model
{
    use HasFactory;

    protected $table = 'tbl_torneos';
    protected $primaryKey = 'id_torneo';

    // 🚀 LA SOLUCIÓN AL ERROR: Le decimos a Laravel que no busque created_at ni updated_at
    public $timestamps = false;

    protected $fillable = [
        'id_disciplina', 
        'nombre_torneo', 
        'tipo', 
        'tipo_bracket',
        'categoria', 
        'sede_principal', 
        'fecha_inicio', 
        'fecha_fin',
        'cupo_maximo'
    ];

    public function encuentros()
    {
        // Corrección: Tu primary key es id_torneo, no id.
        return $this->hasMany(Encuentro::class, 'torneo_id', 'id_torneo');
    }

    public function participantes()
    {
        // Corrección: Tu primary key es id_torneo, no id.
        return $this->hasMany(JugadorTemporal::class, 'id_torneo', 'id_torneo');
    }

    public function sede()
    {
        return $this->belongsTo(Instalaciones::class, 'sede_principal', 'id_espacio');
    }
}