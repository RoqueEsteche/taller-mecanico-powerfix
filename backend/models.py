from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.sql import func
from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"
    id            = Column(Integer, primary_key=True, index=True)
    nombre        = Column(String(100), nullable=False)
    apellido      = Column(String(100), nullable=False)
    email         = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol           = Column(String(20), default="cliente")  # admin|empleado|cliente
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


class Contacto(Base):
    __tablename__ = "contactos"
    id           = Column(Integer, primary_key=True, index=True)
    nombre       = Column(String(100), nullable=False)
    apellido     = Column(String(100), nullable=False)
    email        = Column(String(150), nullable=False)
    telefono     = Column(String(20), nullable=False)
    tipo_maquina = Column(String(100), nullable=False)
    descripcion  = Column(Text, nullable=False)
    estado       = Column(String(20), default="nuevo")  # nuevo|en_proceso|resuelto|cerrado
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


class Servicio(Base):
    __tablename__ = "servicios"
    id              = Column(Integer, primary_key=True, index=True)
    nombre          = Column(String(200), nullable=False)
    categoria       = Column(String(100), nullable=False)
    descripcion     = Column(Text, nullable=False)
    precio_base     = Column(Float, nullable=False)
    imagen_path     = Column(String(300), nullable=False)
    disponible      = Column(Boolean, default=True)
    tiempo_estimado = Column(String(50))
    created_at      = Column(DateTime(timezone=True), server_default=func.now())


class PageView(Base):
    __tablename__ = "page_views"
    id         = Column(Integer, primary_key=True, index=True)
    pagina     = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Turno(Base):
    __tablename__ = "turnos"
    id               = Column(Integer, primary_key=True, index=True)
    cliente_nombre   = Column(String(200), nullable=False)
    cliente_email    = Column(String(150))
    cliente_telefono = Column(String(20))
    vehiculo         = Column(String(200), nullable=False)
    servicio         = Column(String(200), nullable=False)
    fecha            = Column(String(10), nullable=False)   # YYYY-MM-DD
    hora             = Column(String(5),  nullable=False)   # HH:MM
    mecanico         = Column(String(100))
    estado           = Column(String(20), default="agendado")  # agendado|confirmado|en_curso|completado|no_show
    notas            = Column(Text)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())


# ── Módulos de gestión interna ─────────────────────────────────────────────────

class Mecanico(Base):
    __tablename__ = "mecanicos"
    id           = Column(Integer, primary_key=True, index=True)
    nombre       = Column(String(100), nullable=False)
    apellido     = Column(String(100), nullable=False)
    telefono     = Column(String(20))
    email        = Column(String(150))
    especialidad = Column(String(200))
    activo       = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


class OrdenTrabajo(Base):
    __tablename__ = "ordenes_trabajo"
    id                  = Column(Integer, primary_key=True, index=True)
    numero              = Column(String(20), unique=True, index=True)       # OT-2024-0001
    cliente_nombre      = Column(String(200), nullable=False)
    cliente_email       = Column(String(150))
    cliente_telefono    = Column(String(20))
    vehiculo            = Column(String(300), nullable=False)
    descripcion_problema= Column(Text, nullable=False)
    diagnostico         = Column(Text)
    trabajo_realizado   = Column(Text)
    mecanico_id         = Column(Integer)                                   # ref a Mecanico.id
    mecanico_nombre     = Column(String(150))                               # desnormalizado para display
    estado              = Column(String(20), default="recibido")            # recibido|diagnosticando|reparando|listo|entregado|cancelado
    prioridad           = Column(String(10), default="normal")              # baja|normal|alta|urgente
    costo_mano_obra     = Column(Float, default=0.0)
    costo_repuestos     = Column(Float, default=0.0)
    costo_total         = Column(Float, default=0.0)
    fecha_estimada      = Column(String(10))                                # YYYY-MM-DD
    fecha_entrega       = Column(DateTime(timezone=True))
    notas_internas      = Column(Text)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())


class Repuesto(Base):
    __tablename__ = "repuestos"
    id            = Column(Integer, primary_key=True, index=True)
    codigo        = Column(String(50), unique=True, index=True)
    nombre        = Column(String(200), nullable=False)
    descripcion   = Column(Text)
    categoria     = Column(String(100))
    stock         = Column(Integer, default=0)
    stock_minimo  = Column(Integer, default=5)
    precio_costo  = Column(Float, default=0.0)
    precio_venta  = Column(Float, default=0.0)
    proveedor     = Column(String(200))
    ubicacion     = Column(String(100))
    activo        = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
