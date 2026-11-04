const express = require('express');
const cors = require('cors');
const path = require('path');
const { login, authenticate } = require('./JWT');

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

// Login is public; inventory routes require a valid bearer token.
app.post('/api/login', login);
app.use('/api/inventory', authenticate);

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    return next();
}

app.get('/api/me', authenticate, (req, res) => {
    res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
});

// Sample data — now with dateReceived and dateConsumed
let inventory = [
    { id: 1, owner_id: 1, supplier: 'Green Valley Farms', supplierCost: 18.50, name: 'Item 1', quantity: 10, price: 29.99, dateReceived: '2026-09-01', dateConsumed: '' },
    { id: 2, owner_id: 2, supplier: 'Fresh Fields Co.', supplierCost: 32.25, name: 'Item 2', quantity: 5, price: 49.99, dateReceived: '2026-09-05', dateConsumed: '' }
];

const editableFields = ['name', 'supplier', 'quantity', 'price', 'dateReceived', 'dateConsumed'];

function parseSupplierCost(value) {
    if (value === undefined || value === null || value === '') return null;
    const cost = Number(value);
    return Number.isFinite(cost) && cost >= 0 ? cost : NaN;
}

function findItem(req) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id)) return undefined;
    return inventory.find(item => item.id === id);
}

// GET all items
app.get('/api/inventory', (req, res) => {
    res.json(inventory);
});

// GET item by ID
app.get('/api/inventory/:id', (req, res) => {
    const item = findItem(req);
    item ? res.json(item) : res.status(404).json({ message: 'Item not found' });
});

// POST new item
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
    res.status(201).json(newItem);
});

// PUT update item
app.put('/api/inventory/:id', requireAdmin, (req, res) => {
    const item = findItem(req);
    if (item) {
        const body = req.body || {};
        const supplierCost = Object.prototype.hasOwnProperty.call(body, 'supplierCost')
            ? parseSupplierCost(body.supplierCost)
            : item.supplierCost;
        if (Number.isNaN(supplierCost)) {
            return res.status(400).json({ message: 'Supplier cost must be a non-negative number' });
        }
        for (const field of editableFields) {
            if (Object.prototype.hasOwnProperty.call(body, field)) {
                if (field === 'supplier') {
                    if (typeof body.supplier === 'string') item.supplier = body.supplier.trim();
                } else {
                    item[field] = body[field];
                }
            }
        }
        if (Object.prototype.hasOwnProperty.call(body, 'supplierCost')) {
            item.supplierCost = supplierCost;
        }
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// DELETE item
app.delete('/api/inventory/:id', requireAdmin, (req, res) => {
    const item = findItem(req);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    inventory = inventory.filter(candidate => candidate.id !== item.id);
    res.json({ message: 'Item deleted' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
