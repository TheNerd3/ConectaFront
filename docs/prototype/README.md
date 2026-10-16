# Prototipo de diseño (referencia)

Pantallas exportadas del prototipo de Claude Design. Son archivos `.dc.html`: HTML con estilos inline y marcadores `{{...}}` / `<sc-if>` de la herramienta. Sirven como **referencia visual y de estructura** (colores, tipografías, espaciados, textos), no se ejecutan tal cual: hay que migrarlas a componentes React.

| Rol | Login | Pantallas |
| --- | --- | --- |
| Empleado | `Main.dc.html` | BuscarEmpleo, DetalleOferta, Dashboard, AnalizadorCV, MiPerfil, Chat, Notificaciones |
| Empleador | `MainEmpleador.dc.html` | VacantesEmpleador, PipelineCandidatos, PublicarVacante, PerfilEmpresa, ConfiguracionEmpleador |
| Admin | `AdminLogin.dc.html` | AdminDashboard, AdminEmpresas, AdminUsuarios |

`MascotaReferencia.dc.html` muestra los 13 estados de la mascota. `canvas.json` indica la ubicación de cada pantalla en el lienzo.
