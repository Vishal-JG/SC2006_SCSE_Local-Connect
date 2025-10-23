from flask import Blueprint, request, jsonify, current_app
import requests
import time
import json

external_bp = Blueprint("external_bp", __name__)

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

# ---------------------------------------------
# URA PARKING LOT (GEOJSON)
# ---------------------------------------------
@external_bp.route("/govsg/ura-parking-lots", methods=["GET"])
def get_ura_parking_lots():
    """
    Fetch URA Parking Lot (GeoJSON) data from data.gov.sg.
    The API requires two steps:
    1. Call poll-download endpoint to get a temporary file URL.
    2. Fetch that file to get the actual GeoJSON content.
    """
    dataset_id = "d_d959102fa76d58f2de276bfbb7e8f68e"
    poll_url = f"https://api-open.data.gov.sg/v1/public/api/datasets/{dataset_id}/poll-download"

    try:
        # Step 1: Request the temporary file link
        poll_response = requests.get(poll_url, timeout=10)
        poll_data = poll_response.json()

        # Handle errors from the dataset API
        if poll_data.get("code") != 0:
            err_msg = poll_data.get("errMsg", "Unknown error from data.gov.sg API")
            return jsonify({"error": err_msg}), 502

        # Step 2: Download the GeoJSON file using the returned URL
        download_url = poll_data["data"]["url"]
        geojson_response = requests.get(download_url, timeout=20)

        # Return raw GeoJSON
        return jsonify(geojson_response.json()), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Request failed: {str(e)}"}), 500
    except ValueError:
        return jsonify({"error": "Failed to parse response as JSON"}), 500

# -----------------------------
# HDB CARPARK AVAILABILITY 
# -----------------------------
@external_bp.route("/govsg/hdb-carpark-info", methods=["GET"])
def get_hdb_carpark_info():
    dataset_id = "d_23f946fa557947f93a8043bbef41dd09"
    url = f"https://data.gov.sg/api/action/datastore_search?resource_id={dataset_id}"

    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx/5xx)
        data = response.json()
        return jsonify(data), 200
    except requests.exceptions.RequestException as e:
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

# ---------------------------------------------
# CERTIFICATE GRADING OF LICENSED EATING ESTABLISHMENTS
# ---------------------------------------------
@external_bp.route("/govsg/sfa-licensed-establishments", methods=["GET"])
def get_sfa_licensed_establishments():
    dataset_id = "d_546a95c5e6a0a264a82247ec107a0629"
    poll_url = f"https://api-open.data.gov.sg/v1/public/api/datasets/{dataset_id}/poll-download"

    try:
        # Step 1: Poll the download URL
        poll_response = requests.get(poll_url)
        poll_response.raise_for_status()
        json_data = poll_response.json()

        if json_data.get("code") != 0:
            return jsonify({"error": json_data.get("errMsg", "Unknown error")}), 500

        # Step 2: Fetch the actual JSON/GeoJSON file
        data_url = json_data["data"]["url"]
        data_response = requests.get(data_url)
        data_response.raise_for_status()

        geojson = data_response.json()
        return jsonify(geojson), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
        
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
