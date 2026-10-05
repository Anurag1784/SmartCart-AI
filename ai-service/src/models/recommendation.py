from pydantic import BaseModel

from src.models.product import Product


class SimilarProductsResponse(BaseModel):
    productId: int
    recommendations: list[Product]


class PersonalizedRecommendationsResponse(BaseModel):
    customerId: int
    recommendations: list[Product]