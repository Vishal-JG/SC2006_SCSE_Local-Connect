# SC2006 Local Connect API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
Most endpoints require Firebase authentication. Include the Firebase JWT token in the Authorization header:
```
Authorization: Bearer <firebase_token>
```

---

## Interactive Documentation
Visit `/api/docs` for interactive Swagger UI documentation where you can test endpoints directly.

---

## Endpoints

### Authentication

#### POST /api/login
Login and create/fetch user in local database.

**Headers:**
- `Authorization: Bearer <firebase_token>` (required)

**Response 200:**
```json
{
  "success": true,
  "email": "user@example.com",
  "display_name": "John Doe"
}
```

**Response 401:**
```json
{
  "error": "Missing Authorization token"
}
```

---

#### POST /api/logout
Log out current user.

**Headers:**
- `Authorization: Bearer <firebase_token>` (required)

**Response 200:**
```json
{
  "message": "Logout logged"
}
```

---

### Users

#### GET /api/users/me
Get current authenticated user's profile.

**Headers:**
- `Authorization: Bearer <firebase_token>` (required)

**Response 200:**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "display_name": "John Doe",
    "role": "customer",
    "created_at": "2025-10-21 12:00:00"
  }
}
```

**Response 404:**
```json
{
  "error": "User not found"
}
```

---

### Services/Listings

#### GET /api/services
List all approved services (public endpoint).

**Query Parameters:**
- `status` (optional): Filter by status (default: "approved")

**Response 200:**
```json
[
  {
    "listing_id": 1,
    "title": "Private Dinner for Two",
    "description": "Enjoy a gourmet 3-course meal...",
    "price": 150.00,
    "provider_id": 1,
    "category_id": 1,
    "status": "approved",
    "created_at": "2025-10-21 10:00:00"
  }
]
```

---

#### GET /api/services/{listing_id}
Get details of a specific service.

**Path Parameters:**
- `listing_id` (integer, required): ID of the listing

**Response 200:**
```json
{
  "listing_id": 1,
  "title": "Private Dinner for Two",
  "description": "...",
  "price": 150.00,
  "status": "approved"
}
```

**Response 404:**
```json
{
  "error": "Service not found"
}
```

---

#### POST /api/provider/services
Provider adds a new service (requires provider role).

**Headers:**
- `Authorization: Bearer <firebase_token>` (required)

**Request Body:**
```json
{
  "title": "New Service",
  "description": "Service description",
  "price": 100.00,
  "category_id": 1
}
```

**Response 201:**
```json
{
  "message": "Service created",
  "service": {
    "listing_id": 10,
    "title": "New Service",
    "price": 100.00,
    "status": "pending"
  }
}
```

**Response 403:**
```json
{
  "error": "Only providers can add services"
}
```

---

### Reviews

#### GET /api/services/{listing_id}/reviews
Get all reviews for a service.

**Path Parameters:**
- `listing_id` (integer, required)

**Response 200:**
```json
[
  {
    "review_id": 1,
    "rating": 5,
    "comment": "Excellent service!",
    "reviewer": "John Doe",
    "created_at": "2025-10-21 14:00:00"
  }
]
```

---

#### POST /api/services/{listing_id}/reviews
Add a new review for a service.

**Headers:**
- `Authorization: Bearer <firebase_token>` (required)

**Path Parameters:**
- `listing_id` (integer, required)

**Request Body:**
```json
{
  "user_id": "firebase_uid_123",
  "booking_id": 1,
  "rating": 5,
  "comment": "Great experience!"
}
```

**Response 201:**
```json
{
  "message": "Review added successfully"
}
```

**Response 400:**
```json
{
  "error": "Missing required fields"
}
```

---

### Bookmarks

#### GET /api/bookmarks
Get current user's bookmarks.

**Headers:**
- `Authorization: Bearer <firebase_token>` (required)

**Response 200:**
```json
[
  {
    "bookmark_id": 1,
    "listing_id": 4,
    "created_at": "2025-10-21 11:00:00"
  }
]
```

---

#### POST /api/bookmarks
Add a bookmark.

**Headers:**
- `Authorization: Bearer <firebase_token>` (required)

**Request Body:**
```json
{
  "listing_id": 4
}
```

**Response 201:**
```json
{
  "message": "Bookmark added"
}
```

---

### Bookings

#### POST /api/bookings
Create a new booking.

**Headers:**
- `Authorization: Bearer <firebase_token>` (required)

**Request Body:**
```json
{
  "listing_id": 1,
  "booking_date": "2025-10-25 18:00:00"
}
```

**Response 201:**
```json
{
  "message": "Booking created",
  "booking_id": 10
}
```

---

### Admin

#### DELETE /api/admin/users/{user_id}
Admin deletes a user.

**Headers:**
- `Authorization: Bearer <firebase_token>` (required, admin role)

**Path Parameters:**
- `user_id` (integer, required)

**Response 200:**
```json
{
  "message": "User 5 deleted"
}
```

**Response 403:**
```json
{
  "error": "Admin access required"
}
```

---

#### POST /api/admin/services/{listing_id}/approve
Admin approves a pending service.

**Headers:**
- `Authorization: Bearer <firebase_token>` (required, admin role)

**Path Parameters:**
- `listing_id` (integer, required)

**Response 200:**
```json
{
  "message": "Service approved",
  "service": { ... }
}
```

---

## Error Responses

All endpoints may return these common error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid request parameters"
}
```

**401 Unauthorized:**
```json
{
  "error": "Missing or invalid Authorization token"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error message"
}
```

---

## Database Schema

### Users
- `user_id` (TEXT, PK): Firebase UID
- `email` (TEXT, UNIQUE)
- `display_name` (TEXT)
- `phone` (TEXT)
- `role` (TEXT): 'customer', 'provider', or 'admin'
- `created_at` (DATETIME)

### Providers
- `provider_id` (INTEGER, PK)
- `user_id` (TEXT, FK → Users)
- `business_name` (TEXT)
- `description` (TEXT)
- `approved` (BOOLEAN)

### Listings
- `listing_id` (INTEGER, PK)
- `provider_id` (INTEGER, FK → Providers)
- `category_id` (INTEGER, FK → Categories)
- `title` (TEXT)
- `description` (TEXT)
- `price` (REAL)
- `status` (TEXT): 'pending', 'approved', 'rejected'
- `created_at` (DATETIME)

### Bookings
- `booking_id` (INTEGER, PK)
- `listing_id` (INTEGER, FK → Listings)
- `user_id` (TEXT, FK → Users)
- `booking_date` (DATETIME)
- `status` (TEXT): 'pending', 'confirmed', 'cancelled', 'completed'
- `created_at` (DATETIME)

### Reviews
- `review_id` (INTEGER, PK)
- `booking_id` (INTEGER, FK → Bookings)
- `user_id` (TEXT, FK → Users)
- `listing_id` (INTEGER, FK → Listings)
- `rating` (INTEGER): 1-5
- `comment` (TEXT)
- `created_at` (DATETIME)

### Bookmarks
- `bookmark_id` (INTEGER, PK)
- `user_id` (TEXT, FK → Users)
- `listing_id` (INTEGER, FK → Listings)
- `created_at` (DATETIME)

---

## Testing

### Using curl
```bash
# Health check
curl http://localhost:5000/api/hello

# Login (replace with actual Firebase token)
curl -X POST http://localhost:5000/api/login \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Get services
curl http://localhost:5000/api/services
```

### Using Python requests
```python
import requests

# Health check
response = requests.get('http://localhost:5000/api/hello')
print(response.json())

# Login
headers = {'Authorization': 'Bearer YOUR_FIREBASE_TOKEN'}
response = requests.post('http://localhost:5000/api/login', headers=headers)
print(response.json())
```

---

## Setup & Installation

1. Activate virtual environment:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
```

2. Install dependencies:
```powershell
pip install -r requirements.txt
```

3. Initialize database:
```powershell
$env:FLASK_APP = "backend:create_app"
$env:SKIP_FIREBASE = "1"
flask init-db
flask seed-db
```

4. Run server:
```powershell
flask run
# or
python app.py
```

5. Access documentation:
- Interactive Swagger UI: http://localhost:5000/api/docs
- This markdown file: `backend/API.md`
