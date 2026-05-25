<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agenda extends Model
{
    protected $table      = 'tbl_agenda';
    protected $primaryKey = 'id_sesion';
    public $timestamps = false;

    protected $fillable = [
        'id_disciplina',
        'id_instructor',
        'id_espacio',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'cupo_maximo',
        'estado',
    ];

    // Relación con cat_disciplinas
    public function disciplina()
    {
        return $this->belongsTo(CatDisciplina::class, 'id_disciplina', 'id_disciplina');
    }

    // Relación con tbl_instructores
    public function instructor()
    {
        return $this->belongsTo(Instructor::class, 'id_instructor', 'id_instructor');
    }

    // Relación con tbl_instalaciones
    public function espacio()
    {
        return $this->belongsTo(Instalaciones::class, 'id_espacio', 'id_espacio');
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'id_sesion', 'id_sesion');
    }

    protected $appends = ['asistentes_count'];

    public function getAsistentesCountAttribute()
    {
        return $this->asistencias()->count();
    }
}