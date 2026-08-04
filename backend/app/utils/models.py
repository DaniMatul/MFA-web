from pydantic import BaseModel



class User(BaseModel):
    email: str
    password: str | None = None
    role_id: int  | None = None