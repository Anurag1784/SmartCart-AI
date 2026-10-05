from src.models.product import Category, Product
from src.services.recommendation_ranker import (
    rank_personalized_candidates,
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


def test_ranker_returns_similar_candidates():
    products = create_test_products()

    candidate_products = [
        products[1],
        products[2],
    ]

    recommendations = rank_personalized_candidates(
        products=products,
        purchased_product_ids=[1],
        candidate_products=candidate_products,
        limit=5,
    )

    recommended_ids = [
        product.productId
        for product in recommendations
    ]

    assert 2 in recommended_ids
    assert 3 in recommended_ids


def test_ranker_keeps_equal_score_candidates():
    products = create_test_products()

    candidate_products = [
        products[2],
        products[1],
    ]

    recommendations = rank_personalized_candidates(
        products=products,
        purchased_product_ids=[1],
        candidate_products=candidate_products,
        limit=5,
    )

    recommended_ids = [
        product.productId
        for product in recommendations
    ]

    assert set(recommended_ids) == {2, 3}


def test_purchase_frequency_affects_ranking():
    products = create_test_products()

    candidate_products = [
        products[1],
        products[2],
    ]

    recommendations = rank_personalized_candidates(
        products=products,
        purchased_product_ids=[1, 1],
        candidate_products=candidate_products,
        limit=5,
    )

    recommended_ids = [
        product.productId
        for product in recommendations
    ]

    assert recommended_ids[0] == 2


def test_zero_score_candidates_are_excluded():
    products = create_test_products()

    candidate_products = [
        products[1],
        products[3],
    ]

    recommendations = rank_personalized_candidates(
        products=products,
        purchased_product_ids=[1],
        candidate_products=candidate_products,
        limit=5,
    )

    recommended_ids = [
        product.productId
        for product in recommendations
    ]

    assert 2 in recommended_ids
    assert 4 not in recommended_ids