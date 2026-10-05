from src.models.product import Product


def build_product_text(product: Product) -> str:
    """
    Build the textual representation used by the
    recommendation engine.

    The AI uses product name, description, brand,
    and category name as content features.
    """

    parts = [
        product.productName,
        product.description,
        product.brand,
    ]

    if product.category:
        parts.append(product.category.categoryName)

    return " ".join(
        part.strip()
        for part in parts
        if part and part.strip()
    )