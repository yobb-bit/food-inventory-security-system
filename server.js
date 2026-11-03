const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Sample data — now with dateReceived and dateConsumed
let inventory = [
    { id: 1, owner_id: 'demo-user', name: 'Item 1', quantity: 10, price: 29.99, dateReceived: '2026-09-01', dateConsumed: '' },
    { id: 2, owner_id: 'demo-user', name: 'Item 2', quantity: 5, price: 49.99, dateReceived: '2026-09-05', dateConsumed: '' }
];

// JWT middleware should run before these routes and set req.user.id.
// This guard deliberately fails closed until trusted authentication is wired in.
function requireAuthenticatedUser(req, res, next) {
    if (!req.user || req.user.id === undefined || req.user.id === null) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
}

function ownedItem(req) {
    return inventory.find(i => i.id === Number(req.params.id) && String(i.owner_id) === String(req.user.id));
}

const editableFields = ['name', 'quantity', 'price', 'dateReceived', 'dateConsumed'];

// GET all items
app.get('/api/inventory', requireAuthenticatedUser, (req, res) => {
    res.json(inventory.filter(i => String(i.owner_id) === String(req.user.id)));
});

// GET item by ID
app.get('/api/inventory/:id', requireAuthenticatedUser, (req, res) => {
    const item = ownedItem(req);
    item ? res.json(item) : res.status(404).json({ message: 'Item not found' });
});

// POST new item
app.post('/api/inventory', requireAuthenticatedUser, (req, res) => {
    const newItem = {
        id: inventory.reduce((max, item) => Math.max(max, item.id), 0) + 1,
        owner_id: req.user.id,
        name: req.body.name,
        quantity: req.body.quantity,
        price: req.body.price,
        dateReceived: req.body.dateReceived || '',
        dateConsumed: req.body.dateConsumed || ''
    };
    inventory.push(newItem);
    res.status(201).json(newItem);
});

// PUT update item
app.put('/api/inventory/:id', requireAuthenticatedUser, (req, res) => {
    const item = ownedItem(req);
    if (item) {
        // Only inventory fields are writable; owner_id and id are never accepted.
        for (const field of editableFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) item[field] = req.body[field];
        }
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// DELETE item
app.delete('/api/inventory/:id', requireAuthenticatedUser, (req, res) => {
    const item = ownedItem(req);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    inventory = inventory.filter(i => i.id !== item.id);
    res.json({ message: 'Item deleted' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
