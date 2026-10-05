from datetime import date
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

MAX_TRIP_DAYS = 366

Destination = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]
Style = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=20)]
Activity = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]


class ExpenseIn(BaseModel):
    id: int
    category: Literal["Stay", "Transport", "Food", "Activities", "Shopping", "Other"]
    amount: float = Field(gt=0, le=100_000_000)
    note: str = Field(default="", max_length=60)


def check_plan(plan: dict[str, list[Activity]]) -> dict[str, list[Activity]]:
    if len(plan) > MAX_TRIP_DAYS:
        raise ValueError("Plan has too many days.")
    for key, items in plan.items():
        if not key.isdigit() or int(key) >= MAX_TRIP_DAYS:
            raise ValueError("Invalid day in plan.")
        if len(items) > 50:
            raise ValueError("Too many activities in one day.")
    return plan


def check_dates(start: date, end: date) -> None:
    if end < start:
        raise ValueError("End date can't be before the start date.")
    if (end - start).days + 1 > MAX_TRIP_DAYS:
        raise ValueError("A trip can be at most 366 days long.")


class TripCreate(BaseModel):
    destination: Destination
    start_date: date
    end_date: date
    travelers: int = Field(default=1, ge=1, le=20)
    budget: int = Field(default=0, ge=0, le=100_000_000)
    styles: list[Style] = Field(default_factory=list, max_length=6)

    @model_validator(mode="after")
    def dates_ok(self):
        check_dates(self.start_date, self.end_date)
        return self


class TripUpdate(BaseModel):
    destination: Destination | None = None
    start_date: date | None = None
    end_date: date | None = None
    travelers: int | None = Field(default=None, ge=1, le=20)
    budget: int | None = Field(default=None, ge=0, le=100_000_000)
    styles: list[Style] | None = Field(default=None, max_length=6)
    plan: dict[str, list[Activity]] | None = None
    expenses: list[ExpenseIn] | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def plan_ok(self):
        if self.plan is not None:
            check_plan(self.plan)
        return self


class TripOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    destination: str
    start_date: date
    end_date: date
    travelers: int
    budget: int
    styles: list[str]
    plan: dict[str, list[str]]
    expenses: list[ExpenseIn]
