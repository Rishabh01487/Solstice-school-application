"""
EduNexus School — Firebase Admin SDK Initialization and Token Verification.
"""
import base64
import json
import firebase_admin
from firebase_admin import credentials, auth
from app.config import get_settings

settings = get_settings()

def init_firebase():
    """Initialize Firebase Admin SDK."""
    if not firebase_admin._apps:
        if settings.FIREBASE_CREDENTIALS_BASE64:
            try:
                cred_json = json.loads(base64.b64decode(settings.FIREBASE_CREDENTIALS_BASE64).decode("utf-8"))
                cred = credentials.Certificate(cred_json)
                firebase_admin.initialize_app(cred)
            except Exception as e:
                print(f"Failed to load Firebase credentials: {e}")
                firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
        else:
            firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})

def verify_firebase_token(id_token: str) -> dict:
    """Verify a Firebase ID Token and return the decoded payload."""
    try:
        return auth.verify_id_token(id_token)
    except Exception as e:
        raise ValueError(f"Invalid Firebase token: {str(e)}")
