from fastapi import APIRouter, Depends, HTTPException

from src.models.recommendation import (
    PersonalizedRecommendationsResponse,
    SimilarProductsResponse,
)
from src.security.dependencies import get_current_user
from src.services.order_service import get_customer_orders
from src.services.personalized_recommendation import (
    get_personalized_candidates,
)
from src.services.product_service import get_products
from src.services.purchase_history import get_purchased_product_ids
from src.services.recommendation_cache import recommendation_cache
from src.services.recommendation_ranker import (
    rank_personalized_candidates,
)


router = APIRouter(
    prefix="/api/ai",
    tags=["Recommendations"],
)


@router.get(
    "/products/{product_id}/similar",
    response_model=SimilarProductsResponse,
)
async def get_similar_products(product_id: int):
    """
    Return products similar to the requested product.
    """

    try:
        products = await get_products()

        engine = recommendation_cache.get_engine(products)

        recommendations = engine.get_similar_products(
            product_id=product_id,
            limit=5,
        )

        return SimilarProductsResponse(
            productId=product_id,
            recommendations=recommendations,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to generate recommendations: {exc}",
        ) from exc


@router.get(
    "/recommendations",
    response_model=PersonalizedRecommendationsResponse,
)
async def get_recommendations(
    current_user: dict = Depends(get_current_user),
):
    """
    Return product recommendations for the
    authenticated customer.

    Customers with purchase history receive
    personalized recommendations.

    Customers without purchase history receive
    newest active products as a cold-start fallback.
    """

    customer_id = current_user.get("userId")

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="JWT does not contain userId.",
        )

    access_token = current_user.get("_access_token")

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Access token is not available.",
        )

    try:
        products = await get_products()

        orders = await get_customer_orders(
            customer_id=customer_id,
            access_token=access_token,
        )

        purchased_product_ids = get_purchased_product_ids(
            orders
        )

        candidates = get_personalized_candidates(
            products=products,
            purchased_product_ids=purchased_product_ids,
            limit=10,
        )

        if purchased_product_ids:
            recommendations = rank_personalized_candidates(
                products=products,
                purchased_product_ids=purchased_product_ids,
                candidate_products=candidates,
                limit=5,
            )
        else:
            recommendations = candidates[:5]

        return PersonalizedRecommendationsResponse(
            customerId=customer_id,
            recommendations=recommendations,
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to generate personalized "
                f"recommendations: {exc}"
            ),
        ) from exc