# Goal Creation Fix ✅

## Problem
The "Create Goal" button wasn't working because:
1. No `onClick` handler was attached to the button
2. No form state management
3. No API call to create the goal

## Solution Applied

### 1. Added Form State Management
```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  type: 'quarterly',
  deadline: '',
  owner: 'Ayush Kumar',
  team_id: 'default-team',
});
```

### 2. Added Form Handlers
- Each input now has `value` and `onChange` handlers
- Form data is properly tracked in state

### 3. Added API Call Handler
```typescript
const handleCreateGoal = async () => {
  // Validates input
  // Calls POST /api/goals
  // Shows success/error messages
  // Refreshes page on success
};
```

### 4. Connected Button
```typescript
<Button 
  variant="primary" 
  onClick={handleCreateGoal}
  disabled={loading}
>
  {loading ? 'Creating...' : 'Create Goal'}
</Button>
```

## How to Use

1. **Go to Goals Page:**
   ```
   http://localhost:3000/dashboard/team/goals
   ```

2. **Click "Create New Goal"**

3. **Fill out the form:**
   - Goal Title (required)
   - Description (optional)
   - Type (Quarterly/Monthly/Ongoing)
   - Deadline (optional)
   - Owner (select from dropdown)

4. **Click "Create Goal"**

5. **Goal will be created and page will refresh**

## Important Note: Team ID

The form currently uses a placeholder `team_id: 'default-team'`. 

### To Fix This Properly:

You need to either:

**Option A: Create a default team in database**
```sql
INSERT INTO teams (id, name, description)
VALUES ('default-team', 'Default Team', 'Default team for goals');
```

**Option B: Get team_id from user context**
- Fetch user's team from database
- Pass team_id from parent component
- Use team context/provider

**Option C: Make team_id optional**
- Modify API to create personal goals without team_id
- Or auto-create a team for the user

## Testing

```bash
# Test goal creation
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{
    "team_id": "default-team",
    "title": "Test Goal",
    "description": "Test description",
    "type": "quarterly",
    "deadline": "2025-12-31"
  }'
```

## What's Fixed

- ✅ Form inputs are now controlled
- ✅ Button has onClick handler
- ✅ API call is made on submit
- ✅ Loading state shows during creation
- ✅ Error handling with alerts
- ✅ Success redirects/refreshes page

## What Still Needs Work

- ⚠️ Team ID is hardcoded (needs proper team management)
- ⚠️ No validation beyond required title
- ⚠️ Page refreshes instead of updating state
- ⚠️ No toast notifications (uses alerts)
- ⚠️ Owner is just a string (should be user ID)

## Quick Fix for Team ID Issue

If you're getting an error about team_id, run this SQL in Supabase:

```sql
-- Create a default team
INSERT INTO teams (id, name, description, created_at)
VALUES (
  'default-team',
  'My Team',
  'Default team for goals and OKRs',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

Or update the API to handle missing team_id:

```typescript
// In src/app/api/goals/route.ts
const team_id = body.team_id || 'default-team';
```

## Try It Now!

1. Refresh your browser
2. Go to `/dashboard/team/goals`
3. Click "Create New Goal"
4. Fill out the form
5. Click "Create Goal"
6. Goal should be created! 🎉

If you get an error about team_id, let me know and I'll help you set up the teams table properly!
