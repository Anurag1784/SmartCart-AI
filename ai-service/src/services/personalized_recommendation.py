from src.models.product import Product
from src.services.recommendation_cache import recommendation_cache


def get_personalized_candidates(
    products: list[Product],
    purchased_product_ids: list[int],
    limit: int = 10,
) -> list[Product]:
    """
    Generate recommendation candidates.

    For customers with purchase history:
    - Find products similar to purchased products.
    - Exclude products already purchased.
    - Avoid duplicate recommendations.

    For customers without purchase history:
    - Use newest ACTIVE products as the cold-start fallback.
    - This provides useful recommendations without inventing
      popularity or sales signals.
    """

    purchased_ids = set(purchased_product_ids)

    # =========================================================
    # COLD-START FALLBACK
    # =========================================================

    if not purchased_ids:
        active_products = [
            product
            for product in products
            if product.status.upper() == "ACTIVE"
        ]

        active_products.sort(
            key=lambda product: (
                product.createdAt is not None,
                product.createdAt,
            ),
            reverse=True,
        )

        return active_products[:limit]

    # =========================================================
    # PERSONALIZED RECOMMENDATIONS
    # =========================================================

    engine = recommendation_cache.get_engine(products)

    candidates = []
    candidate_ids = set()

    for product_id in purchased_ids:
        try:
            similar_products = engine.get_similar_products(
                product_id=product_id,
                limit=5,
            )
        except ValueError:
            continue

        for product in similar_products:

            # Do not recommend a product the customer
            # has already purchased.
            if product.productId in purchased_ids:
                continue

            # Avoid duplicate recommendations.
            if product.productId in candidate_ids:
                continue

            candidates.append(product)
            candidate_ids.add(product.productId)

            if len(candidates) >= limit:
                return candidates

    return candidates