from flask import Blueprint, request, jsonify, current_app
import requests

external_bp = Blueprint("external_bp", __name__)

@external_bp.route("/maps/geocode", methods=["GET"])
def geocode_address():
    """Geocode an address using Google Maps API"""
    address = request.args.get("address")
    if not address:
        return jsonify({"error": "address param required"}), 400

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": current_app.config["Google API Key"]
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500


@external_bp.route("/govsg/air-temperature", methods=["GET"]) #I know not temp api but i forgot what gov.sg api is used for
def gov_air_temperature():
    """Fetch real-time air temperature from Data.gov.sg"""
    try:
        resp = requests.get("https://api.data.gov.sg/v1/environment/air-temperature", timeout=10)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500
