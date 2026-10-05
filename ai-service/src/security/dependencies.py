from fastapi import Header, HTTPException

from src.security.jwt import decode_token


async def get_current_user(
    authorization: str | None = Header(default=None),
) -> dict:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is required.",
        )

    parts = authorization.split(" ", 1)

    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header format.",
        )

    access_token = parts[1].strip()

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Bearer token is required.",
        )

    try:
        payload = decode_token(access_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=401,
            detail=str(exc),
        ) from exc

    user_id = payload.get("userId")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="JWT does not contain userId.",
        )

    # Keep the original access token so that the AI service
    # can securely forward it to downstream services.
    payload["_access_token"] = access_token

    return payload