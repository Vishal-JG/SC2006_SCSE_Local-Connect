from flask import Blueprint, request, jsonify, current_app
import requests

external_bp = Blueprint("external_bp", __name__)

BASE_DATAGOV_API = "https://data.gov.sg/api/action/datastore_search"

DATASET_IDS = {
    "acra": "d_0c0d478485f7df314fb24da866e9c1cd",
    "bess": "cec21148-68fe-4be9-90ae-2118ae68c3c9",
    "bites": "82d7eb42-79d9-4f4b-8971-70f8f78e1b61"
}

def fetch_dataset(dataset_id, limit=10, filters=None):
    params = {"resource_id": dataset_id, "limit": limit}
    if filters:
        params.update(filters)

    try:
        resp = requests.get(BASE_DATAGOV_API, params=params)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

@external_bp.route("/maps/geocode", methods=["GET"])
def geocode_address():
    address = request.args.get("address")
    if not address:
        return jsonify({"error": "address param required"}), 400

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": current_app.config["GOOGLE_MAPS_API_KEY"]
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

@external_bp.route("/govsg/air-temperature", methods=["GET"])
def gov_air_temperature():
    try:
        resp = requests.get("https://api.data.gov.sg/v1/environment/air-temperature", timeout=10)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)})

@external_bp.route("/govsg/acra", methods=["GET"])
def get_acra_businesses():
    limit = int(request.args.get("limit", 5))
    data = fetch_dataset(DATASET_IDS["acra"], limit=limit)
    return jsonify(data)

@external_bp.route("/govsg/business-expectations", methods=["GET"])
def get_business_expectations():
    limit = int(request.args.get("limit", 10))
    data = fetch_dataset(DATASET_IDS["bess"], limit=limit)
    return jsonify(data)

@external_bp.route("/govsg/bites", methods=["GET"])
def get_bites_insights():
    limit = int(request.args.get("limit", 5))
    data = fetch_dataset(DATASET_IDS["bites"], limit=limit)
    return jsonify(data)

@external_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok", "message": "External API Controller is alive"})