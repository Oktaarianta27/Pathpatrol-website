from flask import Flask
from flask_cors import CORS
from datetime import timedelta
from firebase_admin import credentials, firestore, storage
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(
        __name__,
        template_folder=os.path.join(os.path.dirname(__file__), 'templates') 
    )
    app.secret_key = os.getenv('SECRET_KEY')
    CORS(app)

    app.config.update(
    SESSION_COOKIE_SECURE=True,  # Ensure cookies are sent over HTTPS
    SESSION_COOKIE_HTTPONLY=True,  # Prevent JavaScript access to cookies
    SESSION_COOKIE_SAMESITE='Lax',  # Strict or Lax to prevent CSRF
    PERMANENT_SESSION_LIFETIME=timedelta(days=1),  # Expiration period
    SESSION_REFRESH_EACH_REQUEST=True
    )

    from app.routes.public import public_bp
    from app.routes.auth import auth_bp
    from app.routes.private import private_bp
    from app.routes.api import api_bp

    app.register_blueprint(public_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(private_bp)
    app.register_blueprint(api_bp)

    return app