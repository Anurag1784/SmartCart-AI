from typing import Any

import jwt

from src.config import JWT_SECRET


def decode_token(token: str) -> dict[str, Any]:
    """
    Validate and decode a SmartCart JWT.

    The token is created by the Auth Service using the shared
    HMAC signing secret.
    """

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS384"],
        )

        return payload

    except jwt.ExpiredSignatureError as exc:
        raise ValueError("JWT token has expired.") from exc

    except jwt.InvalidTokenError as exc:
        raise ValueError("Invalid JWT token.") from exc