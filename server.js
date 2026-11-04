const express = require('express');
const cors = require('cors');
const { login, authenticate } = require('./JWT');
const { ROLES, authorizeRoles } = require('./middleware/rbac');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Login is public; the token identifies the user and their role.
app.post('/api/login', login);
app.get('/api/me', authenticate, (req, res) => {
    res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
});

// Every inventory request requires a verified JWT before role checks run.
app.use('/api/inventory', authenticate);

let inventory = [
    { id: 1, owner_id: 1, name: 'Item 1', quantity: 10, price: 29.99, dateReceived: '2026-09-01', dateConsumed: '' },
    { id: 2, owner_id: 2, name: 'Item 2', quantity: 5, price: 49.99, dateReceived: '2026-09-05', dateConsumed: '' }
];

const editableFields = ['name', 'quantity', 'price', 'dateReceived', 'dateConsumed'];
const requireAdmin = authorizeRoles(ROLES.ADMIN);

function findItem(req) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id)) return undefined;
    return inventory.find(item => item.id === id);
}

// Staff and admins can view all inventory so staff can monitor stock levels.
app.get('/api/inventory', authorizeRoles(ROLES.ADMIN, ROLES.STAFF), (req, res) => {
    res.json(inventory);
});

app.get('/api/inventory/:id', authorizeRoles(ROLES.ADMIN, ROLES.STAFF), (req, res) => {
    const item = findItem(req);
    return item
        ? res.json(item)
        : res.status(404).json({ message: 'Item not found' });
});

// Only admins can create records; ownership always comes from the verified token.
app.post('/api/inventory', requireAdmin, (req, res) => {
    const body = req.body || {};
    const newItem = {
        id: inventory.reduce((max, item) => Math.max(max, item.id), 0) + 1,
        owner_id: req.user.id,
        name: body.name,
        quantity: body.quantity,
        price: body.price,
        dateReceived: body.dateReceived || '',
        dateConsumed: body.dateConsumed || ''
    };

    inventory.push(newItem);
    return res.status(201).json(newItem);
});

// Only admins can edit; id and owner_id are deliberately not writable fields.
app.put('/api/inventory/:id', requireAdmin, (req, res) => {
    const item = findItem(req);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const body = req.body || {};
    for (const field of editableFields) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            item[field] = body[field];
        }
    }
    return res.json(item);
});

app.delete('/api/inventory/:id', requireAdmin, (req, res) => {
    const item = findItem(req);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    inventory = inventory.filter(candidate => candidate.id !== item.id);
    return res.json({ message: 'Item deleted' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
