# 🎟️ Event Booking & Ticketing System Backend

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</p>

A RESTful API for an **Event Booking and Ticketing System** built with Node.js, Express.js, MongoDB, and Mongoose. The backend supports secure authentication, event management, ticket reservations, booking history, and ticket check-in with role-based authorization.

## ✨ Features

- 🔐 **Authentication & Authorization** — JWT authentication and role-based access control.
- 🔑 **Password Security** — Secure password hashing using bcrypt.
- 📅 **Event Management** — Create, update, publish, and cancel events.
- 🔎 **Event Discovery** — Search, filter, and paginate published events.
- 🎟️ **Ticket Booking** — Reserve tickets and generate unique ticket codes.
- 📊 **Seat Availability** — Track event capacity and prevent overselling through atomic seat reservations.
- 📋 **Booking Management** — View booking details and personal booking history.
- ❌ **Booking Cancellation** — Cancel eligible future bookings and release seats.
- ✅ **Ticket Check-in** — Validate tickets and prevent duplicate check-ins.
- 🛡️ **Security Middleware** — Helmet, CORS configuration, and API rate limiting.
- ❤️ **Health Check** — Monitor API availability through a health endpoint.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API and routing |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| JavaScript | Application logic |
| JSON Web Token (JWT) | Authentication |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| CORS | Cross-origin request configuration |
| Morgan | HTTP request logging |
| express-rate-limit | API rate limiting |
| dotenv | Environment configuration |

## 📁 Project Structure

```text
event-ticketing-backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   └── booking.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   └── booking.routes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── httpError.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── LICENSE
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (version 18 or later)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a [MongoDB Atlas](https://www.mongodb.com/atlas) account
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/event-ticketing-backend.git
cd event-ticketing-backend
```

Replace `YOUR_USERNAME` with your GitHub username and the repository name with your actual repository name.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root by copying `.env.example`.

**Windows Command Prompt:**

```cmd
copy .env.example .env
```

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

Configure your `.env` file:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/event_ticketing
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

Use your MongoDB Atlas connection string if you are using MongoDB Atlas. Replace the JWT secret with a strong, randomly generated value. Never commit your `.env` file to GitHub.

### 4. Start the server

Development mode with automatic restarts:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The server will start at:

```text
http://localhost:5000
```

Verify that the API is running:

```http
GET http://localhost:5000/api/health
```

Example response:

```json
{
  "status": "ok",
  "service": "event-ticketing-api",
  "timestamp": "2026-10-17T00:00:00.000Z"
}
```

The timestamp will reflect the actual time of the request.

## 🔑 Authentication

Register or log in to receive a JWT access token. Include the token in the `Authorization` header for protected routes.

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Create an account

`POST /api/auth/register`

```json
{
  "name": "Asha Patel",
  "email": "asha@example.com",
  "password": "strongpass123"
}
```

### Log in

`POST /api/auth/login`

```json
{
  "email": "asha@example.com",
  "password": "strongpass123"
}
```

### Get the current user

`GET /api/auth/me`

Requires a valid JWT.

## 📡 API Documentation

Base URL:

```text
http://localhost:5000/api
```

### Authentication Routes

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Authenticated |

### Event Routes

| Method | Endpoint | Access |
|---|---|---|
| GET | `/events` | Public |
| GET | `/events/:id` | Public |
| GET | `/events/admin/all` | Admin |
| POST | `/events` | Admin |
| PATCH | `/events/:id` | Admin |
| DELETE | `/events/:id` | Admin |

The event listing endpoint supports these query parameters:

- `search` — Search event titles, descriptions, and categories.
- `category` — Filter by category.
- `city` — Filter by city.
- `from` and `to` — Filter by start date.
- `minPrice` and `maxPrice` — Filter by ticket price.
- `page` and `limit` — Paginate results.

Example:

```http
GET /api/events?city=Pune&category=Music&page=1&limit=10
```

### Booking & Ticket Routes

| Method | Endpoint | Access |
|---|---|---|
| POST | `/bookings/event/:eventId` | Authenticated |
| GET | `/bookings/my` | Authenticated |
| GET | `/bookings/:id` | Booking owner or admin |
| POST | `/bookings/:id/cancel` | Booking owner or admin |
| GET | `/bookings/admin/all` | Admin |
| POST | `/bookings/check-in` | Admin |

## 🎫 Booking Example

Reserve two tickets for a published event.

`POST /api/bookings/event/:eventId`

```json
{
  "quantity": 2,
  "attendeeName": "Asha Patel",
  "attendeeEmail": "asha@example.com"
}
```

A successful response contains the booking reference, total amount, and generated ticket codes.

```json
{
  "success": true,
  "data": {
    "bookingReference": "EVT-A1B2C3D4E5",
    "quantity": 2,
    "totalAmount": 1598,
    "currency": "INR",
    "status": "confirmed",
    "paymentStatus": "unpaid",
    "tickets": [
      {
        "ticketCode": "TKT-EXAMPLE001",
        "attendeeName": "Asha Patel",
        "attendeeEmail": "asha@example.com"
      }
    ]
  }
}
```

The response above is illustrative. Actual booking references and ticket codes are generated dynamically, and the number of ticket entries matches the requested quantity.

## 🛠️ Admin Setup

Registration creates regular user accounts by default. To grant admin access, update the account role directly in your trusted MongoDB environment.

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Log in again after changing the role to obtain a new JWT. Never expose an endpoint that allows users to promote themselves to admin.

Admins can create and manage events, view bookings, and check in tickets.

## 🧪 Suggested Testing Workflow

1. Register a regular user.
2. Create and promote a separate admin account.
3. Log in as admin and create a future event with `status: "published"`.
4. Log in as a regular user and browse available events.
5. Book tickets and retrieve your booking history.
6. Use an admin account to check in a ticket.
7. Attempt to check in the same ticket again and verify that duplicate check-in is rejected.
8. Cancel a future booking and verify that the reserved seats are released.

You can test the endpoints with [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/).

## 🔒 Security & Implementation Notes

- Passwords are hashed before storage.
- Protected endpoints require JWT authentication.
- Admin routes enforce role-based authorization.
- Event seat reservations use an atomic database update to reduce overselling.
- Request payload sizes are limited, and API requests are rate-limited.
- Ticket codes should be treated as sensitive information.

**Before production deployment:**

- Add automated unit and integration tests.
- Add request schema validation.
- Integrate a payment provider such as Razorpay or Stripe with verified server-side webhooks.
- Add email confirmations and QR-code ticket generation if needed.
- Configure production CORS, secrets, logging, and monitoring.
- Use a MongoDB replica set for transaction support in booking cancellation.
- Define refund policies and event cancellation workflows.

**Payment integration is not included.** The API currently reserves tickets and records payment status; it does not process actual payments.

## 🚀 Future Enhancements

- React-based event discovery and booking interface
- Payment gateway integration
- QR-code ticket generation and scanning
- Email notifications and booking confirmations
- Organizer dashboard and event analytics
- Automated refunds and cancellation notifications
- Automated API testing and CI/CD deployment

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ajinkya Dhatrak**

GitHub: [ajinkya02](https://github.com/ajinkya029)

---

⭐ If you find this project useful, consider giving the repository a star!
