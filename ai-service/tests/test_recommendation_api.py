from datetime import datetime

from fastapi.testclient import TestClient

from src.main import app
from src.models.order import Order, OrderItem
from src.models.product import Category, Product
from src.routers import recommendation
from src.security.dependencies import get_current_user


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "UP"
    assert data["service"] == "smartcart-ai"


def test_similar_products_endpoint(monkeypatch):
    products = [
        Product(
            productId=1,
            productName="HP Laptop",
            description="Laptop for work and study",
            brand="HP",
            category=Category(
                categoryId=1,
                categoryName="Laptops",
            ),
            price=60000,
            status="ACTIVE",
        ),
        Product(
            productId=2,
            productName="Dell Laptop",
            description="Laptop for work and study",
            brand="Dell",
            category=Category(
                categoryId=1,
                categoryName="Laptops",
            ),
            price=55000,
            status="ACTIVE",
        ),
        Product(
            productId=3,
            productName="Wireless Headphones",
            description="Wireless headphones for music",
            brand="Sony",
            category=Category(
                categoryId=2,
                categoryName="Audio",
            ),
            price=5000,
            status="ACTIVE",
        ),
    ]

    async def mock_get_products():
        return products

    monkeypatch.setattr(
        recommendation,
        "get_products",
        mock_get_products,
    )

    response = client.get(
        "/api/ai/products/1/similar"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["productId"] == 1
    assert "recommendations" in data

    recommendation_ids = [
        product["productId"]
        for product in data["recommendations"]
    ]

    assert 1 not in recommendation_ids
    assert 2 in recommendation_ids
    assert 3 not in recommendation_ids


def test_similar_products_unknown_product_returns_404(
    monkeypatch,
):
    products = [
        Product(
            productId=1,
            productName="HP Laptop",
            description="Laptop for work and study",
            brand="HP",
            category=Category(
                categoryId=1,
                categoryName="Laptops",
            ),
            price=60000,
            status="ACTIVE",
        ),
    ]

    async def mock_get_products():
        return products

    monkeypatch.setattr(
        recommendation,
        "get_products",
        mock_get_products,
    )

    response = client.get(
        "/api/ai/products/999999/similar"
    )

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == (
        "Product with ID 999999 was not found."
    )


def test_similar_products_product_service_failure_returns_502(
    monkeypatch,
):
    async def mock_get_products():
        raise RuntimeError(
            "Product Service unavailable."
        )

    monkeypatch.setattr(
        recommendation,
        "get_products",
        mock_get_products,
    )

    response = client.get(
        "/api/ai/products/1/similar"
    )

    assert response.status_code == 502

    data = response.json()

    assert data["detail"] == (
        "Unable to generate recommendations: "
        "Product Service unavailable."
    )


def test_personalized_recommendations_endpoint(monkeypatch):
    products = [
        Product(
            productId=1,
            productName="HP Laptop",
            description="Laptop for work and study",
            brand="HP",
            category=Category(
                categoryId=1,
                categoryName="Laptops",
            ),
            price=60000,
            status="ACTIVE",
        ),
        Product(
            productId=2,
            productName="Dell Laptop",
            description="Laptop for work and study",
            brand="Dell",
            category=Category(
                categoryId=1,
                categoryName="Laptops",
            ),
            price=55000,
            status="ACTIVE",
        ),
        Product(
            productId=3,
            productName="Lenovo Laptop",
            description="Laptop for work and study",
            brand="Lenovo",
            category=Category(
                categoryId=1,
                categoryName="Laptops",
            ),
            price=50000,
            status="ACTIVE",
        ),
        Product(
            productId=4,
            productName="Wireless Headphones",
            description="Wireless headphones for music",
            brand="Sony",
            category=Category(
                categoryId=2,
                categoryName="Audio",
            ),
            price=5000,
            status="ACTIVE",
        ),
    ]

    orders = [
        Order(
            orderId=100,
            customerId=5,
            totalAmount=60000,
            orderStatus="CONFIRMED",
            paymentStatus="SUCCESS",
            orderItems=[
                OrderItem(
                    productId=1,
                    sellerId=1,
                    quantity=1,
                    unitPrice=60000,
                    subtotal=60000,
                )
            ],
        )
    ]

    async def mock_get_products():
        return products

    async def mock_get_customer_orders(
        customer_id: int,
        access_token: str,
    ):
        assert customer_id == 5
        assert access_token == "test-access-token"

        return orders

    async def mock_get_current_user():
        return {
            "userId": 5,
            "email": "customer@smartcart.com",
            "role": "CUSTOMER",
            "_access_token": "test-access-token",
        }

    monkeypatch.setattr(
        recommendation,
        "get_products",
        mock_get_products,
    )

    monkeypatch.setattr(
        recommendation,
        "get_customer_orders",
        mock_get_customer_orders,
    )

    app.dependency_overrides[get_current_user] = (
        mock_get_current_user
    )

    try:
        response = client.get(
            "/api/ai/recommendations"
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200

    data = response.json()

    assert data["customerId"] == 5
    assert "recommendations" in data

    recommendation_ids = [
        product["productId"]
        for product in data["recommendations"]
    ]

    assert 1 not in recommendation_ids
    assert 2 in recommendation_ids
    assert 3 in recommendation_ids
    assert 4 not in recommendation_ids


def test_personalized_recommendations_order_service_failure_returns_502(
    monkeypatch,
):
    products = [
        Product(
            productId=1,
            productName="HP Laptop",
            description="Laptop for work and study",
            brand="HP",
            category=Category(
                categoryId=1,
                categoryName="Laptops",
            ),
            price=60000,
            status="ACTIVE",
        ),
    ]

    async def mock_get_products():
        return products

    async def mock_get_customer_orders(
        customer_id: int,
        access_token: str,
    ):
        raise RuntimeError(
            "Order Service unavailable."
        )

    async def mock_get_current_user():
        return {
            "userId": 5,
            "email": "customer@smartcart.com",
            "role": "CUSTOMER",
            "_access_token": "test-access-token",
        }

    monkeypatch.setattr(
        recommendation,
        "get_products",
        mock_get_products,
    )

    monkeypatch.setattr(
        recommendation,
        "get_customer_orders",
        mock_get_customer_orders,
    )

    app.dependency_overrides[get_current_user] = (
        mock_get_current_user
    )

    try:
        response = client.get(
            "/api/ai/recommendations"
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 502

    data = response.json()

    assert data["detail"] == (
        "Unable to generate personalized recommendations: "
        "Order Service unavailable."
    )


def test_response_validation_rejects_invalid_recommendation_data(
    monkeypatch,
):
    products = [
        Product(
            productId=1,
            productName="HP Laptop",
            description="Laptop for work and study",
            brand="HP",
            category=Category(
                categoryId=1,
                categoryName="Laptops",
            ),
            price=60000,
            status="ACTIVE",
        ),
    ]

    async def mock_get_products():
        return products

    def mock_get_similar_products(
        product_id: int,
        limit: int,
    ):
        return [
            {
                "productId": "invalid-product-id",
                "productName": "Invalid Product",
                "price": "invalid-price",
                "status": "ACTIVE",
            }
        ]

    monkeypatch.setattr(
        recommendation,
        "get_products",
        mock_get_products,
    )

    monkeypatch.setattr(
        recommendation.recommendation_cache,
        "get_engine",
        lambda products: type(
            "MockEngine",
            (),
            {
                "get_similar_products": (
                    mock_get_similar_products
                )
            },
        )(),
    )

    response = client.get(
        "/api/ai/products/1/similar"
    )

    assert response.status_code == 502

    data = response.json()

    assert data["detail"].startswith(
        "Unable to generate recommendations:"
    )


def test_cold_start_recommendations_endpoint(monkeypatch):
    products = [
        Product(
            productId=1,
            productName="Old Laptop",
            description="Laptop for work and study",
            brand="HP",
            category=Category(
                categoryId=1,
                categoryName="Laptops",
            ),
            price=60000,
            status="ACTIVE",
            createdAt=datetime(2026, 9, 10, 10, 0, 0),
        ),
        Product(
            productId=2,
            productName="New Laptop",
            description="Latest laptop for work and study",
            brand="Dell",
            category=Category(
                categoryId=1,
                categoryName="Laptops",
            ),
            price=65000,
            status="ACTIVE",
            createdAt=datetime(2026, 9, 20, 10, 0, 0),
        ),
        Product(
            productId=3,
            productName="Newest Phone",
            description="Latest smartphone",
            brand="Samsung",
            category=Category(
                categoryId=2,
                categoryName="Mobile Phones",
            ),
            price=70000,
            status="ACTIVE",
            createdAt=datetime(2026, 9, 25, 10, 0, 0),
        ),
        Product(
            productId=4,
            productName="Inactive New Product",
            description="Inactive product",
            brand="Test",
            category=Category(
                categoryId=3,
                categoryName="Accessories",
            ),
            price=1000,
            status="INACTIVE",
            createdAt=datetime(2026, 9, 30, 10, 0, 0),
        ),
    ]

    async def mock_get_products():
        return products

    async def mock_get_customer_orders(
        customer_id: int,
        access_token: str,
    ):
        assert customer_id == 5
        assert access_token == "test-access-token"

        return []

    async def mock_get_current_user():
        return {
            "userId": 5,
            "email": "newcustomer@smartcart.com",
            "role": "CUSTOMER",
            "_access_token": "test-access-token",
        }

    monkeypatch.setattr(
        recommendation,
        "get_products",
        mock_get_products,
    )

    monkeypatch.setattr(
        recommendation,
        "get_customer_orders",
        mock_get_customer_orders,
    )

    app.dependency_overrides[get_current_user] = (
        mock_get_current_user
    )

    try:
        response = client.get(
            "/api/ai/recommendations"
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200

    data = response.json()

    assert data["customerId"] == 5
    assert "recommendations" in data

    recommendation_ids = [
        product["productId"]
        for product in data["recommendations"]
    ]

    assert recommendation_ids == [3, 2, 1]

    assert 4 not in recommendation_ids