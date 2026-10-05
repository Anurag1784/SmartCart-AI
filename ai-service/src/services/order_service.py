import os

import httpx

from src.models.order import Order


ORDER_SERVICE_URL = os.getenv(
    "ORDER_SERVICE_URL",
    "http://localhost:8083"
)


async def get_customer_orders(
    customer_id: int,
    access_token: str,
) -> list[Order]:

    url = f"{ORDER_SERVICE_URL}/api/orders/customer/{customer_id}"

    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            url,
            headers=headers,
        )

        response.raise_for_status()

        data = response.json()

    return [
        Order.model_validate(order)
        for order in data
    ]