import asyncio
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi import HTTPException

from src.config import JWT_SECRET
from src.security.dependencies import get_current_user


def create_token(payload: dict) -> str:
    """
    Create a test JWT using the same signing secret
    and algorithm used by the Auth Service.
    """

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm="HS384",
    )


def assert_unauthorized(
    authorization: str | None,
    expected_detail: str,
):
    """
    Execute get_current_user() and verify that
    authentication is rejected with HTTP 401.
    """

    with pytest.raises(HTTPException) as exc_info:

        asyncio.run(
            get_current_user(authorization)
        )

    assert exc_info.value.status_code == 401

    assert exc_info.value.detail == expected_detail


def test_missing_authorization_header():
    assert_unauthorized(
        None,
        "Authorization header is required.",
    )


def test_invalid_authorization_header_format():
    assert_unauthorized(
        "Basic test-token",
        "Invalid Authorization header format.",
    )


def test_empty_bearer_token():
    assert_unauthorized(
        "Bearer   ",
        "Bearer token is required.",
    )


def test_invalid_jwt():
    assert_unauthorized(
        "Bearer invalid-token",
        "Invalid JWT token.",
    )


def test_expired_jwt():
    expired_token = create_token(
        {
            "userId": 5,
            "email": "customer@smartcart.com",
            "role": "CUSTOMER",
            "exp": datetime.now(
                timezone.utc
            ) - timedelta(minutes=1),
        }
    )

    assert_unauthorized(
        f"Bearer {expired_token}",
        "JWT token has expired.",
    )


def test_jwt_without_user_id():
    token = create_token(
        {
            "email": "customer@smartcart.com",
            "role": "CUSTOMER",
            "exp": datetime.now(
                timezone.utc
            ) + timedelta(minutes=10),
        }
    )

    assert_unauthorized(
        f"Bearer {token}",
        "JWT does not contain userId.",
    )


def test_valid_customer_jwt():
    token = create_token(
        {
            "userId": 5,
            "email": "customer@smartcart.com",
            "role": "CUSTOMER",
            "exp": datetime.now(
                timezone.utc
            ) + timedelta(minutes=10),
        }
    )

    payload = asyncio.run(
        get_current_user(
            f"Bearer {token}"
        )
    )

    assert payload["userId"] == 5
    assert payload["email"] == "customer@smartcart.com"
    assert payload["role"] == "CUSTOMER"

    assert payload["_access_token"] == token