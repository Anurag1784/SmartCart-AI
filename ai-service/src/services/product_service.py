import os

import httpx

from src.models.product import Product


PRODUCT_SERVICE_URL = os.getenv(
    "PRODUCT_SERVICE_URL",
    "http://localhost:8081"
)


async def get_products() -> list[Product]:
    url = f"{PRODUCT_SERVICE_URL}/api/products"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        response.raise_for_status()

        data = response.json()

    return [Product.model_validate(product) for product in data]