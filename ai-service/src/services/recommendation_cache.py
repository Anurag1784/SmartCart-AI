from src.models.product import Product
from src.services.recommendation_engine import RecommendationEngine


class RecommendationCache:
    """
    In-memory cache for the recommendation engine.

    The engine is rebuilt when the product catalog changes.
    """

    def __init__(self):
        self._engine: RecommendationEngine | None = None
        self._product_signature: tuple = ()

    def get_engine(
        self,
        products: list[Product],
    ) -> RecommendationEngine:

        product_signature = tuple(
            (
                product.productId,
                product.productName,
                product.description,
                product.brand,
                (
                    product.category.categoryId
                    if product.category
                    else None
                ),
                (
                    product.category.categoryName
                    if product.category
                    else None
                ),
            )
            for product in products
        )

        if (
            self._engine is None
            or self._product_signature != product_signature
        ):
            self._engine = RecommendationEngine(products)
            self._product_signature = product_signature

        return self._engine


recommendation_cache = RecommendationCache()