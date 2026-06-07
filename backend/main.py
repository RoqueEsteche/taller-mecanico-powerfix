import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import engine, Base, get_db, SessionLocal
from routers import users, contacts, products, turnos, ordenes, mecanicos, inventario
import models
import schemas

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Auto-poblar la BD si está vacía (Render: filesystem efímero)."""
    db = SessionLocal()
    try:
        if db.query(models.Usuario).count() == 0:
            import seed
            seed.run(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="PowerFix API — Taller Mecánico Especializado",
    description="API REST del sistema de gestión interno PowerFix.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(contacts.router)
app.include_router(products.router)
app.include_router(turnos.router)
app.include_router(ordenes.router)
app.include_router(mecanicos.router)
app.include_router(inventario.router)


# ── Analytics ─────────────────────────────────────────────────────────────────
@app.post("/api/analytics/pageview", tags=["Analytics"])
def registrar_visita(data: schemas.PageViewCreate, db: Session = Depends(get_db)):
    db.add(models.PageView(pagina=data.pagina))
    db.commit()
    return {"ok": True}


# ── Stats generales ───────────────────────────────────────────────────────────
@app.get("/api/stats", response_model=schemas.StatsResponse, tags=["Analytics"])
def get_stats(db: Session = Depends(get_db)):
    def count_contactos(estado=None):
        q = db.query(func.count(models.Contacto.id))
        if estado:
            q = q.filter(models.Contacto.estado == estado)
        return q.scalar() or 0

    hoy = datetime.utcnow().strftime("%Y-%m-%d")

    # Órdenes de trabajo
    ordenes_activas = db.query(func.count(models.OrdenTrabajo.id)).filter(
        models.OrdenTrabajo.estado.in_(["recibido", "diagnosticando", "reparando"])
    ).scalar() or 0
    ordenes_listas = db.query(func.count(models.OrdenTrabajo.id)).filter(
        models.OrdenTrabajo.estado == "listo"
    ).scalar() or 0
    ordenes_hoy = db.query(func.count(models.OrdenTrabajo.id)).filter(
        func.date(models.OrdenTrabajo.created_at) == hoy
    ).scalar() or 0

    # Taller
    mecanicos_activos = db.query(func.count(models.Mecanico.id)).filter(
        models.Mecanico.activo == True
    ).scalar() or 0
    repuestos_bajo_stock = db.query(func.count(models.Repuesto.id)).filter(
        models.Repuesto.stock <= models.Repuesto.stock_minimo,
        models.Repuesto.activo == True,
    ).scalar() or 0

    return {
        "total_contactos":      count_contactos(),
        "contactos_nuevo":      count_contactos("nuevo"),
        "contactos_en_proceso": count_contactos("en_proceso"),
        "contactos_resuelto":   count_contactos("resuelto"),
        "contactos_cerrado":    count_contactos("cerrado"),
        "total_servicios":      db.query(func.count(models.Servicio.id)).scalar() or 0,
        "total_usuarios":       db.query(func.count(models.Usuario.id)).scalar() or 0,
        "total_visitas":        db.query(func.count(models.PageView.id)).scalar() or 0,
        "total_turnos":         db.query(func.count(models.Turno.id)).scalar() or 0,
        "turnos_hoy":           db.query(func.count(models.Turno.id)).filter(models.Turno.fecha == hoy).scalar() or 0,
        "turnos_pendientes":    db.query(func.count(models.Turno.id)).filter(
                                    models.Turno.estado.in_(["agendado", "confirmado", "en_curso"])
                                ).scalar() or 0,
        "total_ordenes":        db.query(func.count(models.OrdenTrabajo.id)).scalar() or 0,
        "ordenes_activas":      ordenes_activas,
        "ordenes_listas":       ordenes_listas,
        "ordenes_hoy":          ordenes_hoy,
        "mecanicos_activos":    mecanicos_activos,
        "repuestos_bajo_stock": repuestos_bajo_stock,
    }


# ── Datos para gráficos ───────────────────────────────────────────────────────
@app.get("/api/stats/charts", tags=["Analytics"])
def get_chart_data(db: Session = Depends(get_db)):
    maquinas_raw = (
        db.query(models.Contacto.tipo_maquina, func.count(models.Contacto.id))
        .group_by(models.Contacto.tipo_maquina).all()
    )
    estados_ot_raw = (
        db.query(models.OrdenTrabajo.estado, func.count(models.OrdenTrabajo.id))
        .group_by(models.OrdenTrabajo.estado).all()
    )
    hace_7_dias = datetime.utcnow() - timedelta(days=7)
    visitas_raw = (
        db.query(
            func.strftime("%Y-%m-%d", models.PageView.created_at).label("dia"),
            func.count(models.PageView.id),
        )
        .filter(models.PageView.created_at >= hace_7_dias)
        .group_by("dia").order_by("dia").all()
    )
    return {
        "maquinas":  {"labels": [r[0] for r in maquinas_raw],  "data": [r[1] for r in maquinas_raw]},
        "estados":   {"labels": [r[0] for r in estados_ot_raw], "data": [r[1] for r in estados_ot_raw]},
        "visitas":   {"labels": [r[0] for r in visitas_raw],    "data": [r[1] for r in visitas_raw]},
    }


# ── Clientes únicos ───────────────────────────────────────────────────────────
@app.get("/api/clientes", tags=["Clientes"])
def listar_clientes(db: Session = Depends(get_db)):
    rows = (
        db.query(
            models.Contacto.nombre,
            models.Contacto.apellido,
            models.Contacto.email,
            models.Contacto.telefono,
            func.count(models.Contacto.id).label("total_consultas"),
            func.max(models.Contacto.created_at).label("ultima_consulta"),
        )
        .group_by(models.Contacto.email)
        .order_by(func.max(models.Contacto.created_at).desc())
        .all()
    )
    return [
        {
            "nombre":          r.nombre,
            "apellido":        r.apellido,
            "email":           r.email,
            "telefono":        r.telefono,
            "total_consultas": r.total_consultas,
            "ultima_consulta": r.ultima_consulta.isoformat() if r.ultima_consulta else None,
        }
        for r in rows
    ]


@app.get("/api", tags=["Root"])
def root():
    return {"mensaje": "PowerFix API v2 activa", "docs": "/docs"}


# ── Frontend estático — DEBE IR AL FINAL ─────────────────────────────────────
_frontend = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')
if os.path.isdir(_frontend):
    app.mount("/", StaticFiles(directory=_frontend, html=True), name="frontend")
