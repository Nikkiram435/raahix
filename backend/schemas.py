# Request aur response ka shape. Yahin data check hota hai (email sahi hai, password lamba hai, etc.)

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name can't be empty.")
        return v

    @field_validator("password")
    @classmethod
    def password_bytes(cls, v: str) -> str:
        # bcrypt sirf pehle 72 bytes padhta hai, isliye usse lamba password mana hai
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password is too long.")
        return v


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut