from src.models.product import Category, Product
from src.services.recommendation_engine import RecommendationEngine


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


def test_similar_products_exclude_source_product():
    products = create_test_products()

    engine = RecommendationEngine(products)

    recommendations = engine.get_similar_products(
        product_id=1,
        limit=5,
    )

    recommended_ids = [
        product.productId
        for product in recommendations
    ]

    assert 1 not in recommended_ids


def test_similar_laptop_is_returned():
    products = create_test_products()

    engine = RecommendationEngine(products)

    recommendations = engine.get_similar_products(
        product_id=1,
        limit=5,
    )

    recommended_ids = [
        product.productId
        for product in recommendations
    ]

    assert 2 in recommended_ids


def test_zero_similarity_products_are_excluded():
    products = create_test_products()

    engine = RecommendationEngine(products)

    recommendations = engine.get_similar_products(
        product_id=1,
        limit=5,
    )

    recommended_ids = [
        product.productId
        for product in recommendations
    ]

    assert 3 not in recommended_ids


def test_unknown_product_raises_error():
    products = create_test_products()

    engine = RecommendationEngine(products)

    try:
        engine.get_similar_products(
            product_id=999,
            limit=5,
        )
        assert False
    except ValueError as exc:
        assert "999" in str(exc)