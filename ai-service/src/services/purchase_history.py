from src.models.order import Order


def get_purchased_product_ids(
    orders: list[Order],
) -> list[int]:
    """
    Extract product IDs from valid customer purchases.

    A purchase is considered valid when:
    - Payment status is SUCCESS
    - Order status is not CANCELLED

    REFUNDED payments are intentionally not included yet.
    """

    purchased_product_ids = []

    for order in orders:
        if order.paymentStatus != "SUCCESS":
            continue

        if order.orderStatus == "CANCELLED":
            continue

        for item in order.orderItems:
            purchased_product_ids.append(item.productId)

    return purchased_product_ids