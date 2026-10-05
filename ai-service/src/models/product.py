from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Category(BaseModel):
    categoryId: int
    categoryName: str


class Product(BaseModel):
    productId: int
    productName: str
    description: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[Category] = None
    price: float
    status: str
    imageUrl: Optional[str] = None
    sellerId: Optional[int] = None
    sku: Optional[str] = None
    createdAt: Optional[datetime] = None