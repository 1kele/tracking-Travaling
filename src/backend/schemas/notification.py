from pydantic import AwareDatetime, BaseModel, ConfigDict


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    sent_at: AwareDatetime
