from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from database import get_db
import models
import schemas
from auth import require_admin

router = APIRouter(prefix="/api/ordenes", tags=["Órdenes de Trabajo"])

ESTADOS_VALIDOS = ["recibido", "diagnosticando", "reparando", "listo", "entregado", "cancelado"]


@router.get("/", response_model=list[schemas.OrdenTrabajoResponse], summary="Listar órdenes")
def listar_ordenes(
    estado: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    q = db.query(models.OrdenTrabajo)
    if estado:
        q = q.filter(models.OrdenTrabajo.estado == estado)
    return q.order_by(models.OrdenTrabajo.created_at.desc()).all()


@router.post("/", response_model=schemas.OrdenTrabajoResponse, status_code=201, summary="Crear orden")
def crear_orden(
    data: schemas.OrdenTrabajoCreate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    payload = data.dict()
    payload["estado"] = "recibido"
    ot = models.OrdenTrabajo(**payload)
    db.add(ot)
    db.flush()
    ot.numero = f"OT-{datetime.now().year}-{ot.id:04d}"
    ot.costo_total = (ot.costo_mano_obra or 0) + (ot.costo_repuestos or 0)
    db.commit()
    db.refresh(ot)
    return ot


@router.get("/{orden_id}", response_model=schemas.OrdenTrabajoResponse, summary="Detalle de orden")
def get_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    ot = db.query(models.OrdenTrabajo).filter(models.OrdenTrabajo.id == orden_id).first()
    if not ot:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return ot


@router.put("/{orden_id}", response_model=schemas.OrdenTrabajoResponse, summary="Editar orden")
def editar_orden(
    orden_id: int,
    data: schemas.OrdenTrabajoCreate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    ot = db.query(models.OrdenTrabajo).filter(models.OrdenTrabajo.id == orden_id).first()
    if not ot:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    for k, v in data.dict().items():
        setattr(ot, k, v)
    ot.costo_total = (ot.costo_mano_obra or 0) + (ot.costo_repuestos or 0)
    if ot.estado == "entregado" and not ot.fecha_entrega:
        ot.fecha_entrega = datetime.utcnow()
    db.commit()
    db.refresh(ot)
    return ot


@router.patch("/{orden_id}/estado", response_model=schemas.OrdenTrabajoResponse, summary="Cambiar estado")
def actualizar_estado_orden(
    orden_id: int,
    data: schemas.OrdenUpdateEstado,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    if data.estado not in ESTADOS_VALIDOS:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Opciones: {ESTADOS_VALIDOS}")
    ot = db.query(models.OrdenTrabajo).filter(models.OrdenTrabajo.id == orden_id).first()
    if not ot:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    ot.estado = data.estado
    if data.estado == "entregado" and not ot.fecha_entrega:
        ot.fecha_entrega = datetime.utcnow()
    db.commit()
    db.refresh(ot)
    return ot


@router.delete("/{orden_id}", summary="Eliminar orden")
def eliminar_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    ot = db.query(models.OrdenTrabajo).filter(models.OrdenTrabajo.id == orden_id).first()
    if not ot:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    db.delete(ot)
    db.commit()
    return {"detail": "Orden eliminada"}
