# FOR GROUP 5

Guys, I've already created the three security branches in our GitHub repository. I've also assigned separate branches for our UI/UX and QA members, so you don't need to create your own branches.

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

The login page stores the JWT for the current browser tab and sends it with inventory requests.

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

- Inspect the existing frontend and understand its current design.
- Improve the overall appearance and usability of the application.
- Upgrade the dashboard, navigation, inventory tables, and forms.
- Improve the login and registration pages.
- Make the interface responsive and consistent.
- Display UI elements according to user roles where appropriate.
- Coordinate with the security members before connecting frontend features to the final API endpoints.

**Important:** You can start by inspecting the current UI, planning the design, and preparing mockups while the other members work on API security. Implement the final frontend integration once the security changes and API contracts are ready.

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
