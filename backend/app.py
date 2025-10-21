import firebase_admin
from firebase_admin import credentials, auth
from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.controllers.external_api_controller import external_bp #import external api
from backend.controllers.review_controller import review_bp
from backend.controllers.admin_controller import admin_bp
from backend.controllers.chatbot_controller import chatbot_bp
from backend.controllers.service_controller import service_bp
from backend.controllers.bookmark_controller import bookmark_bp
from backend.controllers.booking_controller import booking_bp
import os

from backend.db import init_app, init_db, seed_db_command # import db initializer and init function
from dotenv import load_dotenv

load_dotenv()

key_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

cred = credentials.Certificate(key_path)  
firebase_admin.initialize_app(cred)

app = Flask(__name__)
# ensure instance path and database config exist before initializing DB
app.config['DATABASE'] = os.path.join(app.instance_path, 'localconnectusers.sqlite')
os.makedirs(app.instance_path, exist_ok=True)

init_app(app)

with app.app_context():
    # Ensure tables are created before seeding
    init_db()
    app.cli.add_command(seed_db_command)
app.config["GOOGLE_MAPS_API_KEY"] = os.getenv("GOOGLE_MAPS_API_KEY")
CORS(app)  # enable CORS for all routes
app.register_blueprint(external_bp, url_prefix="/api") #register blueprint of external api
app.register_blueprint(review_bp, url_prefix="/api")
app.register_blueprint(admin_bp, url_prefix="/api")
app.register_blueprint(chatbot_bp, url_prefix="/api")
app.register_blueprint(service_bp, url_prefix="/api")
app.register_blueprint(bookmark_bp, url_prefix="/api")
app.register_blueprint(booking_bp, url_prefix="/api")
@app.route('/')
def index():
    return jsonify({'message': 'Flask backend is running!'})

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

if __name__ == '__main__':
    app.run(debug=True)
