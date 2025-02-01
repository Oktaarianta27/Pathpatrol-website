import os
import firebase_admin
from firebase_admin import credentials, firestore, storage

# Load Firebase credentials and initialize Firebase Admin SDK
def initialize_firebase():
    cred_path = os.getenv('SERVICE_ACCOUNT_KEY_PATH')
    if not cred_path:
        raise ValueError("SERVICE_ACCOUNT_KEY_PATH environment variable is not set.")

    # Initialize Firebase Admin SDK with credentials
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {
        'storageBucket': os.getenv('STORAGE_BUCKET')
    })

# Get Firestore client
def get_firestore_client():
    return firestore.client()

# Get Storage bucket
def get_storage_bucket():
    return storage.bucket()
