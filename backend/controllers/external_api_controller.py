from flask import Blueprint, request, jsonify, current_app
import requests

external_bp = Blueprint("external_bp", __name__)

"""Geocode Google Maps API"""
@external_bp.route("/maps/geocode", methods=["GET"])
def geocode_address():
    address = request.args.get("address")
    if not address:
        return jsonify({"error": "address param required"}), 400

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": current_app.config["Insert_API_Key_Here"]
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

"""Gov SG API"""
"""Ignore Temperature api for now"""
@external_bp.route("/govsg/air-temperature", methods=["GET"])
def gov_air_temperature():
    """Fetch real-time air temperature from Data.gov.sg"""
    try:
        resp = requests.get("https://api.data.gov.sg/v1/environment/air-temperature", timeout=10)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)}),

"""More Relevant Gov SG API"""
BASE_DATAGOV_API = "https://data.gov.sg/api/action/datastore_search"

DATASET_IDS = {
    # ACRA Open Data Initiative – Business Entities
    "acra": "8c00bf08-9124-479e-aeca-7cc411d884b5",

    # Business Expectations of the Services Sector (BESS)
    "bess": "cec21148-68fe-4be9-90ae-2118ae68c3c9",

    # SingStat Business Insights Tool (example dataset)
    "bites": "82d7eb42-79d9-4f4b-8971-70f8f78e1b61"
}


def fetch_dataset(dataset_id, limit=10, filters=None):
    """Helper to fetch dataset from Data.gov.sg datastore API."""
    params = {"resource_id": dataset_id, "limit": limit}
    if filters:
        params.update(filters)

    try:
        resp = requests.get(BASE_DATAGOV_API, params=params)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

"""GovSG API for Business entities data: e.g. business name, UEN, status, entity type, SSIC code, address."""
@external_bp.route("/govsg/acra", methods=["GET"])
def get_acra_businesses():
    """ACRA’s Open Data Initiative"""
    limit = int(request.args.get("limit", 5))
    data = fetch_dataset(DATASET_IDS["acra"], limit=limit)
    return jsonify(data)

"""GovSG API for Forecast / expectations data: whether businesses expect revenue to go up/same/down in next period."""
@external_bp.route("/govsg/business-expectations", methods=["GET"])
def get_business_expectations():
    """Business Expectations of the Services Sector"""
    limit = int(request.args.get("limit", 10))
    data = fetch_dataset(DATASET_IDS["bess"], limit=limit)
    return jsonify(data)

"""GovSG API for Not exactly an API (some parts are dashboard/tool), but provides insights into customer demographics, industry trends, business cost, etc."""
@external_bp.route("/govsg/bites", methods=["GET"])
def get_bites_insights():
    """SingStat Business Insights Tool (BITES)"""
    limit = int(request.args.get("limit", 5))
    data = fetch_dataset(DATASET_IDS["bites"], limit=limit)
    return jsonify(data)

@external_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok", "message": "External API Controller is alive"})
