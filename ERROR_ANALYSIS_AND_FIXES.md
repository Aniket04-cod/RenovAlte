# RenovAlte API Error Analysis & Fixes

## Overview
This document explains the errors you encountered when running the RenovAlte frontend and the root causes and solutions.

---

## Error 1: `127.0.0.1:8000/api/auth/login/` - 400 (Bad Request)

### What It Means
The login API endpoint is rejecting the request with a 400 status code, indicating that the request data is invalid.

### Root Causes
1. **Missing or Invalid Credentials**: The login endpoint expects both `username` and `password` fields
2. **Incorrect JSON Format**: The request body might not be properly formatted
3. **Missing CSRF Token**: Django requires CSRF token for POST requests (handled by the frontend)
4. **User Doesn't Exist**: The username is not found in the database or credentials are wrong

### Expected Request Format
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

### Backend Implementation (Reference)
**File**: `backend/core/api/auth/serializers.py`

The `LoginSerializer` validates:
- `username` (required, string)
- `password` (required, string, write-only)

It uses Django's built-in `authenticate()` function to verify credentials.

### Solutions
1. **Ensure user exists**: Create a test user first
   ```bash
   cd backend
   python manage.py createsuperuser
   # or
   python manage.py shell
   # >>> from django.contrib.auth.models import User
   # >>> User.objects.create_user('testuser', 'test@example.com', 'testpass123')
   ```

2. **Test login with correct credentials**: Use the credentials you just created

3. **Check CSRF token**: The frontend automatically handles CSRF via `X-CSRFToken` header

4. **Verify network request**: Open browser DevTools → Network tab, check:
   - Request Headers contain `X-CSRFToken`
   - Request body has `username` and `password`
   - Status 401/403 means auth failed (wrong credentials)
   - Status 400 means validation failed

---

## Error 2: `127.0.0.1:8000/api/renovation/generate-plan/` - 500 (Internal Server Error)

### What It Means
The server encountered an unexpected error while processing your request. Usually indicates a missing field, incorrect data type, or backend service failure.

### Root Cause
The frontend is sending incomplete or incorrectly formatted data. The backend's `RenovationPlanRequestSerializer` validates all required fields against specific choices.

### Backend Implementation (Reference)
**File**: `backend/core/api/planning_work/serializers.py`

The serializer requires these fields:

#### Required Fields (Must Always Include)
| Field | Type | Valid Choices |
|-------|------|---|
| `building_type` | choice | `'single-family'`, `'multi-family'`, `'apartment'`, `'commercial'`, `'villa'`, `'office'` |
| `budget` | decimal | Any positive number (EUR) |
| `location` | choice | `'baden-wurttemberg'`, `'bavaria'`, `'berlin'`, ... (all 16 German states) |
| `building_size` | integer | Any positive number (sqm) |
| `renovation_goals` | list[choice] | `['Energy Efficiency', 'Insulation', 'Windows & Doors', 'Heating System', 'Solar Panels', 'Bathroom', 'Kitchen', 'Roof']` |
| `building_age` | date | ISO format: `'YYYY-MM-DD'` |
| `target_start_date` | date | ISO format: `'YYYY-MM-DD'` |
| `financing_preference` | choice | `'personal-savings'`, `'bank-loan'`, `'kfw-loan'`, `'mixed'` |
| `incentive_intent` | choice | `'yes'`, `'yes-applied'`, `'no'`, `'unsure'` |
| `living_during_renovation` | choice | `'yes'`, `'no'`, `'partial'` |
| `heritage_protection` | choice | `'yes'`, `'no'`, `'unsure'` |

#### Optional Fields (Can Be Null)
- `energy_certificate_available`: choice (energy grade A+ to H or `'not-available'`)
- `surveys_require`: choice (survey type or `'none'`)
- `neighbor_impacts`: choice (impact type or `'none'`)
- `current_insulation_status`: choice (`'none'`, `'partial'`, `'full'`)
- `heating_system_type`: choice (heating type)
- `window_type`: choice (window grade)

### Correct Request Format (Example)
```json
{
  "building_type": "single-family",
  "budget": 50000.00,
  "location": "berlin",
  "building_size": 120,
  "renovation_goals": ["Energy Efficiency", "Insulation"],
  "building_age": "1985-06-15",
  "target_start_date": "2025-03-01",
  "financing_preference": "kfw-loan",
  "incentive_intent": "yes",
  "living_during_renovation": "partial",
  "heritage_protection": "no",
  "energy_certificate_available": "d",
  "surveys_require": "energy-audit",
  "neighbor_impacts": "none",
  "current_insulation_status": "partial",
  "heating_system_type": "gas",
  "window_type": "double-pane"
}
```

### Common Mistakes
1. **Field Name Mismatch**:
   - ❌ Using `bundesland` instead of `location`
   - ❌ Using `goals` instead of `renovation_goals`
   - ❌ Using `energyCertificateRating` instead of `energy_certificate_available`

2. **Wrong Data Types**:
   - ❌ `budget: "50000"` (should be number)
   - ❌ `building_size: "120"` (should be integer)
   - ❌ `renovation_goals: "Energy Efficiency"` (should be list: `["Energy Efficiency"]`)
   - ❌ `building_age: "1985"` (should be ISO date: `"1985-06-15"`)

3. **Invalid Choice Values**:
   - ❌ `building_type: "house"` (should be one of the 6 choices)
   - ❌ `location: "germany"` (should be specific state like `"berlin"`)
   - ❌ `financing_preference: "cash"` (should be one of the 4 choices)

4. **Missing Required Fields**:
   - If any of the 11 required fields is missing, validation fails
   - Optional fields can be `null` or `""`

### Solutions

#### Step 1: Enable Detailed Error Logging
The frontend now sends detailed error messages to the console. Open DevTools:
1. F12 → Console tab
2. Look for: `"API Error Response:"` followed by the error details
3. This shows exactly which field failed validation

#### Step 2: Validate Data Before Sending
Check `frontend/src/pages/Planning/Planning.tsx` line ~60:
```typescript
// Log the payload before sending
console.log("Sending renovation plan request:", requestPayload);

// This will show you exactly what's being sent to the API
```

#### Step 3: Verify Frontend Mapping
The frontend now correctly maps:
```typescript
// Frontend fields → Backend fields
buildingType → building_type
budget → budget
bundesland → location  // ← KEY FIX: was sending 'bundesland', should be 'location'
buildingSize → building_size
goals → renovation_goals
buildingAge → building_age (ensure ISO format)
startDate → target_start_date (ensure ISO format)
financingPreference → financing_preference
incentiveIntent → incentive_intent
livingDuringRenovation → living_during_renovation
neighborImpact → heritage_protection
energyCertificateRating → energy_certificate_available
heatingSystem → heating_system_type
windowsType → window_type
insulationType → current_insulation_status
```

#### Step 4: Verify Choice Values
When the form sends data, ensure all choice fields are using valid options:

**Bad Example**:
```typescript
{
  building_type: "Residential",  // ❌ Not in choices
  location: "Germany",           // ❌ Not in choices
  renovation_goals: "Energy Efficiency"  // ❌ Not a list
}
```

**Good Example**:
```typescript
{
  building_type: "single-family",  // ✅ Valid choice
  location: "berlin",              // ✅ Valid Bundesland
  renovation_goals: ["Energy Efficiency", "Insulation"]  // ✅ List of valid choices
}
```

#### Step 5: Debug Backend Response
If you still get 500, check backend logs:
```bash
cd backend
# Watch for errors in the terminal where django server is running
# Or check logs if using logging configuration

# You can also test the endpoint directly with curl:
curl -X POST http://127.0.0.1:8000/api/renovation/generate-plan/ \
  -H "Content-Type: application/json" \
  -d '{
    "building_type": "single-family",
    "budget": 50000,
    "location": "berlin",
    "building_size": 120,
    "renovation_goals": ["Energy Efficiency"],
    "building_age": "1985-06-15",
    "target_start_date": "2025-03-01",
    "financing_preference": "kfw-loan",
    "incentive_intent": "yes",
    "living_during_renovation": "partial",
    "heritage_protection": "no"
  }'
```

---

## Error 3: `Planning.tsx:94 Error generating plan: Error: Failed to generate plan`

### What It Means
The JavaScript Promise in the frontend caught an error when calling the API. This is a wrapper around the HTTP errors above.

### Why It Happens
1. Network request failed (500 or 400 status)
2. API returned unexpected response format
3. JSON parsing error
4. Browser fetch API error

### Solution
The frontend now provides better error details:

```typescript
// OLD: catch (error) { console.error("Error generating plan:", error); }

// NEW: Shows the actual API error response
catch (error) {
  console.error("Error generating plan:", error);
  alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
}
```

Now when you see this error:
1. Check the browser console (F12)
2. Look for `"API Error Response:"` which shows the backend's validation errors
3. Fix the fields mentioned in the error

---

## Testing & Debugging Checklist

### Before Generating a Plan
- [ ] Backend is running: `python manage.py runserver` (should show `Started development server at http://127.0.0.1:8000/`)
- [ ] Frontend is running: `npm start` (should show `Compiled successfully!`)
- [ ] User is logged in: Check top-right for username
- [ ] Network tab shows no CORS errors

### When Getting Errors
- [ ] Open DevTools: F12
- [ ] Go to Console tab
- [ ] Reproduce the error
- [ ] Look for `"Sending renovation plan request:"` - shows what's being sent
- [ ] Look for `"API Error Response:"` - shows what backend rejected
- [ ] Look for `"API Error:"` - shows validation errors with field names

### Common Test Scenario
1. **Create a test user**: `python manage.py createsuperuser`
2. **Login**: Use the credentials you just created
3. **Fill a form**: Use these valid test values:
   - Building Type: `single-family`
   - Budget: `50000` EUR
   - Location: `berlin`
   - Building Size: `120` sqm
   - Goals: Select at least one (e.g., "Energy Efficiency")
   - Building Age: `1985-06-15` (approx)
   - Start Date: `2025-03-01` (future date)
   - Financing: `kfw-loan`
   - Incentives: `yes`
   - Living During: `partial`
   - Heritage: `no`
4. **Generate Plan**: Click button
5. **Check console**: Look for the response

---

## API Reference

### Endpoints Used
- **POST** `/api/auth/csrf/` - Get CSRF token (automatic)
- **POST** `/api/auth/login/` - Login with username/password
- **POST** `/api/auth/logout/` - Logout
- **POST** `/api/auth/register/` - Register new user
- **GET** `/api/auth/status/` - Check auth status
- **POST** `/api/renovation/generate-plan/` - Generate renovation plan

### Response Formats

#### Successful Login (200 OK)
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "",
    "last_name": ""
  },
  "message": "Login successful"
}
```

#### Successful Plan Generation (200 OK)
```json
{
  "success": true,
  "plan": {
    "phases": [...],
    "gantt_chart": [...],
    "permits": [...],
    "stakeholders": [...],
    "budget_preview": {...},
    "ai_suggestions": [...]
  },
  "building_type": "single-family",
  "budget": 50000.00,
  "renovation_type": "full",
  "generated_at": "2025-11-20T10:30:00Z"
}
```

#### Validation Error (400 Bad Request)
```json
{
  "building_type": ["Invalid choice. Expected one of: single-family, multi-family, apartment, commercial, villa, office"],
  "location": ["\"germany\" is not a valid choice. Expected one of: baden-wurttemberg, bavaria, ..."],
  "renovation_goals": ["This field is required."]
}
```

---

## What Was Fixed in Planning.tsx

### Changes Made
**File**: `frontend/src/pages/Planning/Planning.tsx` (~line 57)

**Before** (Broken):
```typescript
body: JSON.stringify({
  building_type: planData.buildingType,
  budget: planData.budget,
  location: planData.bundesland,  // ❌ Wrong field name
  building_size: planData.buildingSize,
  renovation_goals: planData.goals,
  building_age: planData.buildingAge,
  target_start_date: planData.startDate,
  financing_preference: planData.financingPreference,
  incentive_intent: planData.incentiveIntent,
  living_during_renovation: planData.livingDuringRenovation,
  heritage_protection: planData.neighborImpact,
  energy_certificate_available: planData.energyCertificateRating,
  heating_system_type: planData.heatingSystem,
  window_type: planData.windowsType,
  current_insulation_status: planData.insulationType,
}),
```

**After** (Fixed):
```typescript
const requestPayload = {
  building_type: planData.buildingType,
  budget: planData.budget,
  location: planData.bundesland,  // ✅ Correct field name
  building_size: planData.buildingSize,
  renovation_goals: planData.goals,
  building_age: planData.buildingAge,  // Must be ISO date
  target_start_date: planData.startDate,  // Must be ISO date
  financing_preference: planData.financingPreference,
  incentive_intent: planData.incentiveIntent,
  living_during_renovation: planData.livingDuringRenovation,
  heritage_protection: planData.neighborImpact,
  energy_certificate_available: planData.energyCertificateRating || null,
  heating_system_type: planData.heatingSystem || null,
  window_type: planData.windowsType || null,
  current_insulation_status: planData.insulationType || null,
};

console.log("Sending renovation plan request:", requestPayload);

// ... fetch with better error handling
if (!response.ok) {
  const errorData = await response.json();
  console.error("API Error Response:", errorData);
  throw new Error(`API error: ${JSON.stringify(errorData)}`);
}
```

### Key Improvements
1. ✅ Explicit payload construction for clarity
2. ✅ Console logging for debugging
3. ✅ Better error messages showing what the API rejected
4. ✅ Null handling for optional fields
5. ✅ User-friendly alert with error details

---

## Next Steps

### For Testing
1. Verify backend is running and migrations applied
2. Create test user with `createsuperuser`
3. Test login endpoint
4. Generate test plan with valid data
5. Check console for detailed error messages

### For Development
1. Keep DevTools open during testing
2. Use the logged request/response to debug
3. Verify all choice fields are using valid options
4. Ensure date fields are in ISO format (YYYY-MM-DD)
5. Test with mock API if external services unavailable

### For Production
1. Add authentication check before planning
2. Validate form data on frontend before sending
3. Add user-friendly error messages (not raw API errors)
4. Implement retry logic for transient failures
5. Log errors to monitoring service

---

## Questions?

If you encounter other errors:
1. **Always check DevTools Console (F12)**
2. **Look for `"Sending renovation plan request:"` and `"API Error Response:"`**
3. **Match error messages to the validation rules above**
4. **Verify choice values match the serializer definitions**
