from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProfileUpdate(BaseModel):
    discipline: str | None = None
    bio: str | None = None
    skills: str | None = None
    location: str | None = None


class ProfileOut(BaseModel):
    discipline: str | None
    bio: str | None
    skills: str | None
    location: str | None
    portfolio_views: int

    class Config:
        from_attributes = True
