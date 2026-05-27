<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Socios</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #222;
        }

        h1 {
            text-align: center;
            color: #111827;
            margin-bottom: 5px;
        }

        .subtitle {
            text-align: center;
            margin-bottom: 20px;
            color: #555;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            background: #111827;
            color: white;
        }

        th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
        }

        tbody tr:nth-child(even) {
            background: #f3f4f6;
        }

        .activo {
            color: green;
            font-weight: bold;
        }

        .inactivo {
            color: red;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <h1>ClubManager360</h1>

    <div class="subtitle">
        Reporte general de socios
        <br>
        Generado: {{ now()->format('d/m/Y H:i') }}
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Socio</th>
                <th>Email</th>
            
                <th>Membresía</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Activo</th>
            </tr>
        </thead>

        <tbody>
            @foreach($socios as $socio)
                <tr>
                    <td>{{ $socio->id_socio }}</td>

                    <td>
                        {{ $socio->nombre }}
                        {{ $socio->apellidos }}
                    </td>

                    <td>{{ $socio->email }}</td>

                    

                    <td>{{ $socio->tipo_membresia }}</td>

                    <td>{{ $socio->modalidad }}</td>

                    <td>{{ $socio->estatus_financiero }}</td>

                    <td>
                        @if($socio->activo)
                            <span class="activo">Sí</span>
                        @else
                            <span class="inactivo">No</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>