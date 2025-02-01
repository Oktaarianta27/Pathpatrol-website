import logging
from flask import jsonify, request, Blueprint
from werkzeug.utils import secure_filename
import os
import requests
from google.cloud import storage, firestore

# Import Firebase configuration
from app.services.config import initialize_firebase, get_firestore_client, get_storage_bucket

# Initialize Firebase (ensure this is called once during app startup)
initialize_firebase()

# Get Firestore and Storage instances
db = get_firestore_client()
bucket = get_storage_bucket()

# Firestore Configuration
FIRESTORE_BASE_URL = os.getenv('FIRESTORE_BASE_URL')
API_KEY = os.getenv('FIREBASE_API_KEY')
STORAGE_BASE_URL = os.getenv('STORAGE_BUCKETL')

api_bp = Blueprint('api', __name__)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@api_bp.route("/get_data_kerusakan", methods=["GET"])
def get_data_kerusakan():
    try:
        response = requests.get(f"{FIRESTORE_BASE_URL}?key={API_KEY}")
        if response.status_code != 200:
            logger.error(f"Failed to fetch data from Firestore: {response.status_code}")
            return jsonify({"error": response.json()}), response.status_code

        documents = response.json().get("documents", [])
        if not documents:
            logger.info("No documents found in Firestore")
            return jsonify({"message": "No documents found"}), 404

        results = [
            {
                "id": doc.get("name", "").split("/")[-1],
                "id_perangkat": doc.get("fields", {}).get("id_perangkat", {}).get("stringValue", "N/A"),
                "image_url": doc.get("fields", {}).get("image_url", {}).get("stringValue", "No Image"),
                "latitude": doc.get("fields", {}).get("latitude", {}).get("doubleValue"),
                "longitude": doc.get("fields", {}).get("longitude", {}).get("doubleValue"),
                "damage_type": doc.get("fields", {}).get("damage_type", {}).get("stringValue", "unknown"),
                "timestamp": doc.get("fields", {}).get("timestamp", {}).get("timestampValue", "N/A"),
                "bbox_height": doc.get("fields", {}).get("bbox_height", {}).get("integerValue", 0),
                "bbox_width": doc.get("fields", {}).get("bbox_width", {}).get("integerValue", 0),
                "Tingkat": doc.get("fields", {}).get("Tingkat", {}).get("stringValue", "N/A"),
                "status": doc.get("fields", {}).get("status", {}).get("stringValue", "N/A"),
                "proof_image_url": doc.get("fields", {}).get("proof_image_url", {}).get("stringValue", "N/A"),
                "repair_status": doc.get("fields", {}).get("repair_status", {}).get("stringValue", "N/A"),
            }
            for doc in documents
        ]
        return jsonify(results), 200
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500


def get_firestore_document(doc_id):
    doc_url = f"{FIRESTORE_BASE_URL}{doc_id}?key={API_KEY}"
    response = requests.get(doc_url)
    if response.status_code != 200:
        raise ValueError("Document not found")
    return response.json()

def delete_firestore_document(doc_id):
    delete_doc_url = f"{FIRESTORE_BASE_URL}{doc_id}?key={API_KEY}"
    response = requests.delete(delete_doc_url)
    if response.status_code != 200:
        raise ValueError("Failed to delete document from Firestore")

@api_bp.route('/delete/<string:id>', methods=['DELETE'])
def delete_data(id):
    try:
        document = get_firestore_document(id)
        image_url = document.get("fields", {}).get("image_url", {}).get("stringValue", "")
        image_delete_error = None

        if image_url:
            try:
                bucket = storage.bucket()
                blob_name = image_url.split("/")[-1]
                blob = bucket.blob(blob_name)
                blob.delete()
            except Exception as e:
                image_delete_error = f"Failed to delete image: {str(e)}"

        delete_firestore_document(id)

        if image_delete_error:
            return jsonify({
                "message": "Document deleted successfully, but image deletion failed.",
                "image_delete_error": image_delete_error
            }), 200

        return jsonify({"message": "Record and image deleted successfully"}), 200
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500



@api_bp.route('/update_data/<string:id>', methods=['PATCH'])
def update_document(id):
    updates = request.json
    if not updates:
        return jsonify({"error": "At least one field is required for update"}), 400
    try:
        doc_ref = db.collection("road_detections").document(id)
        if not doc_ref.get().exists:
            return jsonify({"error": "Document not found"}), 404

        allowed_fields = {"status", "Tingkat"}
        filtered_updates = {key: value for key, value in updates.items() if key in allowed_fields}

        if not filtered_updates:
            return jsonify({"error": "No valid fields provided"}), 400

        doc_ref.update(filtered_updates)
        
        # Mengambil data terbaru setelah update
        updated_doc = doc_ref.get().to_dict()
        
        return jsonify({"id": id, "updated_fields": updated_doc}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Menentukan ekstensi file yang diperbolehkan
ALLOWED_EXTENSIONS = {'jpg', 'jpeg'}

# Fungsi untuk memeriksa ekstensi file
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api_bp.route('/upload_data/<string:id>', methods=['POST'])
def upload_image(id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        # Menyimpan file dengan nama yang aman
        filename = secure_filename(file.filename)
        
        # Menyimpan file ke Firebase Cloud Storage
        bucket = storage.bucket()
        blob = bucket.blob(f"Repair/{filename}")
        blob.upload_from_file(file)
        
        # Mendapatkan URL gambar setelah di-upload
        image_url = blob.public_url

        # Menyimpan URL gambar ke Firestore dengan ID yang diterima
        try:
            doc_ref = db.collection("road_detections").document(id)  # Menggunakan ID yang diteruskan
            doc_ref.set({
                'image_revair_url': image_url,
                'timestamp_revair': firestore.SERVER_TIMESTAMP
            })
            return jsonify({'message': 'File uploaded successfully', 'image_url': image_url}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'File not allowed'}), 400