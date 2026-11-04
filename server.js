const express = require('express');
const cors = require('cors');
const path = require('path');
const { login, authenticate } = require('./JWT');

const app = express();
const PORT = 3000;

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

// Sample data — now with dateReceived and dateConsumed
let inventory = [
    { id: 1, name: 'Item 1', quantity: 10, price: 29.99, dateReceived: '2026-09-01', dateConsumed: '' },
    { id: 2, name: 'Item 2', quantity: 5, price: 49.99, dateReceived: '2026-09-05', dateConsumed: '' }
];

// GET all items
app.get('/api/inventory', (req, res) => {
    res.json(inventory);
});

// GET item by ID
app.get('/api/inventory/:id', (req, res) => {
    const item = inventory.find(i => i.id === parseInt(req.params.id));
    item ? res.json(item) : res.status(404).json({ message: 'Item not found' });
});

// POST new item
app.post('/api/inventory', (req, res) => {
    const newItem = {
        id: inventory.length + 1,
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
app.put('/api/inventory/:id', (req, res) => {
    const item = inventory.find(i => i.id === parseInt(req.params.id));
    if (item) {
        Object.assign(item, req.body);
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// DELETE item
app.delete('/api/inventory/:id', (req, res) => {
    inventory = inventory.filter(i => i.id !== parseInt(req.params.id));
    res.json({ message: 'Item deleted' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
