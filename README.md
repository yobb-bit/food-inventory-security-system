# FOR GROUP 5

Guys, I've already created the three security branches in our GitHub repository. I've also assigned separate branches for our UI/UX and QA members, so you don't need to create your own branches.


VERY IMPORTANT GIT RULES:

Work only on your assigned branch (e.g LESTER - RBACH branch only) **his git command should look like = ```bash git checkout feature/rbac ```

Do not directly modify main.
AND MAKE SURE TO PUSH EVERY CHANGES!

**GitHub Repository:**  
https://github.com/yobb-bit/food-inventory-security-system

## Run the UI locally

From the project directory, install dependencies and start the server:

```bash
npm install
JWT_SECRET=local-dev-secret npm start
```

Open `http://localhost:3000/` and sign in with one of the demo accounts:

| Username | Password |
| --- | --- |
| Owen | `admin123` |
| Lester | `staff123` |
| Axel | `finance123` |
| John | `finance1234` |

The login page stores the JWT for the current browser tab and sends it with inventory requests.

### Inventory permissions

- **Admin:** can manage inventory and grant finance users access to individual suppliers.
- **Staff:** can view inventory and low-stock totals, but cannot view supplier names/costs or change records.
- **Finance:** can view supplier names/costs only for suppliers an admin has shared with that account.

The API enforces these permissions even if a caller bypasses the dashboard controls. Supplier grants are in-memory for this local demo and reset when the server restarts.

### Demonstrate the supplier object access check

The demo starts with Axel granted access to both Fish Supplier and Dairy Supplier. John is granted access to Fish Supplier only. Sign in as John and request `GET /api/suppliers/Dairy%20Supplier` with John's bearer token. The API returns `404 Supplier not found` because John is not authorized for that supplier. Sign in as Axel and request the same URL; it returns the supplier details. This shows the server checking authorization for the specific supplier object, even when a user changes the requested supplier in the URL.

## 1. Clone the repository

```bash
git clone https://github.com/yobb-bit/food-inventory-security-system.git
cd food-inventory-security-system
```

## 2. Switch to your assigned branch

**LESTER — RBAC:**
```bash
git checkout feature/rbac
```

**YVAN — JWT:**
```bash
git checkout feature/jwt
```

**WENO FORGER — UI/UX:**
```bash
git checkout feature/ui-ux
```

**FAITH — QA & Documentation:**
```bash
git checkout feature/qa-testing
```

** KENT — BOLA (Me):**
```bash
git checkout feature/bola
```

## 3. Verify your branch

```bash
git branch
```

Make sure your assigned branch has an asterisk (*) beside it.

## 4. Group assignments and responsibilities

### Member 1 — BOLA (Broken Object Level Authorization)
**Branch:** `feature/bola`

- Implement object-level authorization for inventory records.
- Prevent users from accessing, modifying, or deleting another user's inventory records.
- Check ownership when accessing inventory through record IDs.
- Prevent users from manipulating `owner_id` through request bodies.
- Coordinate with the JWT member to use authenticated user information.

### LESTER— RBAC (Role-Based Access Control)
**Branch:** `feature/rbac`

- Implement role-based permissions.
- Define user roles, such as Admin and Staff, based on the group's agreed requirements.
- Restrict API endpoints according to user roles.
- Ensure unauthorized roles cannot perform restricted actions.
- Coordinate with the JWT member for authenticated user roles.

### YVAN — JWT (JSON Web Token)
**Branch:** `feature/jwt`

- Implement user authentication using JWT.
- Create login functionality and token generation.
- Verify JWT tokens through authentication middleware.
- Protect API endpoints that require authentication.
- Make authenticated user information available to other security mechanisms.

### OWEN — UI/UX Design and Frontend Upgrade
**Branch:** `feature/ui-ux`

### IMPORTANT NOTE FOR MEMBER 4 — UI/UX + API INTEGRATION

Your responsibility is not only to improve the UI/UX but also to connect the frontend to our existing backend API endpoints.

We need a fully functional frontend, not just a visual redesign.

**1. Understand the existing project first**
- Inspect the existing frontend and backend structure.
- Understand how the current frontend communicates with the backend.
- Identify existing API endpoints and how they are used.
- Preserve existing functionality. Do not rebuild the application from scratch.

**2. API Integration**
- Connect frontend forms, buttons, tables, and other components to the actual backend API endpoints.
- Implement API requests for login, logout, inventory retrieval, inventory creation, updating, and deletion, according to the endpoints available in the backend.
- Use a centralized API service file (such as `api.js`) if the existing project architecture supports it.
- Handle loading states, successful responses, validation errors, and API errors.
- Do not use hardcoded or fake inventory data as a replacement for real API responses.

**3. JWT Integration**
- Coordinate with the JWT member.
- Connect the login form to the actual authentication endpoint.
- Handle the JWT token according to the agreed authentication design.
- Include the required authentication credentials or token in protected API requests.
- Handle expired or invalid tokens appropriately.
- Do not create a separate authentication system.

**4. RBAC and BOLA Compatibility**
- Coordinate with the RBAC member to understand the available roles and permissions.
- Display or hide UI actions depending on the authenticated user's permissions.
- Make sure unauthorized actions are handled properly by the frontend.
- Do not implement your own backend authorization logic.
- Never assume that hiding a button is sufficient security. The backend must enforce permissions and object ownership.

**5. VERY IMPORTANT — DO NOT BREAK EXISTING CODE**
- Do not unnecessarily modify backend controllers, routes, middleware, or database structures.
- Do not rename or change API endpoints, HTTP methods, request body formats, or response structures without coordinating with the responsible security member.
- Do not remove existing functionality just to make the new UI easier to implement.
- Do not overwrite another member's security implementation.
- If an API endpoint is missing or not yet finished, coordinate with the responsible member instead of inventing a replacement.
- Keep your work on `feature/ui-ux` only.



**7. Documentation**
Provide:
- List of frontend files modified.
- List of API endpoints connected.
- Explanation of how the frontend handles JWT authentication.
- Explanation of how the UI responds to RBAC permissions.
- Any API integration issues that need to be resolved.

**FINAL GOAL:** The upgraded frontend must work with our actual backend, database, JWT authentication, RBAC permissions, and BOLA protection. Do not sacrifice existing functionality for visual improvements.

If you need to change a shared backend file, discuss it with the responsible member first.

### FAITH — QA, Security Testing, and Documentation
**Branch:** `feature/qa-testing`

- Inspect the existing application and understand its current functionality.
- Prepare Postman test collections for the API.
- Create test cases for BOLA, RBAC, and JWT.
- Test unauthorized access and invalid or expired JWT tokens.
- Verify that users cannot access or modify another user's inventory.
- Test role-based permissions and restricted endpoints.
- Perform regression testing to ensure existing inventory features still work.
- Record test results, screenshots, and discovered bugs.
- Prepare project documentation.

   Testing Requirements**
Before considering your work finished:
- Test login and logout.
- Test loading inventory from the actual database through the API.
- Test creating, updating, and deleting inventory records.
- Test the frontend with different user roles.
- Test unauthorized API responses and expired JWT tokens.
- Verify that existing application features still work.

Suggested documentation files:

```text
docs/
├── TESTING_PLAN.md
├── TEST_CASES.md
├── TEST_RESULTS.md
└── API_DOCUMENTATION.md
```

## 5. Development rules

- Work ONLY on your assigned branch.
- Do not directly modify `main`.
- Do not delete or rewrite existing project features unnecessarily.
- Inspect the existing project before coding.
- Do not implement another member's assigned responsibility.
- Coordinate before changing shared database structures, authentication middleware, or API contracts.
- Commit and push your changes regularly.
- Do not commit `.env` files, passwords, API keys, or other secrets.
- Keep the project running locally. No deployment or hosting is required.

## 6. Commit and push your work

After making and testing your changes:

```bash
git add .
git commit -m "Describe your changes"
git push
```

When your work is ready, create a Pull Request on GitHub targeting `main`. Have the group review the changes before merging.

## 7. Important integration notes

All five members are working on the same existing Food Inventory Management System.

- JWT provides the authenticated user's identity.
- RBAC checks whether the authenticated user has permission to perform an action.
- BOLA checks whether the authenticated user is allowed to access a specific inventory record.
- UI/UX improves the frontend experience and connects it to the agreed API.
- QA tests the security mechanisms and verifies that existing features continue working.

**Remember: LOCAL DEVELOPMENT ONLY. No deployment or hosting is required.**
