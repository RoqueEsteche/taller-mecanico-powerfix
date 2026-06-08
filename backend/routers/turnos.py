from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import require_admin

router = APIRouter(prefix="/api/turnos", tags=["Agenda / Turnos"])

ESTADOS_VALIDOS = ["agendado", "confirmado", "en_curso", "completado", "no_show"]


@router.get("/", response_model=list[schemas.TurnoResponse], summary="Listar turnos (admin)")
def listar_turnos(db: Session = Depends(get_db), _: models.Usuario = Depends(require_admin)):
    return db.query(models.Turno).order_by(models.Turno.fecha, models.Turno.hora).all()


@router.post("/", response_model=schemas.TurnoResponse, status_code=201, summary="Crear turno (admin)")
def crear_turno(
    data: schemas.TurnoCreate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    turno = models.Turno(**data.model_dump(), estado="agendado")
    db.add(turno)
    db.commit()
    db.refresh(turno)
    return turno


@router.patch("/{turno_id}/estado", response_model=schemas.TurnoResponse, summary="Actualizar estado de turno (admin)")
def actualizar_estado_turno(
    turno_id: int,
    data: schemas.TurnoUpdateEstado,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    if data.estado not in ESTADOS_VALIDOS:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Opciones: {ESTADOS_VALIDOS}")
    t = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    t.estado = data.estado
    db.commit()
    db.refresh(t)
    return t


@router.put("/{turno_id}", response_model=schemas.TurnoResponse, summary="Editar turno (admin)")
def editar_turno(
    turno_id: int,
    data: schemas.TurnoCreate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    t = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    for k, v in data.model_dump().items():
        setattr(t, k, v)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/{turno_id}", summary="Eliminar turno (admin)")
def eliminar_turno(
    turno_id: int,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    t = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    db.delete(t)
    db.commit()
    return {"detail": "Turno eliminado"}
