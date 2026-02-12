# Doctor Prescription Manager

A Node.js TypeScript server for doctors to manage patient prescriptions with flexible timing options.

## Features

- 🔐 **Doctor Authentication** - JWT-based login/register with Zod validation
- 💊 **Medicine Search** - Autocomplete search with debouncing (name, dosage, type)
- 📝 **Prescription Management** - Create prescriptions with patient info and medicine
- ⏰ **Flexible Timing** - Morning, Afternoon, Evening + custom precise times
- 🗃️ **PostgreSQL + Prisma** - Type-safe database operations

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Configure Database

Update `.env` with your PostgreSQL connection:
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/doctor_prescriptions"
JWT_SECRET="your-secret-key"
PORT=3000
```

### 2. Create Database & Run Migrations

```bash
# Create the database first in PostgreSQL
createdb doctor_prescriptions

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed sample data (medicines + test doctor)
npm run prisma:seed
```

### 3. Start Server

```bash
npm run dev
```

Visit http://localhost:3000

### Test Account
- Email: `doctor@test.com`
- Password: `password123`

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new doctor

### Medicines
- `GET /api/medicines/search?query=para` - Search medicines (for autocomplete)
- `GET /api/medicines` - List all medicines
- `POST /api/medicines` - Create medicine (protected)

### Prescriptions
- `POST /api/prescriptions` - Create prescription (protected)
- `GET /api/prescriptions` - List doctor's prescriptions (protected)
- `GET /api/prescriptions/:id` - Get single prescription (protected)
- `DELETE /api/prescriptions/:id` - Delete prescription (protected)

## Tech Stack
- Express + TypeScript
- Prisma ORM
- PostgreSQL
- Zod validation
- JWT authentication
- bcryptjs for password hashing
