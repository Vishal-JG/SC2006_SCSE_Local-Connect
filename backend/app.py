import firebase_admin
from firebase_admin import credentials, auth
from flask import Flask, request, jsonify
from flask_cors import CORS
from controllers.external_api_controller import external_bp #import external api
import os
from dotenv import load_dotenv

load_dotenv()
key_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

cred = credentials.Certificate(key_path)  
firebase_admin.initialize_app(cred)

app = Flask(__name__)
CORS(app)  # enable CORS for all routes
app.register_blueprint(external_bp, url_prefix="/api") #register blueprint of external api

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
