# Queue Management System - Project Map

## 📊 Project Overview

```
Queue Management System (QMS)
│
├── 🏠 Public Services (No Login Required)
│   ├── Homepage (/)
│   ├── Ticket Booking (/booking/kiosk)
│   ├── Queue Display (/display/queue)
│   └── Mobile Booking (/mobile/book)
│
├── 👨‍💼 Operator Portal (Operator Login Required)
│   └── Operator Dashboard (/operator/dashboard)
│
├── 🏢 Admin Hub (Admin Login Required)
│   ├── Dashboard (/admin)
│   ├── Branches (/admin/branches)
│   ├── Services (/admin/services)
│   ├── Devices (/admin/devices)
│   ├── Operators (/admin/operators)
│   └── Settings (/admin/settings)
│
└── 🔐 Authentication (/login)
```

## 📁 Directory Structure

```
/vercel/share/v0-project/
│
├── 📂 app/                           # Next.js App Router
│   ├── 📂 admin/                     # Admin Hub
│   │   ├── page.tsx                  # Dashboard (home)
│   │   ├── layout.tsx                # Admin layout with sidebar
│   │   ├── 📂 branches/
│   │   │   └── page.tsx              # Branch management
│   │   ├── 📂 services/
│   │   │   └── page.tsx              # Service configuration
│   │   ├── 📂 devices/
│   │   │   └── page.tsx              # Device registration
│   │   ├── 📂 operators/
│   │   │   └── page.tsx              # Staff management
│   │   └── 📂 settings/
│   │       └── page.tsx              # System settings
│   │
│   ├── 📂 booking/
│   │   └── 📂 kiosk/
│   │       └── page.tsx              # Ticket booking interface
│   │
│   ├── 📂 display/
│   │   └── 📂 queue/
│   │       └── page.tsx              # Queue display screen
│   │
│   ├── 📂 operator/
│   │   └── 📂 dashboard/
│   │       └── page.tsx              # Operator service interface
│   │
│   ├── 📂 mobile/
│   │   └── 📂 book/
│   │       └── page.tsx              # Mobile booking page
│   │
│   ├── 📂 login/
│   │   └── page.tsx                  # Login page
│   │
│   ├── page.tsx                      # Homepage
│   ├── layout.tsx                    # Root layout with providers
│   └── globals.css                   # Global styles
│
├── 📂 lib/                           # Business Logic
│   ├── types.ts                      # All TypeScript type definitions
│   ├── 📂 db/
│   │   ├── api.ts                    # 19 simulated API endpoints
│   │   └── mock-data.ts              # Complete mock dataset
│   └── utils.ts                      # Utility functions
│
├── 📂 context/                       # React Context Providers
│   ├── auth-context.tsx              # Authentication state
│   └── queue-context.tsx             # Queue operations & sync
│
├── 📂 components/
│   ├── 📂 ui/                        # shadcn/ui components
│   ├── 📂 layouts/                   # Layout components
│   └── 📂 shared/                    # Shared components
│
├── 📂 hooks/                         # Custom React Hooks
│   ├── use-mobile.tsx                # Mobile detection
│   └── use-toast.ts                  # Toast notifications
│
├── 📄 README.md                      # Complete documentation
├── 📄 QUICKSTART.md                  # 5-minute getting started
├── 📄 IMPLEMENTATION_SUMMARY.md       # Technical implementation details
├── 📄 PROJECT_MAP.md                 # This file
│
├── 📄 package.json                   # Dependencies
├── 📄 tsconfig.json                  # TypeScript config
├── 📄 tailwind.config.ts             # Tailwind configuration
├── 📄 next.config.mjs                # Next.js configuration
└── 📄 postcss.config.mjs             # PostCSS configuration
```

## 🔗 User Flows

### Flow 1: Customer Booking (No Login)
```
Homepage
  ↓
Booking Kiosk (/booking/kiosk)
  ├── Select Branch
  ├── Select Service
  ├── Enter Details
  └── Get Ticket
      ↓
      View Queue Display (/display/queue)
```

### Flow 2: Mobile Booking (No Login)
```
Homepage
  ↓
Mobile Booking (/mobile/book)
  ├── Select Branch
  ├── Select Service
  ├── Enter Details (Email)
  └── Confirmation
      ↓
      Email Confirmation
```

### Flow 3: Operator Service (Login Required)
```
Homepage → Login (/login)
  ↓
Operator Dashboard (/operator/dashboard)
  ├── Call Next Customer
  ├── View Customer Details
  ├── Action: Complete/Skip/Break
  ├── See Queue Overview
  └── View Statistics
```

### Flow 4: Admin Management (Login Required)
```
Homepage → Login (/login)
  ↓
Admin Dashboard (/admin)
  ├── Branch Management (/admin/branches)
  ├── Service Configuration (/admin/services)
  ├── Device Registration (/admin/devices)
  ├── Operator Management (/admin/operators)
  ├── System Settings (/admin/settings)
  └── View Analytics
```

## 📊 Data Models

### User
```typescript
id: string
name: string
email: string
role: 'admin' | 'operator' | 'customer'
branchId?: string
operatorId?: string
```

### Branch
```typescript
id: string
name: string
location: string
address: string
phoneNumber: string
isActive: boolean
```

### Service
```typescript
id: string
branchId: string
name: string
description: string
averageTimeMinutes: number
maxWaitTime: number
status: 'active' | 'inactive'
```

### Ticket
```typescript
id: string
ticketNumber: string (A001, B001, etc.)
branchId: string
serviceId: string
customerId: string
status: 'waiting' | 'called' | 'serving' | 'completed' | 'skipped' | 'on-hold'
positionInQueue: number
estimatedWaitTime?: number
createdAt: string
calledAt?: string
completedAt?: string
```

### Operator
```typescript
id: string
userId: string
name: string
branchId: string
status: 'idle' | 'serving' | 'break' | 'offline'
currentTicketId?: string
shiftsCompleted: number
customersServed: number
```

### Device
```typescript
id: string
branchId: string
name: string
type: 'kiosk' | 'display' | 'operator'
location: string
isActive: boolean
lastHeartbeat: string
```

## 🔐 Authentication Flows

### Login Process
```
User enters email/password
    ↓
System checks against mock users
    ↓
Generate JWT token (simulated)
    ↓
Store in localStorage
    ↓
Redirect based on role
    ├── admin → /admin
    ├── operator → /operator/dashboard
    └── customer → / (homepage)
```

### Session Management
```
Login
  ↓
Store token + user in localStorage
  ↓
Wrap app with AuthProvider
  ↓
useAuth() hook accesses auth state
  ↓
Logout → Clear localStorage
```

## 🔄 Data Flow

### Ticket Creation Flow
```
Customer fills booking form
    ↓
Submit to createTicket()
    ↓
API generates unique ticket number
    ↓
Add to in-memory queue
    ↓
Update QueueContext
    ↓
All displays refresh automatically
    ↓
Queue Display shows new ticket
```

### Operator Service Flow
```
Operator clicks "Call Next Customer"
    ↓
API retrieves first waiting ticket
    ↓
Update ticket status to 'called'
    ↓
Update operator status to 'serving'
    ↓
QueueContext broadcasts update
    ↓
All screens show updated queue
    ↓
Operator clicks "Complete"
    ↓
Ticket marked as completed
    ↓
Operator set back to idle
    ↓
Queue updates for all viewers
```

## 📱 Responsive Breakpoints

```
Mobile (< 640px)
  ├── Single column layout
  ├── Full-width forms
  └── Stacked navigation

Tablet (640px - 1024px)
  ├── Two column layout
  ├── Flexible spacing
  └── Adjusted grid

Desktop (> 1024px)
  ├── Multi-column layout
  ├── Sidebar navigation
  └── Full grid layout
```

## 🎨 Component Hierarchy

### Layout Components
```
RootLayout
├── AuthProvider
└── QueueProvider
    ├── AdminLayout (for /admin routes)
    │   ├── Sidebar
    │   ├── Header
    │   └── MainContent
    └── PublicLayout (for other routes)
        ├── Header
        └── MainContent
```

### Page Components
```
Dashboard
├── StatsCard (x4)
├── ServicesGrid
├── ActivityChart
└── SidebarSections

BookingKiosk
├── Step1: BranchSelector
├── Step2: ServiceSelector
├── Step3: DetailForm
└── Step4: Confirmation

OperatorDashboard
├── Header
├── MainServiceArea
│   ├── CurrentCustomer
│   └── ActionButtons
├── Sidebar
│   ├── Statistics
│   ├── StatusControl
│   └── QueueOverview
└── WaitingCustomersList
```

## 🔧 API Endpoints (19 Total)

### Authentication (2)
- `POST /api/auth/login`
- `POST /api/auth/register`

### Branches (4)
- `GET /api/branches`
- `GET /api/branches/:id`
- `POST /api/branches`
- `PATCH /api/branches/:id`

### Services (3)
- `GET /api/services`
- `GET /api/services/:id`
- `POST /api/services`

### Tickets (4)
- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/:id`
- `PATCH /api/tickets/:id`

### Queue (2)
- `GET /api/queues/:branchId`
- `GET /api/queues/:branchId/stats`

### Operators (2)
- `GET /api/operators`
- `POST /api/operators/call`

### Devices (2)
- `GET /api/devices`
- `POST /api/devices/register`

### Settings (2)
- `GET /api/settings`
- `PATCH /api/settings`

## 📈 Performance Metrics

| Metric | Target | Implementation |
|--------|--------|-----------------|
| Initial Load | < 2s | Optimized with code splitting |
| Page Navigation | Instant | Client-side routing |
| Queue Refresh | 2s | Auto-refresh interval |
| API Response | 100-400ms | Simulated delays |
| Mobile Performance | Optimized | Touch-friendly design |

## 🧪 Testing Checklist

### Admin Features
- [ ] View dashboard with stats
- [ ] Create new branch
- [ ] Edit branch details
- [ ] Create service for branch
- [ ] Register device
- [ ] View operators
- [ ] Change system settings

### Booking Features
- [ ] Create ticket at kiosk
- [ ] Select branch and service
- [ ] Get ticket number
- [ ] Print ticket
- [ ] Mobile booking flow
- [ ] Email confirmation

### Display Features
- [ ] Show current customer
- [ ] Show waiting queue
- [ ] Auto-refresh updates
- [ ] Display statistics
- [ ] Branch selector

### Operator Features
- [ ] Call next customer
- [ ] View customer details
- [ ] Complete service
- [ ] Skip customer
- [ ] Change status
- [ ] See queue list
- [ ] Track statistics

### Auth Features
- [ ] Login with correct credentials
- [ ] Access control by role
- [ ] Session persistence
- [ ] Logout functionality
- [ ] Try restricted pages

## 🚀 Deployment Checklist

- [ ] Run `pnpm build` successfully
- [ ] Check build output for errors
- [ ] Test dev server `pnpm dev`
- [ ] Verify all pages load correctly
- [ ] Test mobile responsiveness
- [ ] Check cross-browser compatibility
- [ ] Verify localStorage functionality
- [ ] Test all user flows
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Verify deployment

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Complete documentation |
| QUICKSTART.md | 5-minute getting started |
| IMPLEMENTATION_SUMMARY.md | Technical details |
| PROJECT_MAP.md | This file - visual structure |

## 🔍 Key Files to Review

| File | Purpose | Importance |
|------|---------|-----------|
| `/lib/types.ts` | All type definitions | ⭐⭐⭐ |
| `/lib/db/api.ts` | API endpoints | ⭐⭐⭐ |
| `/context/queue-context.tsx` | Queue state | ⭐⭐⭐ |
| `/context/auth-context.tsx` | Auth state | ⭐⭐⭐ |
| `/app/admin/page.tsx` | Dashboard | ⭐⭐ |
| `/app/operator/dashboard/page.tsx` | Operator UI | ⭐⭐ |
| `/app/booking/kiosk/page.tsx` | Booking flow | ⭐⭐ |

## 💡 Development Tips

1. **Understanding the Queue Flow**
   - Read `/lib/db/mock-data.ts` first
   - Check `/lib/types.ts` for models
   - Review `/context/queue-context.tsx` for operations

2. **Making Changes**
   - Edit types first in `/lib/types.ts`
   - Update API in `/lib/db/api.ts`
   - Update context if state logic changes
   - Update UI components

3. **Adding New Features**
   - Define types in `/lib/types.ts`
   - Add API endpoint in `/lib/db/api.ts`
   - Add context method in `/context/queue-context.tsx`
   - Create UI in appropriate route

4. **Debugging**
   - Check console for errors
   - Review localStorage in DevTools
   - Inspect component props in React DevTools
   - Check network tab for API calls

---

**This map provides a complete visual overview of the Queue Management System structure and organization.**
