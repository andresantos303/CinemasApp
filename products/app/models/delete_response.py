from pydantic import BaseModel, Field

class DeleteResponse(BaseModel):
    message: str = Field(
        ..., 
        description="Confirmation message", 
        json_schema_extra={"example": "Product deleted successfully"}
    )
    id: str = Field(
        ..., 
        description="ID of the deleted resource", 
        json_schema_extra={"example": "64fb56a..."}
    )