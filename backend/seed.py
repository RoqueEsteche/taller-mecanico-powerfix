"""
Población de la base de datos con datos de prueba.
Ejecutar directamente:  python seed.py
También se invoca desde main.py al iniciar si la BD está vacía.
"""
from database import SessionLocal, engine, Base
import models
from auth import hash_password


def run(db):
    """Insertar datos iniciales. Idempotente."""

    # ── Usuarios ───────────────────────────────────────────────────────────────
    usuarios = [
        {"nombre": "Admin",   "apellido": "PowerFix", "email": "admin@powerfix.com",
         "password": "Admin2024!", "rol": "admin"},
        {"nombre": "Carlos",  "apellido": "Técnico",  "email": "carlos@powerfix.com",
         "password": "Empleado2024!", "rol": "empleado"},
        {"nombre": "Juan",    "apellido": "Pérez",    "email": "juan@ejemplo.com",
         "password": "Cliente2024!", "rol": "cliente"},
    ]
    for u in usuarios:
        if not db.query(models.Usuario).filter(models.Usuario.email == u["email"]).first():
            db.add(models.Usuario(
                nombre=u["nombre"], apellido=u["apellido"], email=u["email"],
                password_hash=hash_password(u["password"]), rol=u["rol"],
            ))

    # ── Mecánicos ──────────────────────────────────────────────────────────────
    mecanicos = [
        {"nombre": "Carlos",  "apellido": "Rodríguez", "telefono": "3814 101010",
         "email": "carlos.r@powerfix.com",
         "especialidad": "Motosierras, Desmalezadoras, Tractores cortacésped", "activo": True},
        {"nombre": "Ana",     "apellido": "García",    "telefono": "3814 202020",
         "email": "ana.g@powerfix.com",
         "especialidad": "Cortacéspedes, Sopladoras, Tractores", "activo": True},
        {"nombre": "Miguel",  "apellido": "Pérez",     "telefono": "3814 303030",
         "email": "miguel.p@powerfix.com",
         "especialidad": "Generadores, Motobombas, Motores estacionarios", "activo": True},
    ]
    for m in mecanicos:
        if not db.query(models.Mecanico).filter(models.Mecanico.email == m["email"]).first():
            db.add(models.Mecanico(**m))

    db.flush()  # necesario para obtener IDs antes del seed de órdenes

    # ── Servicios ──────────────────────────────────────────────────────────────
    servicios = [
        {"nombre": "Reparación y Mantenimiento de Desmalezadoras", "categoria": "Jardinería",
         "descripcion": "Revisión de carburador, filtros, bujía y sistema de corte.",
         "precio_base": 2500.0, "imagen_path": "/assets/images/productos/desmalezadora.webp",
         "tiempo_estimado": "1-2 días hábiles"},
        {"nombre": "Servicio Técnico de Motosierras", "categoria": "Forestal",
         "descripcion": "Afilado de cadena, ajuste de carburador, revisión de embrague y freno.",
         "precio_base": 3500.0, "imagen_path": "/assets/images/productos/motosierra.webp",
         "tiempo_estimado": "1-3 días hábiles"},
        {"nombre": "Mantenimiento de Cortacéspedes a Empuje", "categoria": "Jardinería",
         "descripcion": "Afilado y balanceo de cuchilla, limpieza de filtros y ajuste de motor.",
         "precio_base": 2000.0, "imagen_path": "/assets/images/productos/cortacesped.webp",
         "tiempo_estimado": "1-2 días hábiles"},
        {"nombre": "Reparación de Tractores Cortacésped", "categoria": "Jardinería",
         "descripcion": "Revisión de transmisión, sistema de corte y correas.",
         "precio_base": 8000.0, "imagen_path": "/assets/images/productos/tractor.webp",
         "tiempo_estimado": "3-7 días hábiles"},
        {"nombre": "Servicio de Sopladoras", "categoria": "Jardinería",
         "descripcion": "Limpieza de filtros, carburador y revisión del impeller.",
         "precio_base": 1800.0, "imagen_path": "/assets/images/productos/sopladora.webp",
         "tiempo_estimado": "1 día hábil"},
        {"nombre": "Reparación de Fumigadoras Motorizadas", "categoria": "Agricultura",
         "descripcion": "Revisión de bomba, mangueras, lanzas y ajuste de presión.",
         "precio_base": 3000.0, "imagen_path": "/assets/images/productos/fumigadora.webp",
         "tiempo_estimado": "2-3 días hábiles"},
        {"nombre": "Mantenimiento de Generadores Eléctricos", "categoria": "Energía",
         "descripcion": "Revisión de AVR, alternador y motor. Prueba de carga incluida.",
         "precio_base": 6000.0, "imagen_path": "/assets/images/productos/generador.webp",
         "tiempo_estimado": "2-4 días hábiles"},
        {"nombre": "Reparación de Motobombas de Agua", "categoria": "Agua",
         "descripcion": "Revisión de impeller, sello mecánico y cebador.",
         "precio_base": 3500.0, "imagen_path": "/assets/images/productos/motobomba.webp",
         "tiempo_estimado": "1-2 días hábiles"},
        {"nombre": "Servicio de Motores Estacionarios", "categoria": "Energía",
         "descripcion": "Mantenimiento mayor: cigüeñal, anillos, culata y válvulas.",
         "precio_base": 7500.0, "imagen_path": "/assets/images/productos/motor_estacionario.webp",
         "tiempo_estimado": "5-10 días hábiles"},
    ]
    for s in servicios:
        if not db.query(models.Servicio).filter(models.Servicio.nombre == s["nombre"]).first():
            db.add(models.Servicio(**s))

    # ── Contactos de prueba ────────────────────────────────────────────────────
    if db.query(models.Contacto).count() == 0:
        for c in [
            {"nombre": "María",   "apellido": "González", "email": "maria@mail.com",   "telefono": "3814001234",
             "tipo_maquina": "Desmalezadora",           "descripcion": "No arranca después del invierno.", "estado": "nuevo"},
            {"nombre": "Roberto", "apellido": "Silva",    "email": "roberto@mail.com", "telefono": "3814005678",
             "tipo_maquina": "Generador",                "descripcion": "Pierde potencia bajo carga.",    "estado": "en_proceso"},
            {"nombre": "Ana",     "apellido": "Torres",   "email": "ana@mail.com",     "telefono": "3814009012",
             "tipo_maquina": "Motosierra",               "descripcion": "La cadena se traba.",            "estado": "resuelto"},
            {"nombre": "Luis",    "apellido": "Martínez", "email": "luis@mail.com",    "telefono": "3814003456",
             "tipo_maquina": "Motobomba de Agua",        "descripcion": "No ceba correctamente.",         "estado": "nuevo"},
            {"nombre": "Pedro",   "apellido": "Ramírez",  "email": "pedro@mail.com",   "telefono": "3814007890",
             "tipo_maquina": "Cortacésped",              "descripcion": "Golpetea en ralentí.",           "estado": "cerrado"},
        ]:
            db.add(models.Contacto(**c))

    # ── Repuestos / Inventario ─────────────────────────────────────────────────
    if db.query(models.Repuesto).count() == 0:
        repuestos = [
            {"codigo": "FIL-001", "nombre": "Filtro de Aire Universal Pequeño",   "categoria": "Filtros",
             "stock": 15, "stock_minimo": 5, "precio_costo": 350.0,  "precio_venta": 650.0,
             "proveedor": "Distribuidora Norte", "ubicacion": "Estante A1"},
            {"codigo": "FIL-002", "nombre": "Filtro de Aire Universal Grande",    "categoria": "Filtros",
             "stock": 8,  "stock_minimo": 5, "precio_costo": 480.0,  "precio_venta": 900.0,
             "proveedor": "Distribuidora Norte", "ubicacion": "Estante A1"},
            {"codigo": "BUJ-001", "nombre": "Bujía NGK CMR6H",                   "categoria": "Encendido",
             "stock": 20, "stock_minimo": 8, "precio_costo": 420.0,  "precio_venta": 750.0,
             "proveedor": "NGK Argentina",       "ubicacion": "Estante B2"},
            {"codigo": "BUJ-002", "nombre": "Bujía Champion RCJ6Y",              "categoria": "Encendido",
             "stock": 12, "stock_minimo": 8, "precio_costo": 380.0,  "precio_venta": 700.0,
             "proveedor": "NGK Argentina",       "ubicacion": "Estante B2"},
            {"codigo": "CAD-001", "nombre": "Cadena Motosierra 3/8 .050 56E",    "categoria": "Corte",
             "stock": 6,  "stock_minimo": 3, "precio_costo": 2800.0, "precio_venta": 5200.0,
             "proveedor": "Ferretería Central",  "ubicacion": "Estante C1"},
            {"codigo": "ACE-001", "nombre": "Aceite 2T Semisintético 1L",        "categoria": "Lubricantes",
             "stock": 24, "stock_minimo": 10,"precio_costo": 1200.0, "precio_venta": 2100.0,
             "proveedor": "Lubricar SA",         "ubicacion": "Estante D3"},
            {"codigo": "ACE-002", "nombre": "Aceite Motor 4T SAE 30 1L",         "categoria": "Lubricantes",
             "stock": 3,  "stock_minimo": 8, "precio_costo": 900.0,  "precio_venta": 1600.0,
             "proveedor": "Lubricar SA",         "ubicacion": "Estante D3"},
            {"codigo": "CAR-001", "nombre": "Carburador Desmalezadora Universal", "categoria": "Carburación",
             "stock": 4,  "stock_minimo": 2, "precio_costo": 3500.0, "precio_venta": 6500.0,
             "proveedor": "Importadora Sur",     "ubicacion": "Estante C3"},
            {"codigo": "SEL-001", "nombre": "Sello Mecánico Motobomba 16mm",     "categoria": "Sellos",
             "stock": 7,  "stock_minimo": 4, "precio_costo": 1100.0, "precio_venta": 2000.0,
             "proveedor": "Importadora Sur",     "ubicacion": "Estante E2"},
            {"codigo": "COR-001", "nombre": "Correa Transmisión Cortacésped A38","categoria": "Transmisión",
             "stock": 0,  "stock_minimo": 3, "precio_costo": 1800.0, "precio_venta": 3300.0,
             "proveedor": "Distribuidora Norte", "ubicacion": "Estante F1"},
        ]
        for r in repuestos:
            db.add(models.Repuesto(**r))

    # ── Órdenes de Trabajo de prueba ───────────────────────────────────────────
    if db.query(models.OrdenTrabajo).count() == 0:
        from datetime import date, timedelta
        hoy = date.today()

        mec1 = db.query(models.Mecanico).filter(models.Mecanico.nombre == "Carlos").first()
        mec2 = db.query(models.Mecanico).filter(models.Mecanico.nombre == "Ana").first()
        mec3 = db.query(models.Mecanico).filter(models.Mecanico.nombre == "Miguel").first()

        ordenes = [
            {
                "cliente_nombre": "Roberto Silva", "cliente_telefono": "3814005678",
                "cliente_email": "roberto@mail.com",
                "vehiculo": "Generador Briggs & Stratton 5500W",
                "descripcion_problema": "Pierde potencia bajo carga y el AVR falla intermitentemente.",
                "diagnostico": "AVR defectuoso, bobinado con humedad.",
                "mecanico_id": mec3.id if mec3 else None,
                "mecanico_nombre": f"{mec3.nombre} {mec3.apellido}" if mec3 else None,
                "estado": "reparando", "prioridad": "alta",
                "costo_mano_obra": 4500.0, "costo_repuestos": 2800.0, "costo_total": 7300.0,
                "fecha_estimada": (hoy + timedelta(days=2)).strftime("%Y-%m-%d"),
                "notas_internas": "Revisar también el filtro de aire al desarmar.",
            },
            {
                "cliente_nombre": "María González", "cliente_telefono": "3814001234",
                "cliente_email": "maria@mail.com",
                "vehiculo": "Desmalezadora Kawasaki TJ 45E",
                "descripcion_problema": "No arranca después del invierno, necesita revisión completa.",
                "mecanico_id": mec1.id if mec1 else None,
                "mecanico_nombre": f"{mec1.nombre} {mec1.apellido}" if mec1 else None,
                "estado": "diagnosticando", "prioridad": "normal",
                "costo_mano_obra": 0.0, "costo_repuestos": 0.0, "costo_total": 0.0,
                "fecha_estimada": (hoy + timedelta(days=3)).strftime("%Y-%m-%d"),
            },
            {
                "cliente_nombre": "Pedro Ramírez", "cliente_telefono": "3814007890",
                "cliente_email": "pedro@mail.com",
                "vehiculo": "Cortacésped Husqvarna LC 140",
                "descripcion_problema": "Golpetea en ralentí y la cuchilla vibra mucho.",
                "diagnostico": "Cuchilla desbalanceada y filtro de aire saturado.",
                "trabajo_realizado": "Afilado y balanceo de cuchilla, cambio de filtro y bujía.",
                "mecanico_id": mec2.id if mec2 else None,
                "mecanico_nombre": f"{mec2.nombre} {mec2.apellido}" if mec2 else None,
                "estado": "listo", "prioridad": "normal",
                "costo_mano_obra": 1500.0, "costo_repuestos": 1350.0, "costo_total": 2850.0,
                "fecha_estimada": hoy.strftime("%Y-%m-%d"),
                "notas_internas": "Avisar al cliente que puede pasar a retirar.",
            },
            {
                "cliente_nombre": "Luis Martínez", "cliente_telefono": "3814003456",
                "cliente_email": "luis@mail.com",
                "vehiculo": "Motobomba Honda WX10",
                "descripcion_problema": "No ceba correctamente y tiene pérdida por el sello.",
                "mecanico_id": mec3.id if mec3 else None,
                "mecanico_nombre": f"{mec3.nombre} {mec3.apellido}" if mec3 else None,
                "estado": "recibido", "prioridad": "urgente",
                "costo_mano_obra": 0.0, "costo_repuestos": 0.0, "costo_total": 0.0,
                "fecha_estimada": (hoy + timedelta(days=1)).strftime("%Y-%m-%d"),
                "notas_internas": "Cliente necesita la bomba urgente para riego.",
            },
            {
                "cliente_nombre": "Ana Torres", "cliente_telefono": "3814009012",
                "cliente_email": "ana@mail.com",
                "vehiculo": "Motosierra Stihl MS 250",
                "descripcion_problema": "La cadena se traba y hay pérdida de aceite de la barra.",
                "diagnostico": "Cadena desgastada, trinquete de aceite bloqueado.",
                "trabajo_realizado": "Cambio de cadena, limpieza del sistema de lubricación.",
                "mecanico_id": mec1.id if mec1 else None,
                "mecanico_nombre": f"{mec1.nombre} {mec1.apellido}" if mec1 else None,
                "estado": "entregado", "prioridad": "normal",
                "costo_mano_obra": 2000.0, "costo_repuestos": 5200.0, "costo_total": 7200.0,
                "fecha_estimada": (hoy - timedelta(days=1)).strftime("%Y-%m-%d"),
            },
        ]

        for i, o in enumerate(ordenes, start=1):
            ot = models.OrdenTrabajo(**o)
            db.add(ot)
            db.flush()
            ot.numero = f"OT-{hoy.year}-{ot.id:04d}"

    # ── Turnos de prueba ───────────────────────────────────────────────────────
    if db.query(models.Turno).count() == 0:
        from datetime import date, timedelta
        hoy = date.today()
        mec1 = db.query(models.Mecanico).filter(models.Mecanico.nombre == "Carlos").first()
        mec2 = db.query(models.Mecanico).filter(models.Mecanico.nombre == "Ana").first()
        for t in [
            {"cliente_nombre": "Carlos Rodríguez", "cliente_telefono": "3814101010",
             "vehiculo": "Motosierra Stihl MS 250", "servicio": "Afilado y ajuste de carburador",
             "mecanico": f"{mec1.nombre} {mec1.apellido}" if mec1 else "Técnico 1",
             "fecha": (hoy + timedelta(days=1)).strftime("%Y-%m-%d"), "hora": "09:00", "estado": "confirmado"},
            {"cliente_nombre": "Laura Sánchez", "cliente_telefono": "3814202020",
             "vehiculo": "Cortacésped Husqvarna LC 140", "servicio": "Mantenimiento preventivo",
             "mecanico": f"{mec2.nombre} {mec2.apellido}" if mec2 else "Técnico 2",
             "fecha": (hoy + timedelta(days=1)).strftime("%Y-%m-%d"), "hora": "11:00", "estado": "agendado"},
            {"cliente_nombre": "Jorge Medina", "cliente_telefono": "3814303030",
             "vehiculo": "Generador Briggs 5500W", "servicio": "Revisión de AVR",
             "fecha": (hoy + timedelta(days=2)).strftime("%Y-%m-%d"), "hora": "10:30", "estado": "agendado"},
        ]:
            db.add(models.Turno(**t))

    # ── Page views ─────────────────────────────────────────────────────────────
    if db.query(models.PageView).count() == 0:
        for p in ["inicio", "servicios", "contacto", "inicio", "servicios", "inicio", "admin"]:
            db.add(models.PageView(pagina=p))

    db.commit()
    print("OK - Base de datos poblada exitosamente.")
    print("   Admin:    admin@powerfix.com / Admin2024!")
    print("   Empleado: carlos@powerfix.com / Empleado2024!")


if __name__ == '__main__':
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run(db)
    finally:
        db.close()
