from flask import Blueprint, render_template
from app.routes.auth import auth_required

private_bp = Blueprint('private', __name__)

@private_bp.route('/dashboard')
@auth_required
def dashboard():
    return render_template('dashboard.html')

@private_bp.route('/laporan')
@auth_required
def laporan():
    return render_template('laporan.html')

@private_bp.route("/panduan")
@auth_required
def panduan():
    return render_template('panduan.html')

@private_bp.route('/profil')
@auth_required
def profil():
    return render_template('profil.html')