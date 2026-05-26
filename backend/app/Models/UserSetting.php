<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    protected $table = 'user_settings';

    protected $fillable = [
        'id_usuario',
        'email_notifications',
        'system_alerts',
        'security_alerts',
        'compact_mode',
        'theme',
        'accent',
    ];

    protected $casts = [
        'email_notifications' => 'boolean',
        'system_alerts' => 'boolean',
        'security_alerts' => 'boolean',
        'compact_mode' => 'boolean',
    ];
}