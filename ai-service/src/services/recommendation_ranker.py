from collections import Counter

from src.models.product import Product
from src.services.recommendation_cache import recommendation_cache


def rank_personalized_candidates(
    products: list[Product],
    purchased_product_ids: list[int],
    candidate_products: list[Product],
    limit: int = 5,
) -> list[Product]:
    """
    Rank personalized recommendation candidates using
    the same cached TF-IDF + cosine similarity engine
    used by the similar-product recommendations.

    Purchase frequency is used as a weighting factor.
    """

    if not candidate_products:
        return []

    purchased_frequency = Counter(purchased_product_ids)

    purchased_ids = set(purchased_product_ids)

    purchased_products = [
        product
        for product in products
        if product.productId in purchased_ids
    ]

    if not purchased_products:
        return []

    engine = recommendation_cache.get_engine(products)

    product_indexes = {
        product.productId: index
        for index, product in enumerate(products)
    }

    ranked_candidates = []

    for candidate in candidate_products:
        candidate_index = product_indexes.get(candidate.productId)

        if candidate_index is None:
            continue

        score = 0.0

        for purchased_product in purchased_products:
            purchased_index = product_indexes.get(
                purchased_product.productId
            )

            if purchased_index is None:
                continue

            similarity = engine.similarity_matrix[
                purchased_index
            ][candidate_index]

            frequency = purchased_frequency[
                purchased_product.productId
            ]

            score += float(similarity) * frequency

        ranked_candidates.append(
            (candidate, score)
        )

    ranked_candidates.sort(
        key=lambda item: item[1],
        reverse=True,
    )

    return [
        candidate
        for candidate, score in ranked_candidates[:limit]
        if score > 0
    ]