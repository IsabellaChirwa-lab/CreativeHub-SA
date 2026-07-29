from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import DataProject, User
from app.schemas.data_project import DataProjectCreate, DataProjectOut, DataProjectUpdate

router = APIRouter(prefix="/data-projects", tags=["data-projects"])


@router.get("/me", response_model=list[DataProjectOut])
def list_my_data_projects(current_user: User = Depends(get_current_user)):
    return current_user.data_projects


@router.post("/me", response_model=DataProjectOut, status_code=status.HTTP_201_CREATED)
def create_data_project(
    payload: DataProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data_project = DataProject(
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        source=payload.source,
        pipeline_status=payload.pipeline_status,
        records_processed=payload.records_processed,
    )
    db.add(data_project)
    db.commit()
    db.refresh(data_project)
    return data_project


@router.put("/{project_id}", response_model=DataProjectOut)
def update_data_project(
    project_id: int,
    payload: DataProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data_project = (
        db.query(DataProject)
        .filter(DataProject.id == project_id, DataProject.user_id == current_user.id)
        .first()
    )
    if not data_project:
        raise HTTPException(status_code=404, detail="Data project not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(data_project, field, value)

    db.commit()
    db.refresh(data_project)
    return data_project
