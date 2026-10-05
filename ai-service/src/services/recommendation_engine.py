from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from src.models.product import Product
from src.services.product_text import build_product_text


class RecommendationEngine:
    """
    Content-based recommendation engine using
    TF-IDF and cosine similarity.
    """

    def __init__(self, products: list[Product]):
        self.products = products

        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english"
        )

        product_texts = [
            build_product_text(product)
            for product in products
        ]

        self.tfidf_matrix = self.vectorizer.fit_transform(product_texts)

        self.similarity_matrix = cosine_similarity(
            self.tfidf_matrix
        )

    def get_similar_products(
        self,
        product_id: int,
        limit: int = 5
    ) -> list[Product]:
        """
        Return products with positive similarity
        to the given product.

        The requested product itself is excluded.
        """

        product_index = next(
            (
                index
                for index, product in enumerate(self.products)
                if product.productId == product_id
            ),
            None
        )

        if product_index is None:
            raise ValueError(
                f"Product with ID {product_id} was not found."
            )

        similarity_scores = self.similarity_matrix[product_index]

        ranked_indexes = similarity_scores.argsort()[::-1]

        similar_products = []

        for index in ranked_indexes:
            if index == product_index:
                continue

            # Ignore products with zero similarity.
            if similarity_scores[index] <= 0:
                continue

            similar_products.append(self.products[index])

            if len(similar_products) >= limit:
                break

        return similar_products