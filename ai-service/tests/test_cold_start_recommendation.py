from datetime import datetime

from src.models.product import Category, Product
from src.services.personalized_recommendation import (
    get_personalized_candidates,
)


def create_test_products() -> list[Product]:
    return [
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
            createdAt=datetime(2026, 9, 10, 10, 0, 0),
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
            createdAt=datetime(2026, 9, 20, 10, 0, 0),
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
            createdAt=datetime(2026, 9, 15, 10, 0, 0),
        ),
        Product(
            productId=4,
            productName="Samsung Phone",
            description="Smartphone with modern features",
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
            productId=5,
            productName="Old Inactive Product",
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


def test_no_purchase_history_returns_newest_active_products():
    products = create_test_products()

    candidates = get_personalized_candidates(
        products=products,
        purchased_product_ids=[],
        limit=3,
    )

    candidate_ids = [
        product.productId
        for product in candidates
    ]

    assert candidate_ids == [4, 2, 3]

    assert all(
        product.status == "ACTIVE"
        for product in candidates
    )

    assert len(candidates) == 3