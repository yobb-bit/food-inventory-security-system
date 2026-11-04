const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Set JWT_SECRET in the environment outside local development.
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Demo accounts for the local class project.
const users = [
    { id: 1, username: 'Owen', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
    { id: 2, username: 'Lester', password: bcrypt.hashSync('staff123', 10), role: 'staff' }
];

function login(req, res) {
    const { username, password } = req.body || {};
    const user = users.find(candidate => candidate.username === username);

    if (!user || typeof password !== 'string' || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    return res.json({ token });
}

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        req.user = jwt.verify(authHeader.slice('Bearer '.length), JWT_SECRET);
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = { login, authenticate };
