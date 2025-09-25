# InfraTelC Suite - API Documentation

## Base URL
```
https://avocvdaqlgnvrqfcfvwx.supabase.co/functions/v1/api
```

## Authentication
All API requests must include an Authorization header with a valid Supabase JWT token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Common Response Format
All API responses follow this structure:
```json
{
  "data": {},     // Response data (on success)
  "error": ""     // Error message (on failure)
}
```

## Endpoints

### Health Check
Check API availability.

**GET** `/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Work Orders

#### List Work Orders
**GET** `/work-orders`

**Response:**
```json
[
  {
    "id": "uuid",
    "order_number": "WO-2024-001",
    "title": "Instalación Antena",
    "description": "Instalación de antena en sitio",
    "status": "assigned",
    "priority": "high",
    "work_type": "installation",
    "assigned_to": "uuid",
    "site_id": "uuid",
    "estimated_hours": 8,
    "actual_hours": 0,
    "scheduled_date": "2024-01-15T09:00:00Z",
    "started_at": null,
    "completed_at": null,
    "created_at": "2024-01-15T08:00:00Z",
    "sites": {
      "name": "Site Name",
      "address": "Site Address"
    },
    "profiles": {
      "full_name": "Worker Name"
    }
  }
]
```

#### Get Work Order
**GET** `/work-orders/{id}`

**Response:** Single work order object (same structure as list item)

#### Create Work Order
**POST** `/work-orders`

**Request Body:**
```json
{
  "title": "Nueva Orden",
  "description": "Descripción de la orden",
  "work_type": "installation",
  "priority": "medium",
  "site_id": "uuid",
  "assigned_to": "uuid",
  "estimated_hours": 4,
  "scheduled_date": "2024-01-16T09:00:00Z"
}
```

#### Update Work Order
**PUT** `/work-orders/{id}`

**Request Body:** Partial work order object with fields to update

---

### Timesheets

#### List Timesheets
**GET** `/timesheets`

**Query Parameters:**
- `employee_id` (optional): Filter by employee
- `date` (optional): Filter by specific date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": "uuid",
    "employee_id": "uuid",
    "date": "2024-01-15",
    "check_in_time": "2024-01-15T08:00:00Z",
    "check_out_time": "2024-01-15T17:00:00Z",
    "break_start_time": "2024-01-15T12:00:00Z",
    "break_end_time": "2024-01-15T13:00:00Z",
    "total_hours": 8,
    "overtime_hours": 0,
    "site_id": "uuid",
    "work_order_id": "uuid",
    "status": "approved",
    "location_check_in": {
      "latitude": -33.4489,
      "longitude": -70.6693,
      "timestamp": 1642233600000
    },
    "location_check_out": {
      "latitude": -33.4489,
      "longitude": -70.6693,
      "timestamp": 1642262400000
    },
    "profiles": {
      "full_name": "Employee Name"
    },
    "sites": {
      "name": "Site Name"
    }
  }
]
```

#### Create Timesheet Entry
**POST** `/timesheets`

**Request Body:**
```json
{
  "employee_id": "uuid",
  "date": "2024-01-15",
  "check_in_time": "2024-01-15T08:00:00Z",
  "site_id": "uuid",
  "work_order_id": "uuid",
  "location_check_in": {
    "latitude": -33.4489,
    "longitude": -70.6693,
    "timestamp": 1642233600000
  }
}
```

---

### Expenses

#### List Expenses
**GET** `/expenses`

**Query Parameters:**
- `user_id` (optional): Filter by user
- `status` (optional): Filter by approval status (pending, approved, rejected)

**Response:**
```json
[
  {
    "id": "uuid",
    "amount": 15000,
    "description": "Combustible",
    "document_number": "12345",
    "expense_date": "2024-01-15",
    "approval_status": "pending",
    "created_by": "uuid",
    "site_id": "uuid",
    "category_id": "uuid",
    "notes": "Gastos de viaje",
    "photos": ["base64_image_data"],
    "approved_by": null,
    "approved_at": null,
    "rejection_reason": null,
    "created_at": "2024-01-15T10:00:00Z",
    "profiles": {
      "full_name": "Employee Name"
    },
    "sites": {
      "name": "Site Name"
    },
    "expense_categories": {
      "name": "Transportation"
    }
  }
]
```

#### Create Expense
**POST** `/expenses`

**Request Body:**
```json
{
  "amount": 15000,
  "description": "Descripción del gasto",
  "document_number": "12345",
  "expense_date": "2024-01-15",
  "site_id": "uuid",
  "category_id": "uuid",
  "notes": "Notas adicionales",
  "photos": ["base64_image_data"]
}
```

---

### Sites

#### List Sites
**GET** `/sites`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Site Name",
    "description": "Site description",
    "status": "Activo",
    "budget": 1000000,
    "spent": 250000,
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid request data |
| 401  | Unauthorized - Invalid or missing authentication |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 405  | Method Not Allowed - HTTP method not supported |
| 500  | Internal Server Error - Server error |

## Mobile App Integration

The mobile app uses Capacitor for native functionality:

### Camera Integration
- Take photos for expense receipts
- Capture work order completion photos
- Store images as base64 data

### Geolocation Integration
- Automatic location capture for timesheet check-in/out
- Work order start/completion location tracking
- GPS coordinates stored in location objects

### Offline Support
- Network status monitoring
- Local data caching (future enhancement)
- Sync when connection restored

### Native Features
- Camera access for photo capture
- GPS location services
- Network status detection
- Device storage for caching

## Getting Started

1. **Authentication**: Obtain JWT token through Supabase Auth
2. **Test Connection**: Use `/health` endpoint to verify API access
3. **Explore Data**: Start with `/sites` to see available work locations
4. **Create Records**: Use POST endpoints to add new data
5. **Mobile Access**: Visit `/mobile` route for mobile-optimized interface

## Rate Limits

- 100 requests per minute per user
- 1000 requests per hour per user

## Support

For API support, contact the development team or check the system logs in Supabase Dashboard.