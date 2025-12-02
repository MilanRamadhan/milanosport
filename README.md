# MilanoSport App - Sports Field Booking System

> 🎓 **UAS Project - Comprehensive Admin Panel Implementation**

Aplikasi reservasi lapangan olahraga berbasis web dengan **Admin Panel lengkap** untuk management users, bookings, finance, dan analytics.

## 🌟 Features

### User Features

- ✅ Authentication (Login/Register)
- ✅ Browse & Search Fields
- ✅ Real-time Schedule Checking
- ✅ Booking with Payment Proof Upload
- ✅ My Bookings Management
- ✅ User Profile

### 🆕 Admin Panel (NEW!)

- ✅ **Dashboard Overview** - Statistics & KPIs
- ✅ **Bookings Management** - Approve/Reject payments, view details
- ✅ **Users Management** - CRUD users, toggle admin roles
- ✅ **Finance Management** - Track income/expense, net profit
- ✅ **Activity Logs** - Track all user actions
- ✅ **Analytics** (Coming soon) - Charts & reports
- ✅ Responsive Design
- ✅ Role-based Access Control (RBAC)

## 📚 Documentation

- **[UAS Documentation](UAS_DOCUMENTATION.md)** - Complete project documentation for UAS submission
- **[Backend Requirements](ADMIN_BACKEND_REQUIREMENTS.md)** - API endpoints & backend implementation guide

## 🛠️ Tech Stack

## 🛠️ Tech Stack

**Frontend:**

- React 18 + TypeScript
- Vite
- React Router v6
- Custom CSS

**Backend:**

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (File Upload)

**DevOps:**

- Docker + Nginx
- PM2 (Process Manager)
- GitHub Actions (CI/CD ready)

## 🏗️ Architecture

## 🏗️ Architecture

```
┌─────────────────┐
│     Nginx       │  Port 80 (Web Server)
│  Reverse Proxy  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼───┐
│React  │ │Express│
│Frontend│ │Backend│
│(Vite) │ │ API   │
└───────┘ └──┬────┘
              │
         ┌────▼────┐
         │ MongoDB │
         └─────────┘
```

**Routing:**

- `/` → Frontend (React SPA)
- `/api/*` → Backend API
- `/admin/*` → Admin Panel (Frontend)

## 📂 Project Structure

```
milanosport-app/
├── src/
│   ├── api/              # API client functions
│   │   ├── authApi.ts
│   │   ├── bookingApi.ts
│   │   ├── fieldApi.ts
│   │   └── adminApi.ts   # 🆕 Admin endpoints
│   ├── components/       # React components
│   │   ├── common/
│   │   └── ui/
│   ├── context/          # React Context (Auth, etc)
│   ├── pages/
│   │   ├── Admin/        # 🆕 Admin Panel pages
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminHome.tsx
│   │   │   ├── BookingsList.tsx
│   │   │   ├── UsersManagement.tsx
│   │   │   ├── FinanceManagement.tsx
│   │   │   └── ActivityLogs.tsx
│   │   ├── Auth/
│   │   ├── Profile/
│   │   └── Reservation/
│   └── types/            # TypeScript types
├── public/               # Static assets
├── docs/                 # Documentation
├── .github/workflows/    # CI/CD configs
└── docker/               # Docker configs
```

## Docker

Aplikasi ini tersedia sebagai Docker image di Docker Hub:
[msyukri19/milanosport:v1-UTS](https://hub.docker.com/r/msyukri19/milanosport)

### Menjalankan dengan Docker

1. Pull image dari Docker Hub:

```bash
docker pull msyukri19/milanosport:v1-UTS
```

2. Setup environment variables (opsional):

```bash
# Backend MongoDB URI
MONGODB_URI=mongodb://host:port/database

# JWT Secret
JWT_SECRET=your_jwt_secret
```

3. Jalankan container:

```bash
docker run -d \
  -p 80:80 \
  -e MONGODB_URI=mongodb://host:port/database \
  -e JWT_SECRET=your_jwt_secret \
  msyukri19/milanosport:v1-UTS
```

3. Buka aplikasi di browser:

```
http://localhost
```

### Build Image Lokal

Jika ingin build image secara lokal:

1. Clone repository:

```bash
git clone https://github.com/muhammadsyukri19/milanosport.git
cd milanosport
```

2. Build image:

```bash
docker build -t milanosport-app .
```

3. Jalankan container:

```bash
docker run -d -p 80:80 milanosport-app
```

## Development

### Prerequisites

- Node.js 18 atau lebih tinggi
- npm 8 atau lebih tinggi

### Setup Development

1. Install dependencies:

```bash
npm install
```

2. Jalankan development server:

```bash
npm run dev
```

3. Build untuk production:

```bash
npm run build
```

## 🔐 Admin Access

To access admin panel:

1. Login with admin credentials
2. Navigate to `/admin` or click "Admin Panel" in navbar (only visible for admins)

Admin features include:

- Dashboard with statistics
- Manage all bookings
- Manage users & roles
- Track finances
- View activity logs

**Default Admin:** (Configure in backend)

- Email: `admin@milanosport.com`
- Password: `admin123` (Change in production!)

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

### Backend (Railway/Render)

1. Connect GitHub repository
2. Configure environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret_key
   PORT=5000
   ```
3. Deploy!

### Environment Variables

**Frontend (.env):**

```
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend (.env):**

```
MONGODB_URI=mongodb://localhost:27017/milanosport
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## 📊 Database Schema

### User

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Boolean (true = admin, false = user),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking

```javascript
{
  userId: ObjectId (ref: User),
  fieldId: ObjectId (ref: Field),
  date: Date,
  startTime: String,
  endTime: String,
  customerName: String,
  customerPhone: String,
  totalHours: Number,
  totalPrice: Number,
  status: String (pending|active|cancelled),
  paymentStatus: String (pending|paid|failed),
  proofOfPayment: String,
  notes: String
}
```

### Finance (🆕)

```javascript
{
  type: String (income|expense),
  category: String,
  amount: Number,
  description: String,
  date: Date,
  createdBy: ObjectId (ref: User)
}
```

### Activity Log (🆕)

```javascript
{
  userId: ObjectId (ref: User),
  action: String,
  details: String,
  ipAddress: String,
  timestamp: Date
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run E2E tests
npm run test:e2e
```

## 🤝 Contributing

This is a university project (UAS). Contributions are currently limited to team members.

## 📝 Changelog

### Version 2.0 (UAS Release) - December 2024

- ✨ Added comprehensive Admin Panel
- ✨ Users Management with role toggle
- ✨ Finance Management (income/expense tracking)
- ✨ Activity Logs
- ✨ Enhanced Bookings Management
- ✨ Dashboard with statistics
- 🔄 Refactored routing with nested routes
- 📚 Complete documentation

### Version 1.0 (UTS Release) - November 2024

- ✅ Authentication & Authorization
- ✅ Field browsing & booking
- ✅ User profile management
- ✅ Basic admin dashboard

## 📧 Contact

**Project Team:**

- Muhammad Syukri (@muhammadsyukri19)

**Repository:** [github.com/muhammadsyukri19/milanosport](https://github.com/muhammadsyukri19/milanosport)

## 📄 License

This project is developed for educational purposes (UAS Project).

---

**⭐ Star this repo if you find it useful!**
