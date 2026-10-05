from pydantic import BaseModel
from typing import List, Optional


class OrderItem(BaseModel):
    productId: int
    sellerId: int
    quantity: int
    unitPrice: float
    subtotal: float


class Order(BaseModel):
    orderId: int
    customerId: int
    totalAmount: float
    orderStatus: str
    paymentStatus: str
    orderItems: List[OrderItem]
    cancelledAt: Optional[str] = None