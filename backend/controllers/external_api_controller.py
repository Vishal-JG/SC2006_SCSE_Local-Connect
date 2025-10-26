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

# ---------------------------------------------
# URA PARKING LOT (GEOJSON)
# ---------------------------------------------
from shapely.geometry import shape, Polygon, MultiPolygon
from math import radians, sin, cos, sqrt, atan2

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

@external_bp.route("/govsg/ura-parking-lots", methods=["GET"])
def get_ura_parking_lots():
    dataset_id = "d_d959102fa76d58f2de276bfbb7e8f68e"
    poll_url = f"https://api-open.data.gov.sg/v1/public/api/datasets/{dataset_id}/poll-download"

    try:
        poll_response = requests.get(poll_url, timeout=10)
        poll_data = poll_response.json()
        if poll_data.get("code") != 0:
            return jsonify({"error": poll_data.get("errMsg","Unknown error")}), 502

        download_url = poll_data["data"]["url"]
        geojson_response = requests.get(download_url, timeout=20)
        geojson = geojson_response.json()

        lat = request.args.get("lat", type=float)
        lng = request.args.get("lng", type=float)

        features = geojson.get("features", [])

        if lat is not None and lng is not None:
            # Compute centroid for each polygon and distance to user
            def feature_distance(f):
                geom = shape(f["geometry"])
                centroid = geom.centroid
                return haversine(lat, lng, centroid.y, centroid.x)
            features.sort(key=feature_distance)

        # Take nearest 100
        nearest_features = features[:100]

        return jsonify({
            "type": "FeatureCollection",
            "features": nearest_features
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Request failed: {str(e)}"}), 500
    except ValueError:
        return jsonify({"error": "Failed to parse response as JSON"}), 500

# -----------------------------
# HDB CARPARK AVAILABILITY 
# -----------------------------
from flask import jsonify, request
import requests
from pyproj import Proj, Transformer

svy21 = Proj(proj='tmerc', lat_0=1.366666, lon_0=103.833333,
             k=1.0, x_0=28001.642, y_0=38744.572, ellps='WGS84')
wgs84 = Proj(proj='latlong', datum='WGS84')
transformer = Transformer.from_proj(svy21, wgs84)

@external_bp.route("/govsg/hdb-carpark-info", methods=["GET"])
def get_hdb_carpark_info():
    dataset_id = "d_23f946fa557947f93a8043bbef41dd09"
    url = f"https://data.gov.sg/api/action/datastore_search?resource_id={dataset_id}&limit=5000"  # fetch all

    try:
        resp = requests.get(url)
        resp.raise_for_status()
        records = resp.json().get("result", {}).get("records", [])

        simplified = []
        for r in records:
            try:
                x, y = float(r.get("x_coord", 0)), float(r.get("y_coord", 0))
                lon, lat_wgs = transformer.transform(x, y)
            except:
                lat_wgs, lon = None, None

            simplified.append({
                "car_park_no": r.get("car_park_no"),
                "address": r.get("address"),
                "car_park_type": r.get("car_park_type"),
                "lat": lat_wgs,
                "lng": lon,
                "type_of_parking_system": r.get("type_of_parking_system"),
            })

        return jsonify(simplified), 200  # return everything

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

# ------------------------
# General Waste Collection Points
# ------------------------
DATASET_ID = "d_b4de98f706379b787ab86d1e69412910"
DATA_URL = f"https://data.gov.sg/api/action/datastore_search?resource_id={DATASET_ID}&limit=5000"
ONEMAP_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo5NzA1LCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiT25lTWFwIiwiaWF0IjoxNzYxNDcxMjQ2LCJuYmYiOjE3NjE0NzEyNDYsImV4cCI6MTc2MTczMDQ0NiwianRpIjoiMTAwOTU2Y2ItY2E1ZC00OGUwLTg2NTAtNWZjZmI1NDk3YTRhIn0.KMLvzzNpsNf5f_2l4JkfaR8ExBldHU1a68PhacvOojSh0jzSvsLK4OQcgTTMOPG7953fw4U0KZaTLGjr33n1vJaq7gG7kZs0wteahQ9UbECYiYz1ntQt1QVZlEDh4-6c-0lasxNJBXmLrW38WRk2S8carSIDeTc6m0IS9Gbka4EsNDOs31uRggzEKP_e8Gg92D62ZOXjhP0q5L5akRRUiOqq4-4EKh3EXugrzuAGqrPrJ6hGuYHo1gGexgzuXKU0Ffb9wlcPqdFkqbZMU4BiwB36UzEhqtw91a9dbRdYyZxb6QJfNRhw3FrZj30xqcbRxau6lzqXNDsjpP8GcoEUpA"
cached_data = None

# # --- Fallback function using OneMap geocode ---
# def geocode_postal(postal):
#     try:
#         r = requests.get(
#             "https://developers.onemap.sg/privateapi/search",
#             params={
#                 "searchVal": postal,
#                 "returnGeom": "Y",
#                 "getAddrDetails": "Y",
#                 "token": ONEMAP_TOKEN,
#             },
#             timeout=10,
#         )
#         res = r.json()
#         if res.get("results"):
#             first = res["results"][0]
#             return {
#                 "lat": float(first["LATITUDE"]),
#                 "lng": float(first["LONGITUDE"]),
#             }
#     except Exception as e:
#         print(f"Geocode failed for {postal}: {e}")
#     return None

# @external_bp.route("/govsg/general-waste", methods=["GET"])
# def get_general_waste():
#     """Fetch and geocode general waste collection points"""
#     global cached_data
#     try:
#         # Cache dataset to avoid redundant calls
#         if not cached_data:
#             response = requests.get(DATA_URL)
#             response.raise_for_status()
#             data = response.json()
#             cached_data = data.get("result", {}).get("records", [])

#         postal_filter = request.args.get("postal")

#         output = []
#         for r in cached_data:
#             if postal_filter and str(r.get("postal_code", "")).strip() != postal_filter.strip():
#                 continue

#             postal = str(r.get("postal_code", "")).strip()
#             print(geocode_postal(postal))
#             geo = geocode_postal(postal) if postal else None

#             output.append({
#                 "location_name": r.get("location_name"),
#                 "address": r.get("address"),
#                 "postal_code": postal,
#                 "lat": geo["lat"] if geo else None,
#                 "lng": geo["lng"] if geo else None,
#             })

#         return jsonify(output), 200

#     except requests.exceptions.RequestException as e:
#         return jsonify({"error": str(e)}), 500

POSTAL_COORDS = {
    "758056": {"lat": 1.4505, "lng": 103.8239},  # Example: near Woodlands
    "729826": {"lat": 1.4345, "lng": 103.7862},  # Example: Admiralty
    "730900": {"lat": 1.4403, "lng": 103.8001},  # Example: Marsiling
    "730001": {"lat": 1.4411, "lng": 103.7854},
    "750001": {"lat": 1.4602, "lng": 103.8301},
}

@external_bp.route("/govsg/general-waste", methods=["GET"])
def get_general_waste():
    global cached_data
    try:
        # Fetch data once
        if not cached_data:
            response = requests.get(DATA_URL)
            response.raise_for_status()
            data = response.json()
            cached_data = data.get("result", {}).get("records", [])

        postal_filter = request.args.get("postal")

        output = []
        for r in cached_data:
            postal = str(r.get("postal_code", "")).strip()
            if postal_filter and postal != postal_filter:
                continue

            geo = POSTAL_COORDS.get(postal)
            if not geo or geo["lat"] is None or geo["lng"] is None:
                continue

            output.append({
                "location_name": r.get("location_name"),
                "address": r.get("address"),
                "postal_code": postal,
                "lat": geo["lat"] if geo else None,
                "lng": geo["lng"] if geo else None,
            })

        return jsonify(output), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

# ------------------------
# Live Traffic Images for package delivery services
# ------------------------
@external_bp.route("/govsg/traffic-cameras", methods=["GET"])
def get_traffic_cameras():
    """
    Fetch live traffic camera images from data.gov.sg.
    Optionally filters by location (lat, lng, radius).
    """
    try:
        url = "https://api.data.gov.sg/v1/transport/traffic-images"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        cameras = data.get("items", [])[0].get("cameras", [])

        # Optional filtering
        lat = request.args.get("lat", type=float)
        lng = request.args.get("lng", type=float)
        radius_km = request.args.get("radius", type=float, default=2.0)

        def within_radius(lat1, lon1, lat2, lon2, km):
            from math import radians, sin, cos, sqrt, atan2
            R = 6371
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))
            return R * c <= km

        if lat and lng:
            cameras = [
                c for c in cameras
                if within_radius(lat, lng, c["location"]["latitude"], c["location"]["longitude"], radius_km)
            ]

        result = [
            {
                "camera_id": c.get("camera_id"),
                "timestamp": c.get("timestamp"),
                "image": c.get("image"),
                "lat": c["location"]["latitude"],
                "lng": c["location"]["longitude"],
                "location": c.get("location", {}),
            }
            for c in cameras
        ]

        return jsonify(result), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500