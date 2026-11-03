-----FOR GROUP 5 ------


Guys, I've already created all three branches in our GitHub repository, so you don't need to create your own branches anymore.

**GitHub Repository:**
https://github.com/yobb-bit/food-inventory-security-system

### 1. Clone the repository

```bash
git clone https://github.com/yobb-bit/food-inventory-security-system.git
cd food-inventory-security-system
```

### 2. Switch to your assigned branch

**RBAC member:**

```bash
git checkout feature/rbac
```

**JWT member:**

```bash
git checkout feature/jwt
```

### 3. Verify your branch

```bash
git branch
```

Make sure your assigned branch has an asterisk (*) beside it.

### 4. Development rules

- Work ONLY on your assigned branch.
- Do not modify `main`.
- Do not delete or rewrite existing project features unnecessarily.
- Inspect the existing project before coding.
- Do not implement another member's assigned security mechanism.
- Coordinate before changing shared database structures or middleware.
- Commit and push your changes regularly.

### 5. Push your work

```bash
git add .
git commit -m "Implement your assigned security"
git push
```

When finished, create a Pull Request on GitHub for review and integration.

**Assignments:**
- Me: BOLA — `feature/bola`
- Classmate 2: RBAC — `feature/rbac`
- Classmate 3: JWT — `feature/jwt`

We're all working on the same existing Food Inventory Management System. The branches are just to separate our work.

Remember: LOCAL DEVELOPMENT ONLY. No deployment required.
