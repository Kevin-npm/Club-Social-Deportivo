<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido al Club</title>
    <style>
        @media only screen and (max-width: 600px) {
            table[class="container"] { width: 100% !important; }
            td[class="container-td"] { padding: 24px 20px !important; }
            td[class="header-td"] { padding: 24px 20px !important; }
            td[class="footer-td"] { padding: 16px 20px !important; }
            h1[class="h1"] { font-size: 20px !important; }
            h2[class="h2"] { font-size: 18px !important; }
            td[class="button-td"] { padding: 12px 20px !important; }
            a[class="button-a"] { display: block !important; width: 100% !important; padding: 14px 0 !important; font-size: 15px !important; }
            p[class="text"] { font-size: 15px !important; }
            td[class="inner-td"] { padding: 24px 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f4f6f9;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
                <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);" class="container">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1a1d23; padding: 32px 32px; text-align: center;" class="header-td">
                            <h1 style="color: #facc15; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;" class="h1">CM360</h1>
                            <p style="color: #9ca3af; margin: 6px 0 0; font-size: 13px;">Club Social &amp; Deportivo</p>
                        </td>
                    </tr>

                    <!-- Contenido -->
                    <tr>
                        <td style="padding: 36px 32px;" class="inner-td">
                            <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px; font-weight: 700;" class="h2">¡Bienvenido, {{ $nombre }}!</h2>
                            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;" class="text">
                                Tu registro como socio ha sido completado exitosamente. Para acceder a nuestra plataforma, 
                                necesitamos que crees tu contraseña personal.
                            </p>
                            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 28px;" class="text">
                                Haz clic en el siguiente botón para configurar tu acceso:
                            </p>

                            <!-- Botón -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="background-color: #facc15; border-radius: 8px; text-align: center;" class="button-td">
                                        <a href="{{ $setPasswordUrl }}" target="_blank" style="display: inline-block; padding: 14px 36px; color: #000000; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 8px;" class="button-a">
                                            Crear mi contraseña
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 28px 0 0;" class="text">
                                Si no realizaste este registro, puedes ignorar este correo. Este enlace es de un solo uso 
                                y expirará después de ser utilizado.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;" class="footer-td">
                            <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 0;">
                                &copy; {{ date('Y') }} CM360. Todos los derechos reservados.
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; margin: 4px 0 0;">
                                Este es un mensaje automático, por favor no respondas a este correo.
                            </p>
                        </td>
                    </tr>
                </table>
                <!--[if mso]></td></tr></table><![endif]-->
            </td>
        </tr>
    </table>
</body>
</html>
