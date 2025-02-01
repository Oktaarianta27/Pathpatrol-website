from flask import Blueprint, redirect, render_template, request, session, url_for
from functools import wraps
from firebase_admin import auth
from flask import make_response

# Buat Blueprint untuk autentikasi
auth_bp = Blueprint('auth', __name__)

# Authentication and Authorization Decorator
def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/auth', methods=['POST'])
def authorize():
    token = request.headers.get('Authorization')
    if not token or not token.startswith('Bearer '):
        return "Unauthorized", 401
    token = token[7:]  # Strip off 'Bearer ' to get the actual token
    try:
        # Verifikasi token menggunakan Firebase Admin SDK
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']  # Ambil UID dari token
        
        # Simpan UID ke sesi
        session['uid'] = uid
        session['user'] = decoded_token  # Menyimpan semua informasi pengguna jika dibutuhkan
        return redirect(url_for('private.dashboard'))
    except Exception as e:
        return f"Unauthorized: {str(e)}", 401

@auth_bp.route('/login')
def login():
    if 'user' in session:
        return redirect(url_for('private.dashboard'))
    else:
        return render_template('login.html')

@auth_bp.route('/signup')
def signup():
    if 'user' in session:
        return redirect(url_for('private.dashboard'))
    else:
        return render_template('signup.html')

@auth_bp.route('/reset-password')
def reset_password():
    if 'user' in session:
        return redirect(url_for('private.dashboard'))
    else:
        return render_template('forgot_password.html')

@auth_bp.route('/logout')
def logout():
    session.pop('user', None)  # Remove the user from session
    response = make_response(redirect(url_for('auth.login')))
    response.set_cookie('session', '', expires=0)  # Optionally clear the session cookie
    return response