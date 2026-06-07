from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import require_admin

router = APIRouter(prefix="/api/inventario", tags=["Inventario / Repuestos"])


@router.get("/", response_model=list[schemas.RepuestoResponse], summary="Listar repuestos")
def listar_repuestos(
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    return db.query(models.Repuesto).order_by(models.Repuesto.nombre).all()


@router.post("/", response_model=schemas.RepuestoResponse, status_code=201, summary="Crear repuesto")
def crear_repuesto(
    data: schemas.RepuestoCreate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    existing = db.query(models.Repuesto).filter(models.Repuesto.codigo == data.codigo).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un repuesto con ese código")
    r = models.Repuesto(**data.dict())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.put("/{rep_id}", response_model=schemas.RepuestoResponse, summary="Editar repuesto")
def editar_repuesto(
    rep_id: int,
    data: schemas.RepuestoCreate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    r = db.query(models.Repuesto).filter(models.Repuesto.id == rep_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Repuesto no encontrado")
    dup = db.query(models.Repuesto).filter(
        models.Repuesto.codigo == data.codigo,
        models.Repuesto.id != rep_id,
    ).first()
    if dup:
        raise HTTPException(status_code=400, detail="Código ya usado por otro repuesto")
    for k, v in data.dict().items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return r


@router.patch("/{rep_id}/stock", response_model=schemas.RepuestoResponse, summary="Ajustar stock")
def ajustar_stock(
    rep_id: int,
    data: schemas.AjusteStock,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    r = db.query(models.Repuesto).filter(models.Repuesto.id == rep_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Repuesto no encontrado")
    nuevo = r.stock + data.delta
    if nuevo < 0:
        raise HTTPException(status_code=400, detail="El stock no puede ser negativo")
    r.stock = nuevo
    db.commit()
    db.refresh(r)
    return r


@router.delete("/{rep_id}", summary="Eliminar repuesto")
def eliminar_repuesto(
    rep_id: int,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    r = db.query(models.Repuesto).filter(models.Repuesto.id == rep_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Repuesto no encontrado")
    db.delete(r)
    db.commit()
    return {"detail": "Repuesto eliminado"}
