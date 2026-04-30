# Quick Start Guide - Queue Management System

Get up and running with the QMS in 5 minutes!

## 1. Start the Application

```bash
pnpm dev
# or
npm run dev
```

Open http://localhost:3000 in your browser.

## 2. Choose Your User Role

### Option A: Administrator
Perfect for exploring the full system management interface.

**Credentials:**
```
Email: admin@institution.com
Password: admin123
```

**What you can do:**
- View system dashboard with real-time statistics
- Manage branches and locations
- Configure available services
- Register and manage devices (kiosks, displays)
- View operator performance
- Adjust system settings

**Quick Path:**
1. Click "Sign In"
2. Enter admin credentials
3. You'll land on the Admin Dashboard
4. Click on "Quick Access Services" cards to test other features

---

### Option B: Operator
Experience the staff interface for serving customers.

**Credentials:**
```
Email: john@institution.com
Password: operator123
```

**What you can do:**
- Call next customer from the waiting queue
- View customer details (name, phone, service)
- Mark customers as served, skipped, or on break
- Track your performance statistics
- See queue overview

**Quick Path:**
1. Click "Sign In"
2. Enter operator credentials
3. You'll land on the Operator Dashboard
4. Click "Call Next Customer" to start serving
5. Use Complete/Skip buttons to manage service

---

### Option C: Customer (No Login)
The public-facing services don't require login.

**Quick Paths:**
- **Ticket Booking Kiosk**: http://localhost:3000/booking/kiosk
  - Select a branch
  - Choose a service
  - Enter your name and phone
  - Get a ticket number
  
- **Queue Display**: http://localhost:3000/display/queue
  - View who's being served
  - See the waiting queue
  - Check estimated wait times

- **Mobile Booking**: http://localhost:3000/mobile/book
  - Book from anywhere
  - Enter email to receive confirmation
  - Get instant ticket number

## 3. Explore the System Flow

### Complete Workflow Demo:

1. **Start as Admin** (`admin@institution.com`)
   - Go to Dashboard
   - Note the current queue statistics
   - Click "Ticket Booking" to access kiosk

2. **Switch to Kiosk** (logout or open in new tab)
   - http://localhost:3000/booking/kiosk
   - Create a test ticket (any name)
   - Get ticket number

3. **View Queue Display** (another tab)
   - http://localhost:3000/display/queue
   - See your new ticket in the waiting queue
   - Watch statistics update

4. **Switch to Operator** (`john@institution.com`)
   - http://localhost:3000/operator/dashboard
   - Click "Call Next Customer"
   - See the first ticket displayed
   - Click "Complete" to serve

5. **Back to Display**
   - See the ticket moved to "Completed"
   - Queue position updated for remaining customers

## 4. Key Pages to Visit

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `/` | Overview and service links |
| Admin Dashboard | `/admin` | System management hub |
| Branches | `/admin/branches` | Manage locations |
| Services | `/admin/services` | Configure services |
| Devices | `/admin/devices` | Register kiosks/displays |
| Operators | `/admin/operators` | Staff management |
| Settings | `/admin/settings` | System configuration |
| Ticket Booking | `/booking/kiosk` | Customer ticket creation |
| Queue Display | `/display/queue` | Real-time queue view |
| Operator Dashboard | `/operator/dashboard` | Staff service interface |
| Mobile Booking | `/mobile/book` | Remote ticket booking |

## 5. Testing Real-time Features

The system auto-refreshes queue data every 2 seconds.

### Test in Multiple Browsers:

1. **Browser 1**: Admin Dashboard
2. **Browser 2**: Queue Display
3. **Browser 3**: Operator Dashboard

Now create a ticket in Browser 1 → see it appear in Browser 2 → call it in Browser 3 → watch status update across all!

## 6. Initial Data Overview

### Mock Data Included:

**Branches (3)**
- Main Branch (Downtown)
- East Branch (East Side)
- West Branch (West Side)

**Services (2-3 per branch)**
- General Consultation (15 min avg)
- Payment Processing (10 min avg)
- Document Processing (20 min avg)
- ID Renewal (25 min avg)

**Initial Queue (5 tickets)**
- Mix of waiting, being served, and completed statuses
- Real customer names and phone numbers

**Devices**
- 4 devices per branch (kiosks, displays, operator terminals)

**Operators**
- John (Main Branch) - Currently serving
- Sarah (Main Branch) - Idle
- Mike (East Branch) - Idle

## 7. Common Tasks

### Create a New Ticket
```
1. Visit: /booking/kiosk
2. Select: "Main Branch"
3. Choose: "General Consultation"
4. Enter: Your name
5. Click: "Get Ticket"
```

### Serve a Customer
```
1. Login: Operator (john@institution.com)
2. URL: /operator/dashboard
3. Click: "Call Next Customer"
4. When done: Click "Complete"
```

### Add a New Branch
```
1. Login: Admin (admin@institution.com)
2. URL: /admin/branches
3. Click: "New Branch"
4. Fill: Name, Location, Address, Phone
5. Save: Create Branch
```

### Configure Service Time
```
1. Login: Admin
2. URL: /admin/services
3. Select: Branch and Service
4. Edit: Average time, Max wait time
5. Save: Update Service
```

## 8. Customization Tips

### Modify Initial Data
Edit `/lib/db/mock-data.ts` to:
- Change branch names/locations
- Add/remove services
- Adjust service times
- Add more initial tickets
- Configure operators

### Change Colors
Edit `tailwind.config.ts` for color scheme or individual page files for component colors.

### Add More Operators
In `/lib/db/mock-data.ts`, add to `mockOperators` array with unique IDs and details.

### Modify Queue Statistics
Queue stats are calculated in real-time from ticket data in `/lib/db/api.ts`.

## 9. Deployment

### Deploy to Vercel
```bash
# Push to GitHub
git push origin main

# Vercel automatically detects and deploys
# No environment variables needed for demo
```

### Build for Production
```bash
pnpm build
pnpm start
```

## 10. Next Steps

### To Add Real Database:
1. Connect Supabase or Neon
2. Replace functions in `/lib/db/api.ts`
3. Add environment variables
4. Update context providers

### To Add WebSockets:
1. Install Socket.io: `pnpm add socket.io-client socket.io`
2. Create Socket.io service in `/lib/socket.ts`
3. Connect in relevant contexts
4. Replace polling with event listeners

### To Add Authentication:
1. Install Auth.js: `pnpm add next-auth`
2. Create auth configuration
3. Replace mock auth in `/context/auth-context.tsx`
4. Add provider to layout

## Troubleshooting

### Port 3000 Already in Use
```bash
# Use different port
pnpm dev -p 3001
```

### Styles Not Loading
```bash
# Clear cache and rebuild
rm -rf .next
pnpm dev
```

### Authentication State Lost
- Cookies might be expired
- Clear browser cache
- Try login again

### Queue Not Updating
- Check browser console for errors
- Verify QueueProvider is in layout
- Check that auto-refresh interval is working

## Demo Video Script

If recording a demo, follow this script:

1. **Intro** (5s) - Show homepage
2. **Admin Tour** (30s) - Navigate admin dashboard
3. **Create Ticket** (15s) - Use kiosk to create ticket
4. **Queue Display** (10s) - Show queue status
5. **Operator Service** (20s) - Call and serve customer
6. **Real-time Sync** (10s) - Show updates across screens

**Total**: ~90 seconds for a complete demo

## Support Resources

- **README.md** - Complete documentation
- **Type Definitions** - `/lib/types.ts` - All data models
- **API Layer** - `/lib/db/api.ts` - All endpoints
- **UI Components** - `/components/ui/` - shadcn components

---

**Ready to explore?** Start with the admin credentials and go from there! 🚀
