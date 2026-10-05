import os

from dotenv import load_dotenv


# Load environment variables from the .env file.
load_dotenv()


# JWT configuration.
JWT_SECRET = os.getenv("JWT_SECRET")


# Make sure the application does not start without
# the JWT secret configured.
if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured in the environment."
    )