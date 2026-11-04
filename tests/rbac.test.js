
const { test } = require('node:test');
const assert = require('node:assert');
const { ROLES, authorizeRoles } = require('../middleware/rbac');

// Helper function to simulate an API request
function checkAccess(user, ...allowedRoles) {
    const req = { user };
    const res = {
        statusCode: 200,
        response: null,

        status(code) {
            this.statusCode = code;
            return this;
        },

        json(data) {
            this.response = data;
            return this;
        }
    };

    let nextCalled = false;

    const next = () => {
        nextCalled = true;
    };

    authorizeRoles(...allowedRoles)(req, res, next);

    return {
        statusCode: res.statusCode,
        response: res.response,
        nextCalled
    };
}

// TEST 1: Admin can access Admin-only features
test('Admin should be authorized', () => {
    const result = checkAccess(
        { id: 1, role: ROLES.ADMIN },
        ROLES.ADMIN
    );

    assert.strictEqual(result.nextCalled, true);
    assert.strictEqual(result.statusCode, 200);
});

// TEST 2: Staff can access shared features
test('Staff should access permitted features', () => {
    const result = checkAccess(
        { id: 2, role: ROLES.STAFF },
        ROLES.ADMIN,
        ROLES.STAFF
    );

    assert.strictEqual(result.nextCalled, true);
});

// TEST 3: Staff cannot access Admin-only features
test('Staff should be denied Admin-only features', () => {
    const result = checkAccess(
        { id: 2, role: ROLES.STAFF },
        ROLES.ADMIN
    );

    assert.strictEqual(result.statusCode, 403);
    assert.strictEqual(result.nextCalled, false);
});

// TEST 4: Unauthenticated users should be rejected
test('Unauthenticated users should receive 401', () => {
    const result = checkAccess(
        null,
        ROLES.ADMIN
    );

    assert.strictEqual(result.statusCode, 401);
    assert.strictEqual(result.nextCalled, false);
});

// TEST 5: Invalid roles should be rejected
test('Invalid roles should receive 403', () => {
    const result = checkAccess(
        { id: 3, role: 'guest' },
        ROLES.ADMIN,
        ROLES.STAFF
    );

    assert.strictEqual(result.statusCode, 403);
    assert.strictEqual(result.nextCalled, false);
});
