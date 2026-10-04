# /api/saved: saved places ki list, save karna, hatana. Sab login ke baad hi.
# place_id ab text hai: "f7" (featured place) ya Geoapify ki id.

import re

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth_routes import get_current_user
from database import get_db
from models import SavedPlace, User

router = APIRouter(prefix="/api/saved", tags=["saved"])

MAX_SAVED_PER_USER = 500

ID_RE = re.compile(r"[A-Za-z0-9_-]{1,100}")


def check_id(place_id: str) -> None:
    """Galat id (jaise 'bad.id' ya 101 akshar se lambi) ko 422 se roko."""
    if not ID_RE.fullmatch(place_id):
        raise HTTPException(status_code=422, detail="Invalid place id.")


@router.get("", response_model=list[str])
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
    place_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_id(place_id)

    already = db.scalar(
        select(SavedPlace.id).where(
            SavedPlace.user_id == user.id, SavedPlace.place_id == place_id
        )
    )
    if already:
        return Response(status_code=204)

    count = db.scalar(
        select(func.count()).select_from(SavedPlace).where(SavedPlace.user_id == user.id)
    )
    if count >= MAX_SAVED_PER_USER:
        raise HTTPException(status_code=400, detail="You have reached the limit of 500 saved places.")

    db.add(SavedPlace(user_id=user.id, place_id=place_id))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    return Response(status_code=204)


@router.delete("/{place_id}", status_code=204)
def unsave_place(
    place_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_id(place_id)

    db.execute(
        delete(SavedPlace).where(
            SavedPlace.user_id == user.id, SavedPlace.place_id == place_id
        )
    )
    db.commit()
    return Response(status_code=204)