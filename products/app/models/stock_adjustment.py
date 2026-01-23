from pydantic import BaseModel

class StockAdjustment(BaseModel):
    adjustment: int  # Pode ser positivo (repor) ou negativo (perda/ajuste)
    reason: str