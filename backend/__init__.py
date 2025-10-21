from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from . import db
from .db import get_db

def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app)  # enable CORS for all routes

    app.config.from_mapping(
        DATABASE=os.path.join(app.instance_path, 'database.db')
    )
    os.makedirs(app.instance_path, exist_ok=True)
    db.init_app(app)
    
    # Initialize Firebase admin if available and credentials present. Setting the
    # environment variable SKIP_FIREBASE=1 will skip firebase initialization
    # which is useful for running CLI commands locally without credentials.
    skip_firebase = os.getenv('SKIP_FIREBASE', '') == '1'
    if skip_firebase:
        print('SKIP_FIREBASE is set; skipping Firebase initialization.')
    else:
        try:
            import firebase_admin
            from firebase_admin import credentials, auth
            base_dir = os.path.abspath(os.path.dirname(__file__))
            key_path = os.path.join(base_dir, 'firebase-adminsdk.json')
            print(f"Attempting to load Firebase key from: {key_path}")
            if os.path.exists(key_path):
                try:
                    cred = credentials.Certificate(key_path)
                    firebase_admin.initialize_app(cred)
                    print("Firebase initialized.")
                except Exception as e:
                    print(f"Warning: Firebase initialization failed: {e}")
            else:
                print("Firebase credentials file not found; skipping Firebase initialization.")
        except ImportError:
            print("firebase_admin package not installed; skipping Firebase initialization.")

    @app.route('/api/login', methods=['POST'])
    def api_login():
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        try:
            decoded_token = auth.verify_id_token(token)
            print(f"User logged in: {decoded_token['uid']}")
            return jsonify({'message': 'Login logged'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 401

    @app.route('/api/logout', methods=['POST'])
    def api_logout():
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        try:
            decoded_token = auth.verify_id_token(token)
            print(f"User logged out: {decoded_token['uid']}")
            return jsonify({'message': 'Logout logged'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 401

    @app.route('/api/hello', methods=['GET'])
    def hello():
        return jsonify({'message': 'Hello from Flask backend!'})

    @app.route('/api/data', methods=['POST'])
    def data():
        json_data = request.json
        print(json_data)
        return jsonify({'received': json_data})
    
    @app.route('/api/users', methods=['POST'])
    def create_user():
        # Verify Firebase token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization header missing'}), 401

        token = auth_header.split('Bearer ')[-1]

        try:
            decoded_token = firebase_admin.auth.verify_id_token(token)
            firebase_uid = decoded_token['uid']
        except Exception:
            return jsonify({'error': 'Invalid token'}), 401

        data = request.json
        if not data:
            return jsonify({'error': 'Missing JSON data'}), 400

        email = data.get('email')
        display_name = data.get('displayName')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        role = data.get('role')

        if not all([email, first_name, last_name, role]):
            return jsonify({'error': 'Missing required user fields'}), 400
        db = get_db()
        try:
            # Insert user into Users table
            db.execute(
                """
                INSERT INTO Users (user_id, email, display_name, first_name, last_name, role, created_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                (firebase_uid, email, display_name, first_name, last_name, role)
            )
            db.commit()

            # If user is provider, add entry to Providers table with provider specifics
            if role == 'provider':
                business_name = data.get('businessName')
                business_description = data.get('businessDescription')

                if not business_name or not business_description:
                    return jsonify({'error': 'Missing provider business info'}), 400

                db.execute(
                    """
                    INSERT INTO Providers (user_id, business_name, description, approved)
                    VALUES (?, ?, ?, 0)
                    """,
                    (firebase_uid, business_name, business_description)
                )
                db.commit()

        except Exception as e:
            return jsonify({'error': 'Database error: ' + str(e)}), 500

        return jsonify({'message': 'User created successfully'}), 201

    @app.route('/api/me')
    def get_my_profile():
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Missing auth token'}), 401
        token = auth_header.split('Bearer ')[-1]
        try:
            decoded_token = firebase_admin.auth.verify_id_token(token)
            firebase_uid = decoded_token['uid']
        except Exception:
            return jsonify({'error': 'Invalid token'}), 401

        db = get_db()
        user = db.execute('SELECT * FROM Users WHERE user_id = ?', (firebase_uid,)).fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'user_id': user['user_id'],
            'email': user['email'],
            'role': user['role']
        })


    return app
