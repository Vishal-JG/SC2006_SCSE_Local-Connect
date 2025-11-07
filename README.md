# LocalConnect

<div align="center">

![LocalConnect Landing Page](assets_readme/landing_page.png)

**A Community-Driven Platform Connecting Local Service Providers with Nearby Customers**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation--setup) • [API Docs](#api-documentation) • [Architecture](#architecture)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Features](#features)
  - [Consumer Features](#consumer-features)
  - [Provider Features](#provider-features)
  - [Admin Features](#admin-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Software Engineering Practices](#software-engineering-practices)
- [Challenges & Solutions](#challenges--solutions)
- [Contributors](#contributors)
- [License](#license)

---

## Overview

**LocalConnect** is a web-based platform designed to bridge the gap between local service providers (freelancers and small businesses) and customers in Singapore. The platform enables easy discovery and connection with nearby services such as tutors, home chefs, mechanics, and more — all within your neighborhood.

### Why LocalConnect?

> *"What if finding nearby services was as easy as a tap?"*

In Singapore, small businesses and freelancers struggle with limited visibility, while customers face difficulty finding trusted local service providers. LocalConnect solves this by creating a centralized, community-driven marketplace that prioritizes local connections.

---

## Problem Statement

### Key Pain Points

1. **Limited Visibility** 
   - Small local service providers lack affordable platforms to reach potential customers
   - Traditional advertising methods are expensive and ineffective for local businesses

2. **Discovery Challenge** 
   - Users struggle to find trustworthy nearby freelancers and small businesses
   - No centralized platform for local service discovery

3. **Trust Issues** 
   - Difficulty verifying service quality and reliability
   - Lack of transparent reviews and ratings

### Our Solution

LocalConnect addresses these challenges by providing:
- **Location-based service discovery** with interactive maps
- **Transparent reviews and ratings** system
- **Direct communication** via WhatsApp integration
- **Business analytics** for service providers
- **Secure authentication** and verified user profiles

---

## Features

### Consumer Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Secure login and signup with role-based access (Consumer/Provider) |
| **Advanced Search** | Filter services by price, ratings, location, and category |
| **Service Details** | Comprehensive view of service offerings with images and descriptions |
| **Reviews & Ratings** | Add, view, and remove reviews with star ratings |
| **Bookmarks** | Save favorite services for quick access |
| **Interactive Map** | View services and nearby amenities (carparks, recycling points, traffic cameras) |
| **Booking Management** | Create, view, and delete service bookings |
| **Direct Contact** | WhatsApp integration for instant communication with providers |
| **Responsive Design** | Seamless experience across desktop and mobile devices |

### Provider Features

| Feature | Description |
|---------|-------------|
| **Service Management** | Add, edit, and delete service listings with rich details |
| **Business Analytics** | View booking statistics, review counts, and average ratings |
| **Dashboard** | Comprehensive overview of business performance |
| **Booking Notifications** | Track pending, accepted, and completed bookings |
| **Profile Management** | Update business information and contact details |
| **Pricing Control** | Set and adjust service pricing |

### Admin Features

| Feature | Description |
|---------|-------------|
| **User Management** | View and remove user accounts |
| **Content Moderation** | Review and remove inappropriate reviews |
| **Platform Analytics** | Monitor overall platform usage and statistics |
| **Service Approval** | Review and approve new service listings |

### Integrated External Services

- **OneMap API**
  - Geolocation services
  - Interactive mapping
  - Distance calculations
  - Address validation

- **Data.gov.sg API**
  - Real-time HDB carpark availability
  - Waste collection points
  - Traffic camera images
  - Public amenities data

- **Firebase**
  - Secure user authentication
  - Session management
  - Real-time data synchronization

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React.js 18+** | Component-based UI framework |
| **React Router** | Client-side routing and navigation |
| **Axios** | HTTP client for API requests |
| **Firebase SDK** | Authentication and real-time features |
| **Font Awesome** | Icon library for modern UI |
| **CSS3** | Custom styling with modern features |
| **Leaflet.js** | Interactive map integration |

### Backend

| Technology | Purpose |
|------------|---------|
| **Python 3.8+** | Core programming language |
| **Flask 3.0+** | Lightweight web framework |
| **SQLite** | Development database |
| **MySQL** | Production database |
| **Firebase Admin SDK** | Server-side authentication |
| **Flasgger** | OpenAPI/Swagger documentation |
| **Flask-CORS** | Cross-origin resource sharing |

### Development Tools

- **Git & GitHub** - Version control and collaboration
- **Prettier** - Code formatting
- **VS Code** - Primary IDE
- **Postman** - API testing
- **Chrome DevTools** - Frontend debugging

---

## Architecture

![LocalConnect Architecture Overview](assets_readme/architecture_overview.jpg)

### System Design

LocalConnect follows a **three-tier architecture** pattern:

1. **Presentation Layer (Frontend)**
   - React-based single-page application (SPA)
   - Responsive UI with modern design patterns
   - Client-side routing and state management

2. **Application Layer (Backend)**
   - RESTful API built with Flask
   - MVC (Model-View-Controller) architecture
   - Facade design pattern for external API integration
   - Token-based authentication with Firebase

3. **Data Layer**
   - Relational database (SQLite/MySQL)
   - Normalized schema design
   - Foreign key constraints for data integrity

### Design Patterns

- **MVC Pattern**: Separates business logic, data, and presentation
- **Facade Pattern**: Simplifies external API integration
- **Repository Pattern**: Abstracts data access logic
- **Factory Pattern**: User creation with role-based instantiation

---

## Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)
- **Git**
- **Firebase Account** (for authentication setup)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vishal-JG/SC2006_SCSE_Local-Connect.git
   cd SC2006_SCSE_Local-Connect
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure Firebase**
   - Obtain your Firebase Admin SDK JSON file from Firebase Console
   - Save it as `firebase-adminsdk.json` in the `backend` directory
   - Create a `.env` file with the following:
     ```env
     GOOGLE_APPLICATION_CREDENTIALS=firebase-adminsdk.json
     GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     ADMIN_EMAILS=admin1@example.com,admin2@example.com
     PROVIDER_EMAILS=provider1@example.com,provider2@example.com
     ```

6. **Initialize the database**
   ```bash
   flask init-db
   flask seed-db  # Optional: populate with sample data
   ```

7. **Start the Flask server**
   ```bash
   flask run
   ```
   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Open a new terminal and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase (Client)**
   - Create `src/firebase.js` with your Firebase configuration:
     ```javascript
     import { initializeApp } from 'firebase/app';
     import { getAuth } from 'firebase/auth';

     const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-auth-domain",
       projectId: "your-project-id",
       storageBucket: "your-storage-bucket",
       messagingSenderId: "your-messaging-sender-id",
       appId: "your-app-id"
     };

     const app = initializeApp(firebaseConfig);
     export const auth = getAuth(app);
     ```

4. **Start the development server**
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

### Accessing the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Create an account or login with existing credentials
3. Explore the platform as a Consumer, Provider, or Admin

---

## API Documentation

LocalConnect provides comprehensive API documentation using **Swagger/OpenAPI**:

### Accessing API Documentation

1. Ensure the Flask backend is running:
   ```bash
   cd backend
   flask run
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5000/api/docs
   ```

### API Endpoints Overview

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Authentication** | `/api/login` | User authentication |
| **Services** | `/api/services` | CRUD operations for services |
| **Bookings** | `/api/bookings` | Manage service bookings |
| **Reviews** | `/api/reviews` | Add, view, delete reviews |
| **Bookmarks** | `/api/bookmarks` | Manage user bookmarks |
| **Admin** | `/api/admin/*` | Administrative operations |
| **External APIs** | `/api/external/*` | OneMap and Data.gov.sg integration |

For detailed API specifications, parameters, and examples, visit the Swagger UI documentation.

---

## Software Engineering Practices

### Development Methodology

- **Agile/SCRUM**
  - Weekly sprints with clear objectives
  - Sprint planning and retrospectives
  - Task tracking via Notion
  - Regular standup meetings

### Code Quality

- **Documentation**
  - Comprehensive inline code comments
  - API documentation with Swagger
  - Detailed README and setup guides
  - Code architecture documentation

- **Code Standards**
  - Consistent formatting with Prettier
  - PEP 8 compliance for Python code
  - ESLint for JavaScript/React
  - Meaningful variable and function names

### Design Principles

- **Component Reusability**
  - Reusable React components (Navbar, BackButton, ReviewSection)
  - DRY (Don't Repeat Yourself) principle
  - Modular code organization

- **Separation of Concerns**
  - MVC architecture in backend
  - Component-based architecture in frontend
  - Clear separation between business logic and presentation

### Version Control

- **Git Workflow**
  - Feature branch strategy
  - Pull requests for code review
  - Meaningful commit messages
  - Protected main branch

---

## Challenges & Solutions

### Challenge 1: Limited Web Development Experience

**Problem**: Team members had minimal experience with full-stack web development and frontend-backend integration.

**Solution**: 
- Conducted knowledge-sharing sessions
- Pair programming for complex features
- Extensive code reviews and documentation
- Utilized online resources and tutorials

### Challenge 2: GitHub Collaboration Issues

**Problem**: Frequent merge conflicts and inconsistent code due to multiple developers working simultaneously.

**Solution**:
- Established clear branch naming conventions
- Implemented code review process
- Used feature branches for development
- Regular team syncs to coordinate work

### Challenge 3: Unorganized Project Structure

**Problem**: Initial codebase lacked proper organization, making it difficult to maintain and scale.

**Solution**:
- Adopted MVC architecture for backend
- Implemented component-based structure for frontend
- Applied Facade design pattern for external API integration
- Created clear folder hierarchy and naming conventions

### Challenge 4: Real-time Data Integration

**Problem**: Integrating multiple external APIs (OneMap, Data.gov.sg) with different data formats.

**Solution**:
- Created unified data access layer
- Implemented error handling and retry logic
- Added caching mechanisms for frequently accessed data
- Standardized response formats across all endpoints

---

## Contributors

This project was developed as part of the **SC2006 Software Engineering** course at **Nanyang Technological University (NTU)**.

### Development Team

- **Jesmond Tay Soon Xiang** - Frontend Development & API integration
- **Preesha** - Frontend Development
- **Team Member 3** - Backend Development
- **Pham Hung** - Backend Development
- **Vishal JS** - Backend Development & Database

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Nanyang Technological University** for providing the learning opportunity
- **Firebase** for authentication services
- **OneMap Singapore** for mapping services
- **Data.gov.sg** for public datasets
- All contributors and testers who helped improve the platform

---

## Contact & Support

For questions, issues, or contributions, please:

- **Open an Issue**: [GitHub Issues](https://github.com/Vishal-JG/SC2006_SCSE_Local-Connect/issues)
- **Submit a Pull Request**: [GitHub Pull Requests](https://github.com/Vishal-JG/SC2006_SCSE_Local-Connect/pulls)
- **Contact Repository Owner**: [Vishal-JG](https://github.com/Vishal-JG)

---

<div align="center">

**Made by NTU Software Engineering Students**

Star this repository if you find it helpful!

</div>
