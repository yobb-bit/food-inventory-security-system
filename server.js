const express = require('express');
const cors = require('cors');
const path = require('path');
const { login, authenticate, listUsers } = require('./JWT');
const { ROLES, authorizeRoles } = require('./middleware/rbac');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Serve only the UI files needed for local testing.
const uiFiles = {
    '/': 'login.html',
    '/login.html': 'login.html',
    '/index.html': 'index.html',
    '/login.css': 'login.css',
    '/style.css': 'style.css',
    '/apiCLient.js': 'apiCLient.js'
};
for (const [route, filename] of Object.entries(uiFiles)) {
    app.get(route, (req, res) => res.sendFile(path.join(__dirname, filename)));
}

app.post('/api/login', login);
app.get('/api/me', authenticate, (req, res) => {
    res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
});

let inventory = [
    { id: 1, owner_id: 1, supplier: 'Fish Supplier', supplierCost: 18.50, name: 'Item 1', quantity: 10, price: 29.99, dateReceived: '2026-09-01', dateConsumed: '' },
    { id: 2, owner_id: 2, supplier: 'Dairy Supplier', supplierCost: 32.25, name: 'Item 2', quantity: 5, price: 49.99, dateReceived: '2026-09-05', dateConsumed: '' }
];

// Demo grants: Axel can view both suppliers; John can view Fish Supplier only.
let supplierAccessGrants = [
    { id: 1, userId: 3, supplierKey: 'fish supplier', supplierName: 'Fish Supplier' },
    { id: 2, userId: 3, supplierKey: 'dairy supplier', supplierName: 'Dairy Supplier' },
    { id: 3, userId: 4, supplierKey: 'fish supplier', supplierName: 'Fish Supplier' }
];
let nextSupplierGrantId = 4;

const editableFields = ['name', 'supplier', 'quantity', 'price', 'dateReceived', 'dateConsumed'];
const requireAdmin = authorizeRoles(ROLES.ADMIN);
const inventoryReader = authorizeRoles(ROLES.ADMIN, ROLES.STAFF, ROLES.FINANCE);
const supplierReader = authorizeRoles(ROLES.ADMIN, ROLES.FINANCE);

function normalizeSupplierName(name) {
    return String(name || '').trim().toLocaleLowerCase();
}

function getSupplierNames() {
    const uniqueSuppliers = new Map();
    inventory.filter(item => item.supplier).forEach(item => {
        const key = normalizeSupplierName(item.supplier);
        if (!uniqueSuppliers.has(key)) uniqueSuppliers.set(key, item.supplier);
    });
    return [...uniqueSuppliers.values()];
}

function hasSupplierAccess(user, supplierName) {
    if (user.role === ROLES.ADMIN) return true;
    return user.role === ROLES.FINANCE && supplierAccessGrants.some(grant =>
        grant.userId === Number(user.id) && grant.supplierKey === normalizeSupplierName(supplierName)
    );
}

function inventoryItemForUser(item, user) {
    const supplierVisible = hasSupplierAccess(user, item.supplier);
    return {
        ...item,
        supplierVisible,
        supplier: supplierVisible ? item.supplier : null,
        supplierCost: supplierVisible ? item.supplierCost : null
    };
}

function findItem(req) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id)) return undefined;
    return inventory.find(item => item.id === id);
}

function parseSupplierCost(value) {
    if (value === undefined || value === null || value === '') return null;
    const cost = Number(value);
    return Number.isFinite(cost) && cost >= 0 ? cost : NaN;
}

// All authenticated roles can see inventory levels; supplier fields are filtered per user.
app.use('/api/inventory', authenticate);
app.get('/api/inventory', inventoryReader, (req, res) => {
    res.json(inventory.map(item => inventoryItemForUser(item, req.user)));
});

app.get('/api/inventory/:id', inventoryReader, (req, res) => {
    const item = findItem(req);
    return item
        ? res.json(inventoryItemForUser(item, req.user))
        : res.status(404).json({ message: 'Item not found' });
});

app.post('/api/inventory', requireAdmin, (req, res) => {
    const body = req.body || {};
    const supplierCost = parseSupplierCost(body.supplierCost);
    if (Number.isNaN(supplierCost)) {
        return res.status(400).json({ message: 'Supplier cost must be a non-negative number' });
    }

    const newItem = {
        id: inventory.reduce((max, item) => Math.max(max, item.id), 0) + 1,
        owner_id: req.user.id,
        supplier: typeof body.supplier === 'string' ? body.supplier.trim() : '',
        supplierCost,
        name: body.name,
        quantity: body.quantity,
        price: body.price,
        dateReceived: body.dateReceived || '',
        dateConsumed: body.dateConsumed || ''
    };
    inventory.push(newItem);
    return res.status(201).json(newItem);
});

app.put('/api/inventory/:id', requireAdmin, (req, res) => {
    const item = findItem(req);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const body = req.body || {};
    const supplierCost = Object.prototype.hasOwnProperty.call(body, 'supplierCost')
        ? parseSupplierCost(body.supplierCost)
        : item.supplierCost;
    if (Number.isNaN(supplierCost)) {
        return res.status(400).json({ message: 'Supplier cost must be a non-negative number' });
    }

    for (const field of editableFields) {
        if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
        if (field === 'supplier') {
            if (typeof body.supplier === 'string') item.supplier = body.supplier.trim();
        } else {
            item[field] = body[field];
        }
    }
    if (Object.prototype.hasOwnProperty.call(body, 'supplierCost')) item.supplierCost = supplierCost;
    return res.json(item);
});

app.delete('/api/inventory/:id', requireAdmin, (req, res) => {
    const item = findItem(req);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    inventory = inventory.filter(candidate => candidate.id !== item.id);
    return res.json({ message: 'Item deleted' });
});

app.get('/api/suppliers', authenticate, supplierReader, (req, res) => {
    const suppliers = getSupplierNames()
        .filter(name => hasSupplierAccess(req.user, name))
        .map(name => ({
            name,
            items: inventory
                .filter(item => normalizeSupplierName(item.supplier) === normalizeSupplierName(name))
                .map(item => ({ id: item.id, name: item.name, quantity: item.quantity, supplierCost: item.supplierCost }))
        }));
    return res.json(suppliers);
});

app.get('/api/suppliers/:supplierName', authenticate, supplierReader, (req, res) => {
    const supplierName = getSupplierNames().find(name =>
        normalizeSupplierName(name) === normalizeSupplierName(req.params.supplierName)
    );
    if (!supplierName || !hasSupplierAccess(req.user, supplierName)) {
        return res.status(404).json({ message: 'Supplier not found' });
    }

    const items = inventory
        .filter(item => normalizeSupplierName(item.supplier) === normalizeSupplierName(supplierName))
        .map(item => ({ id: item.id, name: item.name, quantity: item.quantity, supplierCost: item.supplierCost }));
    return res.json({ name: supplierName, items });
});

app.get('/api/admin/supplier-access', authenticate, requireAdmin, (req, res) => {
    const financeUsers = listUsers().filter(user => user.role === ROLES.FINANCE);
    const grants = supplierAccessGrants.map(grant => ({
        id: grant.id,
        supplier: grant.supplierName,
        userId: grant.userId,
        username: financeUsers.find(user => user.id === grant.userId)?.username || 'Unknown user'
    }));
    return res.json({ suppliers: getSupplierNames(), users: financeUsers, grants });
});

app.post('/api/admin/supplier-access', authenticate, requireAdmin, (req, res) => {
    const body = req.body || {};
    const userId = Number(body.userId);
    const user = listUsers().find(candidate => candidate.id === userId && candidate.role === ROLES.FINANCE);
    const supplierName = getSupplierNames().find(name =>
        normalizeSupplierName(name) === normalizeSupplierName(body.supplier)
    );
    if (!user || !supplierName) {
        return res.status(400).json({ message: 'Choose a valid finance user and supplier' });
    }

    const supplierKey = normalizeSupplierName(supplierName);
    const existing = supplierAccessGrants.find(grant => grant.userId === userId && grant.supplierKey === supplierKey);
    if (existing) return res.json({ message: 'Access already granted', id: existing.id });

    const grant = { id: nextSupplierGrantId++, userId, supplierKey, supplierName };
    supplierAccessGrants.push(grant);
    return res.status(201).json({ message: 'Supplier access granted', id: grant.id });
});

app.delete('/api/admin/supplier-access/:id', authenticate, requireAdmin, (req, res) => {
    const grantId = Number(req.params.id);
    const grant = supplierAccessGrants.find(item => item.id === grantId);
    if (!grant) return res.status(404).json({ message: 'Supplier access grant not found' });
    supplierAccessGrants = supplierAccessGrants.filter(item => item.id !== grantId);
    return res.json({ message: 'Supplier access revoked' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
