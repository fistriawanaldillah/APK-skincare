from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from google.cloud.sql.connector import Connector
from datetime import datetime, timedelta, timezone
import jwt
import uuid
import pymysql
from functools import wraps

# Inisialisasi aplikasi Flask
app = Flask(__name__)

# Konfigurasi App
app.config["SECRET_KEY"] = "secret123"  # Ganti sesuai kebutuhan
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Inisialisasi Google Cloud SQL Connector
connector = Connector()


def get_connection():
    """Fungsi untuk koneksi ke Google Cloud SQL."""
    conn = connector.connect(
        "capstone-project-442222:asia-southeast2:account-db",  # Instance Cloud SQL
        "pymysql",
        user="api_user",
        password="api_user360",
        db="user_account",
    )
    return conn


# Konfigurasi SQLAlchemy
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://"
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"creator": get_connection}
db = SQLAlchemy(app)


# Model Database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(70), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)


# Decorator untuk verifikasi JWT Token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("x-access-token")
        if not token:
            return jsonify({"message": "Token is missing !!"}), 401

        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = User.query.filter_by(public_id=data["public_id"]).first()
        except Exception as e:
            return jsonify({"message": "Token is invalid !!", "error": str(e)}), 401

        return f(current_user, *args, **kwargs)

    return decorated


# Endpoint untuk signup
@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.json

    if not data or not data.get("name") or not data.get("email") or not data.get("password"):
        return make_response("All fields are required.", 400)

    if User.query.filter_by(email=data["email"]).first():
        return make_response("User already exists. Please log in.", 202)

    hashed_password = generate_password_hash(data["password"])
    new_user = User(
        public_id=str(uuid.uuid4()),
        name=data["name"],
        email=data["email"],
        password=hashed_password,
    )
    db.session.add(new_user)
    db.session.commit()

    return make_response("Successfully registered.", 201)


# Endpoint untuk login
@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json

    if not data or not data.get("email") or not data.get("password"):
        return make_response("Email and password are required.", 400)

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password_hash(user.password, data["password"]):
        return make_response("Invalid email or password.", 401)

    token = jwt.encode(
        {"public_id": user.public_id, "exp": datetime.now(timezone.utc) + timedelta(minutes=30)},
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    return jsonify({"token": token})


# Endpoint untuk mendapatkan daftar user (hanya untuk user dengan token)
@app.route("/auth/users", methods=["GET"])
@token_required
def get_users(current_user):
    users = User.query.all()
    output = [{"public_id": user.public_id, "name": user.name, "email": user.email} for user in users]
    return jsonify({"users": output})


# Tes koneksi database
@app.route("/db-test", methods=["GET"])
def db_test():
    try:
        db.session.execute("SELECT 1")
        return "Database connection successful", 200
    except Exception as e:
        return str(e), 500


if __name__ == "__main__":
    app.run(debug=True)
