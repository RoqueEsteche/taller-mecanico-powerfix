"""
Población de la base de datos con datos de prueba.
Ejecutar directamente:  python seed.py
También se invoca automáticamente desde main.py al iniciar si la BD está vacía.
"""
from database import SessionLocal, engine, Base
import models
from auth import hash_password


def run(db):
    """Insertar datos iniciales. Seguro de llamar varias veces (idempotente)."""

    # ── Usuarios ───────────────────────────────────────────────────────────────
    usuarios = [
        {"nombre": "Admin", "apellido": "PowerFix", "email": "admin@powerfix.com",
         "password": "Admin2024!", "rol": "admin"},
        {"nombre": "Carlos", "apellido": "Técnico", "email": "carlos@powerfix.com",
         "password": "Empleado2024!", "rol": "empleado"},
        {"nombre": "Juan", "apellido": "Pérez", "email": "juan@ejemplo.com",
         "password": "Cliente2024!", "rol": "cliente"},
    ]
    for u in usuarios:
        if not db.query(models.Usuario).filter(models.Usuario.email == u["email"]).first():
            db.add(models.Usuario(
                nombre=u["nombre"], apellido=u["apellido"], email=u["email"],
                password_hash=hash_password(u["password"]), rol=u["rol"],
            ))

    # ── Servicios ──────────────────────────────────────────────────────────────
    servicios = [
        {
            "nombre": "Reparación y Mantenimiento de Desmalezadoras",
            "categoria": "Jardinería",
            "descripcion": "Servicio completo para desmalezadoras a nafta y 2T. Revisión de carburador, filtros de aire y combustible, bujía, sistema de corte y limpieza general.",
            "precio_base": 2500.0,
            "imagen_path": "/assets/images/productos/desmalezadora.webp",
            "tiempo_estimado": "1-2 días hábiles",
        },
        {
            "nombre": "Servicio Técnico de Motosierras",
            "categoria": "Forestal",
            "descripcion": "Reparación integral de motosierras profesionales y domésticas. Afilado de cadena, ajuste de carburador, revisión de embrague, freno de cadena y sistema de aceite.",
            "precio_base": 3500.0,
            "imagen_path": "/assets/images/productos/motosierra.webp",
            "tiempo_estimado": "1-3 días hábiles",
        },
        {
            "nombre": "Mantenimiento de Cortacéspedes a Empuje",
            "categoria": "Jardinería",
            "descripcion": "Mantenimiento preventivo y correctivo de cortacéspedes de empuje. Afilado y balanceo de cuchilla, limpieza de filtros y ajuste de motor a nafta.",
            "precio_base": 2000.0,
            "imagen_path": "/assets/images/productos/cortacesped.webp",
            "tiempo_estimado": "1-2 días hábiles",
        },
        {
            "nombre": "Reparación de Tractores Cortacésped",
            "categoria": "Jardinería",
            "descripcion": "Servicio especializado para tractores cortacésped a nafta y diesel. Revisión de transmisión, sistema de corte, correas de transmisión y motor.",
            "precio_base": 8000.0,
            "imagen_path": "/assets/images/productos/tractor.webp",
            "tiempo_estimado": "3-7 días hábiles",
        },
        {
            "nombre": "Servicio de Sopladoras",
            "categoria": "Jardinería",
            "descripcion": "Mantenimiento y reparación de sopladoras de hojas a nafta y eléctricas. Limpieza de filtros, carburador y revisión del impeller para máximo caudal de aire.",
            "precio_base": 1800.0,
            "imagen_path": "/assets/images/productos/sopladora.webp",
            "tiempo_estimado": "1 día hábil",
        },
        {
            "nombre": "Reparación de Fumigadoras Motorizadas",
            "categoria": "Agricultura",
            "descripcion": "Servicio técnico para fumigadoras motorizadas a nafta y 2T. Revisión de bomba, mangueras, lanzas de aplicación y motor. Ajuste de presión y caudal.",
            "precio_base": 3000.0,
            "imagen_path": "/assets/images/productos/fumigadora.webp",
            "tiempo_estimado": "2-3 días hábiles",
        },
        {
            "nombre": "Mantenimiento de Generadores Eléctricos",
            "categoria": "Energía",
            "descripcion": "Servicio completo para generadores a nafta y diesel de cualquier potencia. Revisión de AVR, alternador, bobinado y motor. Prueba de carga incluida.",
            "precio_base": 6000.0,
            "imagen_path": "/assets/images/productos/generador.webp",
            "tiempo_estimado": "2-4 días hábiles",
        },
        {
            "nombre": "Reparación de Motobombas de Agua",
            "categoria": "Agua",
            "descripcion": "Servicio técnico para motobombas a nafta y diesel. Revisión de impeller, sello mecánico, cebador y motor para restablecer el máximo caudal de bombeo.",
            "precio_base": 3500.0,
            "imagen_path": "/assets/images/productos/motobomba.webp",
            "tiempo_estimado": "1-2 días hábiles",
        },
        {
            "nombre": "Servicio de Motores Estacionarios",
            "categoria": "Energía",
            "descripcion": "Mantenimiento y reparación mayor de motores estacionarios diesel y nafta. Rectificación de cigüeñal, cambio de anillos, rebabado de culata y ajuste de válvulas.",
            "precio_base": 7500.0,
            "imagen_path": "/assets/images/productos/motor_estacionario.webp",
            "tiempo_estimado": "5-10 días hábiles",
        },
    ]
    for s in servicios:
        if not db.query(models.Servicio).filter(models.Servicio.nombre == s["nombre"]).first():
            db.add(models.Servicio(**s))

    # ── Contactos de prueba ────────────────────────────────────────────────────
    if db.query(models.Contacto).count() == 0:
        contactos_prueba = [
            {"nombre": "María", "apellido": "González", "email": "maria@mail.com", "telefono": "3814001234",
             "tipo_maquina": "Desmalezadora", "descripcion": "No arranca después del invierno, necesita revisión completa.", "estado": "nuevo"},
            {"nombre": "Roberto", "apellido": "Silva", "email": "roberto@mail.com", "telefono": "3814005678",
             "tipo_maquina": "Generador", "descripcion": "Pierde potencia bajo carga y el AVR falla intermitentemente.", "estado": "en_proceso"},
            {"nombre": "Ana", "apellido": "Torres", "email": "ana@mail.com", "telefono": "3814009012",
             "tipo_maquina": "Motosierra", "descripcion": "La cadena se traba y hay pérdida de aceite de la barra.", "estado": "resuelto"},
            {"nombre": "Luis", "apellido": "Martínez", "email": "luis@mail.com", "telefono": "3814003456",
             "tipo_maquina": "Motobomba de Agua", "descripcion": "No ceba correctamente y tiene pérdida por el sello.", "estado": "nuevo"},
            {"nombre": "Pedro", "apellido": "Ramírez", "email": "pedro@mail.com", "telefono": "3814007890",
             "tipo_maquina": "Cortacésped (empuje)", "descripcion": "Golpetea en ralentí y la cuchilla vibra mucho.", "estado": "cerrado"},
            {"nombre": "Sofía", "apellido": "López", "email": "sofia@mail.com", "telefono": "3814002345",
             "tipo_maquina": "Fumigadora", "descripcion": "La bomba no genera presión suficiente para la lanza.", "estado": "nuevo"},
        ]
        for c in contactos_prueba:
            db.add(models.Contacto(**c))

    # ── Page views de prueba ───────────────────────────────────────────────────
    if db.query(models.PageView).count() == 0:
        for p in ["inicio", "servicios", "contacto", "inicio", "servicios", "inicio", "admin"]:
            db.add(models.PageView(pagina=p))

    # ── Turnos de prueba ───────────────────────────────────────────────────────
    if db.query(models.Turno).count() == 0:
        from datetime import date, timedelta
        hoy = date.today()
        turnos_prueba = [
            {
                "cliente_nombre": "Carlos Rodríguez", "cliente_email": "carlos@mail.com",
                "cliente_telefono": "3814101010",
                "vehiculo": "Motosierra Stihl MS 250", "mecanico": "Técnico 1",
                "servicio": "Afilado de cadena y ajuste de carburador",
                "fecha": (hoy + timedelta(days=1)).strftime("%Y-%m-%d"), "hora": "09:00",
                "estado": "confirmado", "notas": "Traer cadena de repuesto",
            },
            {
                "cliente_nombre": "Laura Sánchez", "cliente_email": "laura@mail.com",
                "cliente_telefono": "3814202020",
                "vehiculo": "Cortacésped Husqvarna LC 140", "mecanico": "Técnico 2",
                "servicio": "Mantenimiento preventivo completo",
                "fecha": (hoy + timedelta(days=1)).strftime("%Y-%m-%d"), "hora": "11:00",
                "estado": "agendado",
            },
            {
                "cliente_nombre": "Jorge Medina", "cliente_email": "jorge@mail.com",
                "cliente_telefono": "3814303030",
                "vehiculo": "Generador Briggs & Stratton 5500W", "mecanico": "Técnico 1",
                "servicio": "Revisión de AVR y prueba de carga",
                "fecha": (hoy + timedelta(days=2)).strftime("%Y-%m-%d"), "hora": "10:30",
                "estado": "agendado",
            },
            {
                "cliente_nombre": "Ana Torres", "cliente_email": "ana@mail.com",
                "cliente_telefono": "3814404040",
                "vehiculo": "Desmalezadora Kawasaki TJ 45E", "mecanico": "Técnico 2",
                "servicio": "Diagnóstico y reparación de embrague centrífugo",
                "fecha": hoy.strftime("%Y-%m-%d"), "hora": "14:00",
                "estado": "en_curso",
            },
            {
                "cliente_nombre": "Pedro Ramírez", "cliente_email": "pedro@mail.com",
                "cliente_telefono": "3814505050",
                "vehiculo": "Motobomba Honda WX10", "mecanico": "Técnico 1",
                "servicio": "Cambio de sello mecánico e impeller",
                "fecha": (hoy - timedelta(days=1)).strftime("%Y-%m-%d"), "hora": "09:30",
                "estado": "completado", "notas": "Se entregó con prueba de caudal",
            },
            {
                "cliente_nombre": "Sofía López", "cliente_email": "sofia@mail.com",
                "cliente_telefono": "3814606060",
                "vehiculo": "Fumigadora Agria 2600", "mecanico": "Técnico 2",
                "servicio": "Revisión de bomba y regulación de presión",
                "fecha": (hoy - timedelta(days=2)).strftime("%Y-%m-%d"), "hora": "15:00",
                "estado": "no_show", "notas": "No se presentó, reagendar",
            },
        ]
        for t in turnos_prueba:
            db.add(models.Turno(**t))

    db.commit()
    print("OK - Base de datos poblada exitosamente.")
    print("   Admin: admin@powerfix.com / Admin2024!")
    print("   Empleado: carlos@powerfix.com / Empleado2024!")


if __name__ == '__main__':
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run(db)
    finally:
        db.close()
