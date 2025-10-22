from flask import Blueprint, request, jsonify, current_app
import requests
import time
import json

service_bp = Blueprint('service_bp', __name__)
external_bp = Blueprint('external_bp', __name__)
bookmark_bp = Blueprint('bookmark_bp', __name__)

BASE_DATAGOV_API = "https://data.gov.sg/api/action/datastore_search"

DATASET_IDS = {
    "acra": "d_3f960c10fed6145404ca7b821f263b87",
    "bess": "d_c52d871176ed7c3f4991fbc29fbb0512"
}

# ------------------------
# In-memory cache for geocoding
# ------------------------
GEOCODE_CACHE = {}
CACHE_TTL = 24 * 60 * 60  # 24 hours

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

# ------------------------
# Google Maps Geocode
# ------------------------
@external_bp.route("/maps/geocode", methods=["GET"])
def geocode_address():
    address = request.args.get("address")
    if not address:
        return jsonify({"error": "address param required"}), 400

    # Check cache first
    cached = GEOCODE_CACHE.get(address)
    if cached and (time.time() - cached["timestamp"] < CACHE_TTL):
        loc = cached
    else:
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {"address": address, "key": current_app.config["GOOGLE_MAPS_API_KEY"]}
        try:
            resp = requests.get(url, params=params, timeout=10)
            resp.raise_for_status()
            geo_data = resp.json()
            if geo_data.get("results"):
                loc = geo_data["results"][0]["geometry"]["location"]
                loc["timestamp"] = time.time()
                GEOCODE_CACHE[address] = loc
            else:
                return jsonify({"error": "no results found"}), 404
        except requests.RequestException as e:
            return jsonify({"error": str(e)}), 500

    return jsonify(loc)

# Reverse geocode to get human-readable address
@external_bp.route("/maps/reverse_geocode", methods=["GET"])
def reverse_geocode():
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    if not lat or not lng:
        return jsonify({"error": "lat and lng params required"}), 400

    key = current_app.config["GOOGLE_MAPS_API_KEY"]
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"latlng": f"{lat},{lng}", "key": key}
    
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        geo_data = resp.json()
        if geo_data.get("results"):
            # Return the formatted address of the first result
            address = geo_data["results"][0]["formatted_address"]
            return jsonify({"address": address})
        else:
            return jsonify({"error": "No address found"}), 404
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

# ------------------------
# Weather
# ------------------------
@external_bp.route("/govsg/weather-2h", methods=["GET"])
def gov_weather_2h():
    """Fetch the 2-hour weather forecast from Data.gov.sg"""
    try:
        resp = requests.get("https://api.data.gov.sg/v1/environment/2-hour-weather-forecast", timeout=10)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)})

# ------------------------
# ACRA businesses with geocoding
# ------------------------
@external_bp.route("/govsg/acra-geocoded", methods=["GET"])
def get_acra_businesses_geocoded():
    limit = int(request.args.get("limit", 5))
    businesses = fetch_dataset(DATASET_IDS["acra"], limit=limit)
    print(json.dumps(businesses, indent=2))  # debug: see raw dataset

    geocoded = []
    for item in businesses.get("result", {}).get("records", []):
        street = item.get("reg_street_name")
        postal = item.get("reg_postal_code")
        if not street or not postal:
            continue

        address = f"{street}, Singapore {postal}"

        # Use the geocode cache / API
        cached = GEOCODE_CACHE.get(address)
        if cached and (time.time() - cached["timestamp"] < CACHE_TTL):
            loc = cached
        else:
            geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
            params = {"address": address, "key": current_app.config["GOOGLE_MAPS_API_KEY"]}
            try:
                resp = requests.get(geocode_url, params=params, timeout=5)
                resp.raise_for_status()
                geo_data = resp.json()
                if geo_data.get("results"):
                    loc = geo_data["results"][0]["geometry"]["location"]
                    loc["timestamp"] = time.time()
                    GEOCODE_CACHE[address] = loc
                else:
                    continue
            except requests.RequestException:
                continue

        item["lat"] = loc["lat"]
        item["lng"] = loc["lng"]
        geocoded.append({
            "uen": item.get("uen"),
            "entity_name": item.get("entity_name"),
            "entity_type_desc": item.get("entity_type_desc"),
            "uen_status_desc": item.get("uen_status_desc"),
            "address": address,
            "lat": item["lat"],
            "lng": item["lng"]
        })

    return jsonify({"businesses": geocoded})

# ------------------------
# Business Expectations
# ------------------------
@external_bp.route("/govsg/business-expectations", methods=["GET"])
def get_business_expectations():
    limit = int(request.args.get("limit", 10))
    data = fetch_dataset(DATASET_IDS["bess"], limit=limit)
    return jsonify(data)

# ------------------------
# Health check
# ------------------------
@external_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok", "message": "External API Controller is alive"})
