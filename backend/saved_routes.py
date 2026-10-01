# /api/saved: saved places ki list, save karna, hatana. Sab login ke baad hi.

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Response
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth_routes import get_current_user
from database import get_db
from models import SavedPlace, User

router = APIRouter(prefix="/api/saved", tags=["saved"])

MAX_SAVED_PER_USER = 500

# Place id 1 se 1,000,000 ke beech hi maanya hai
PlaceId = Annotated[int, Path(ge=1, le=1_000_000)]


@router.get("", response_model=list[int])
def list_saved(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list(
        db.scalars(
            select(SavedPlace.place_id)
            .where(SavedPlace.user_id == user.id)
            .order_by(SavedPlace.id)
        ).all()
    )


@router.put("/{place_id}", status_code=204)
def save_place(
    place_id: PlaceId,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    already = db.scalar(
        select(SavedPlace.id).where(
            SavedPlace.user_id == user.id, SavedPlace.place_id == place_id
        )
    )
    if already:
        return Response(status_code=204)  # pehle se saved hai, koi dikkat nahi

    count = db.scalar(
        select(func.count()).select_from(SavedPlace).where(SavedPlace.user_id == user.id)
    )
    if count >= MAX_SAVED_PER_USER:
        raise HTTPException(status_code=400, detail="You have reached the limit of 500 saved places.")

    db.add(SavedPlace(user_id=user.id, place_id=place_id))
    try:
        db.commit()
    except IntegrityError:
        # Do request ek saath aayi aur doosri pehle ho gayi: yeh bhi theek hai
        db.rollback()
    return Response(status_code=204)


@router.delete("/{place_id}", status_code=204)
def unsave_place(
    place_id: PlaceId,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.execute(
        delete(SavedPlace).where(
            SavedPlace.user_id == user.id, SavedPlace.place_id == place_id
        )
    )
    db.commit()
    return Response(status_code=204)