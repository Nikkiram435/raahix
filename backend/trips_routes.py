# /api/trips: list, banana, ek trip dekhna, badalna, hatana. Sab login ke baad hi.

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from auth_routes import get_current_user
from database import get_db
from models import Trip, User
from trip_schemas import MAX_TRIP_DAYS, TripCreate, TripOut, TripUpdate

router = APIRouter(prefix="/api/trips", tags=["trips"])

MAX_TRIPS_PER_USER = 100


def get_owned_trip(db: Session, user: User, trip_id: int) -> Trip:
    """Sirf us user ki apni trip. Doosre ki ho ya na ho, jawab ek hi: 404."""
    trip = db.scalar(select(Trip).where(Trip.id == trip_id, Trip.user_id == user.id))
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return trip


@router.get("", response_model=list[TripOut])
def list_trips(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(
        select(Trip).where(Trip.user_id == user.id).order_by(Trip.start_date, Trip.id)
    ).all()


@router.post("", response_model=TripOut, status_code=201)
def create_trip(
    data: TripCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = db.scalar(select(func.count()).select_from(Trip).where(Trip.user_id == user.id))
    if count >= MAX_TRIPS_PER_USER:
        raise HTTPException(status_code=400, detail="You have reached the limit of 100 trips.")

    trip = Trip(user_id=user.id, plan={}, expenses=[], **data.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_owned_trip(db, user, trip_id)


@router.patch("/{trip_id}", response_model=TripOut)
def update_trip(
    trip_id: int,
    data: TripUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = get_owned_trip(db, user, trip_id)

    # Sirf wahi badlo jo bheja gaya hai (null wale ko chhod do)
    changes = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}

    start = changes.get("start_date", trip.start_date)
    end = changes.get("end_date", trip.end_date)
    if end < start:
        raise HTTPException(status_code=422, detail="End date can't be before the start date.")
    if (end - start).days + 1 > MAX_TRIP_DAYS:
        raise HTTPException(status_code=422, detail="A trip can be at most 366 days long.")

    for field, value in changes.items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=204)
def delete_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = get_owned_trip(db, user, trip_id)
    db.delete(trip)
    db.commit()
    return Response(status_code=204)