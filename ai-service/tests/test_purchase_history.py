from src.models.order import Order, OrderItem
from src.services.purchase_history import get_purchased_product_ids


def create_order(
    order_id: int,
    order_status: str,
    payment_status: str,
    product_id: int,
) -> Order:
    return Order(
        orderId=order_id,
        customerId=5,
        totalAmount=1000,
        orderStatus=order_status,
        paymentStatus=payment_status,
        orderItems=[
            OrderItem(
                productId=product_id,
                sellerId=1,
                quantity=1,
                unitPrice=1000,
                subtotal=1000,
            )
        ],
    )


def test_successful_non_cancelled_order_counts_as_purchase():
    orders = [
        create_order(
            1,
            "CONFIRMED",
            "SUCCESS",
            10,
        )
    ]

    purchased = get_purchased_product_ids(orders)

    assert purchased == [10]


def test_cancelled_order_is_excluded():
    orders = [
        create_order(
            1,
            "CANCELLED",
            "SUCCESS",
            10,
        )
    ]

    purchased = get_purchased_product_ids(orders)

    assert purchased == []


def test_pending_payment_is_excluded():
    orders = [
        create_order(
            1,
            "PENDING_PAYMENT",
            "PENDING",
            10,
        )
    ]

    purchased = get_purchased_product_ids(orders)

    assert purchased == []


def test_failed_payment_is_excluded():
    orders = [
        create_order(
            1,
            "PENDING_PAYMENT",
            "FAILED",
            10,
        )
    ]

    purchased = get_purchased_product_ids(orders)

    assert purchased == []


def test_multiple_order_items_are_extracted():
    orders = [
        Order(
            orderId=1,
            customerId=5,
            totalAmount=3000,
            orderStatus="CONFIRMED",
            paymentStatus="SUCCESS",
            orderItems=[
                OrderItem(
                    productId=10,
                    sellerId=1,
                    quantity=1,
                    unitPrice=1000,
                    subtotal=1000,
                ),
                OrderItem(
                    productId=20,
                    sellerId=2,
                    quantity=2,
                    unitPrice=1000,
                    subtotal=2000,
                ),
            ],
        )
    ]

    purchased = get_purchased_product_ids(orders)

    assert purchased == [10, 20]