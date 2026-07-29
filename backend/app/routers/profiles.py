from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, ArtistProfile
from app.schemas.user import ProfileOut, ProfileUpdate

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user.profile


@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(ArtistProfile).filter(ArtistProfile.user_id == current_user.id).first()

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
