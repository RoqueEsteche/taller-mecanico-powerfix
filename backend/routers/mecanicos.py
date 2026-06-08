from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import require_admin

router = APIRouter(prefix="/api/mecanicos", tags=["Mecánicos"])


@router.get("/", response_model=list[schemas.MecanicoResponse], summary="Listar mecánicos")
def listar_mecanicos(
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    return db.query(models.Mecanico).order_by(models.Mecanico.nombre).all()


@router.post("/", response_model=schemas.MecanicoResponse, status_code=201, summary="Crear mecánico")
def crear_mecanico(
    data: schemas.MecanicoCreate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    m = models.Mecanico(**data.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.put("/{mec_id}", response_model=schemas.MecanicoResponse, summary="Editar mecánico")
def editar_mecanico(
    mec_id: int,
    data: schemas.MecanicoCreate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    m = db.query(models.Mecanico).filter(models.Mecanico.id == mec_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mecánico no encontrado")
    for k, v in data.model_dump().items():
        setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return m


@router.patch("/{mec_id}/toggle", response_model=schemas.MecanicoResponse, summary="Activar/desactivar mecánico")
def toggle_mecanico(
    mec_id: int,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    m = db.query(models.Mecanico).filter(models.Mecanico.id == mec_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mecánico no encontrado")
    m.activo = not m.activo
    db.commit()
    db.refresh(m)
    return m


@router.delete("/{mec_id}", summary="Eliminar mecánico")
def eliminar_mecanico(
    mec_id: int,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    m = db.query(models.Mecanico).filter(models.Mecanico.id == mec_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mecánico no encontrado")
    db.delete(m)
    db.commit()
    return {"detail": "Mecánico eliminado"}
