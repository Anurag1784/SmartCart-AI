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
            productName="Wireless Headphones",
            description="Wireless headphones for music",
            brand="Sony",
            category=Category(
                categoryId=2,
                categoryName="Audio",
            ),
            price=5000,
            status="ACTIVE",
            createdAt=datetime(2026, 9, 25, 10, 0, 0),
        ),
    ]


def test_purchased_products_are_not_recommended():
    products = create_test_products()

    candidates = get_personalized_candidates(
        products=products,
        purchased_product_ids=[1],
        limit=10,
    )

    candidate_ids = [
        product.productId
        for product in candidates
    ]

    assert 1 not in candidate_ids


def test_similar_products_are_generated():
    products = create_test_products()

    candidates = get_personalized_candidates(
        products=products,
        purchased_product_ids=[1],
        limit=10,
    )

    candidate_ids = [
        product.productId
        for product in candidates
    ]

    assert 2 in candidate_ids
    assert 3 in candidate_ids


def test_empty_purchase_history_returns_newest_products():
    products = create_test_products()

    candidates = get_personalized_candidates(
        products=products,
        purchased_product_ids=[],
        limit=2,
    )

    candidate_ids = [
        product.productId
        for product in candidates
    ]

    assert candidate_ids == [4, 2]


def test_duplicate_candidates_are_removed():
    products = create_test_products()

    candidates = get_personalized_candidates(
        products=products,
        purchased_product_ids=[1, 2],
        limit=10,
    )

    candidate_ids = [
        product.productId
        for product in candidates
    ]

    assert len(candidate_ids) == len(set(candidate_ids))