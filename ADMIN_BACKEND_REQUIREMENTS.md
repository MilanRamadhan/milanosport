# Admin Panel Backend Requirements

## Overview

Dokumentasi ini menjelaskan endpoint backend yang diperlukan untuk Admin Panel MilanoSport. Semua endpoint admin memerlukan autentikasi dan harus di-guard dengan middleware `isAdmin`.

---

## Authentication & Authorization

### Middleware Required

```javascript
// middleware/auth.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user.role) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
```

---

## API Endpoints

### 1. User Management

#### GET /api/admin/users

**Description:** Get all registered users
**Auth:** Required (Admin)
**Query Params:**

- `search` (optional): Search by name or email
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response:**

```json
{
  "status": 200,
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Users retrieved successfully"
}
```

#### GET /api/admin/users/:id

**Description:** Get user by ID
**Auth:** Required (Admin)

**Response:**

```json
{
  "status": 200,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User retrieved successfully"
}
```

#### PATCH /api/admin/users/:id

**Description:** Update user details
**Auth:** Required (Admin)

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": true
}
```

**Response:**

```json
{
  "status": 200,
  "data": { ...updatedUser },
  "message": "User updated successfully"
}
```

#### PATCH /api/admin/users/:id/toggle-role

**Description:** Toggle user role (admin/user)
**Auth:** Required (Admin)

**Response:**

```json
{
  "status": 200,
  "data": { ...updatedUser },
  "message": "User role updated successfully"
}
```

#### DELETE /api/admin/users/:id

**Description:** Delete user
**Auth:** Required (Admin)

**Response:**

```json
{
  "status": 200,
  "message": "User deleted successfully"
}
```

---

### 2. Finance Management

#### GET /api/admin/finance

**Description:** Get all finance records
**Auth:** Required (Admin)
**Query Params:**

- `type` (optional): Filter by 'income' or 'expense'
- `from` (optional): Start date (YYYY-MM-DD)
- `to` (optional): End date (YYYY-MM-DD)

**Response:**

```json
{
  "status": 200,
  "data": [
    {
      "_id": "finance_id",
      "type": "income",
      "category": "Booking Payment",
      "amount": 500000,
      "description": "Booking payment for Field A",
      "date": "2024-01-01",
      "createdBy": "admin_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Finance records retrieved successfully"
}
```

#### POST /api/admin/finance

**Description:** Create new finance record
**Auth:** Required (Admin)

**Request Body:**

```json
{
  "type": "expense",
  "category": "Maintenance",
  "amount": 200000,
  "description": "Field maintenance",
  "date": "2024-01-01"
}
```

**Response:**

```json
{
  "status": 201,
  "data": { ...newRecord },
  "message": "Finance record created successfully"
}
```

#### PATCH /api/admin/finance/:id

**Description:** Update finance record
**Auth:** Required (Admin)

**Request Body:**

```json
{
  "amount": 250000,
  "description": "Updated description"
}
```

**Response:**

```json
{
  "status": 200,
  "data": { ...updatedRecord },
  "message": "Finance record updated successfully"
}
```

#### DELETE /api/admin/finance/:id

**Description:** Delete finance record
**Auth:** Required (Admin)

**Response:**

```json
{
  "status": 200,
  "message": "Finance record deleted successfully"
}
```

---

### 3. Analytics

#### GET /api/admin/analytics

**Description:** Get analytics dashboard data
**Auth:** Required (Admin)
**Query Params:**

- `from` (optional): Start date
- `to` (optional): End date

**Response:**

```json
{
  "status": 200,
  "data": {
    "totalRevenue": 5000000,
    "totalBookings": 150,
    "totalUsers": 45,
    "revenueByMonth": [
      { "month": "January", "revenue": 1000000 },
      { "month": "February", "revenue": 1500000 }
    ],
    "bookingsByStatus": [
      { "status": "pending", "count": 10 },
      { "status": "active", "count": 30 },
      { "status": "cancelled", "count": 5 }
    ],
    "topFields": [
      { "fieldName": "Field A", "bookings": 50, "revenue": 2000000 },
      { "fieldName": "Field B", "bookings": 40, "revenue": 1500000 }
    ]
  },
  "message": "Analytics retrieved successfully"
}
```

---

### 4. Activity Logs

#### GET /api/admin/logs

**Description:** Get activity logs
**Auth:** Required (Admin)
**Query Params:**

- `userId` (optional): Filter by user
- `action` (optional): Filter by action type
- `from` (optional): Start date
- `to` (optional): End date

**Response:**

```json
{
  "status": 200,
  "data": [
    {
      "_id": "log_id",
      "userId": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "action": "LOGIN",
      "details": "User logged in successfully",
      "ipAddress": "192.168.1.1",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ],
  "message": "Activity logs retrieved successfully"
}
```

---

## Database Schemas

### Finance Schema

```javascript
const financeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
```

### Activity Log Schema

```javascript
const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
```

---

## Implementation Priority

1. **Phase 1 (High Priority):**

   - User Management endpoints
   - Basic Finance CRUD
   - Extend existing booking endpoints with admin filters

2. **Phase 2 (Medium Priority):**

   - Analytics endpoints
   - Activity Logs recording

3. **Phase 3 (Enhancement):**
   - Export functionality (CSV/Excel)
   - Advanced filters and pagination
   - Real-time notifications

---

## Security Checklist

- [ ] All admin endpoints use `verifyToken` and `isAdmin` middleware
- [ ] Input validation for all request bodies
- [ ] Rate limiting on sensitive endpoints
- [ ] Log all admin actions to activity log
- [ ] Sanitize user inputs to prevent injection attacks
- [ ] Use HTTPS in production
- [ ] Implement CORS properly

---

## Testing

### Example Test Cases

**User Management:**

```javascript
// Test: Get all users as admin
// Test: Non-admin cannot access user list
// Test: Toggle user role successfully
// Test: Delete user removes all associated data
```

**Finance Management:**

```javascript
// Test: Create income record
// Test: Create expense record
// Test: Calculate net profit correctly
// Test: Filter by date range
```

**Activity Logs:**

```javascript
// Test: Log is created when admin updates booking
// Test: Log is created when user is deleted
// Test: Filter logs by action type
```

---

## Notes for Backend Developer

1. Pastikan semua response menggunakan format konsisten
2. Implementasikan error handling yang proper
3. Gunakan transaction untuk operasi yang melibatkan multiple collections
4. Index database fields yang sering di-query (userId, date, status)
5. Implement soft delete untuk user deletion (optional)
6. Tambahkan createdBy/updatedBy tracking untuk audit trail

---

## Frontend Integration

Semua endpoint sudah terintegrasi dengan `src/api/adminApi.ts`. Setelah backend endpoint ready, frontend akan langsung bisa consume API tersebut tanpa perlu perubahan signifikan.

**Environment Variable Required:**

```
VITE_API_BASE_URL=http://localhost:5000/api
```
