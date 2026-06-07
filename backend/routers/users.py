from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import verify_password, hash_password, create_access_token, get_current_user, require_admin

router = APIRouter(prefix="/api/users", tags=["Usuarios"])


@router.post("/login", response_model=schemas.Token, summary="Iniciar sesión")
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Cuenta inactiva")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "usuario": user}


@router.get("/me", response_model=schemas.UsuarioResponse, summary="Usuario actual")
def get_me(current_user: models.Usuario = Depends(get_current_user)):
    return current_user


@router.post("/register", response_model=schemas.UsuarioResponse, status_code=201, summary="Registro público")
def register(data: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(models.Usuario).filter(models.Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    db_user = models.Usuario(
        nombre=data.nombre,
        apellido=data.apellido,
        email=data.email,
        password_hash=hash_password(data.password),
        rol="cliente",  # registro público siempre crea clientes
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/", response_model=list[schemas.UsuarioResponse], summary="Listar usuarios (admin)")
def list_users(db: Session = Depends(get_db), _: models.Usuario = Depends(require_admin)):
    return db.query(models.Usuario).order_by(models.Usuario.created_at.desc()).all()


@router.post("/admin-create", response_model=schemas.UsuarioResponse, status_code=201, summary="Crear usuario (admin)")
def admin_create_user(
    data: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    if db.query(models.Usuario).filter(models.Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    db_user = models.Usuario(
        nombre=data.nombre,
        apellido=data.apellido,
        email=data.email,
        password_hash=hash_password(data.password),
        rol=data.rol or "cliente",
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{user_id}", response_model=schemas.UsuarioResponse, summary="Editar usuario (admin)")
def update_user(
    user_id: int,
    data: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
    _: models.Usuario = Depends(require_admin),
):
    user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.nombre   = data.nombre
    user.apellido = data.apellido
    user.email    = data.email
    user.rol      = data.rol
    if data.password:
        user.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/toggle", response_model=schemas.UsuarioResponse, summary="Activar/desactivar usuario (admin)")
def toggle_user(
    user_id: int,
    db: Session = Depends(get_db),
    current: models.Usuario = Depends(require_admin),
):
    if user_id == current.id:
        raise HTTPException(status_code=400, detail="No podés desactivarte a vos mismo")
    user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
