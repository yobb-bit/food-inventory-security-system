const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'change_this_secret';

// Sample users (admin and staff)
const users = [
    { id: 1, username: 'Owen', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
    { id: 2, username: 'Lester', password: bcrypt.hashSync('staff123', 10), role: 'staff' }
];

// LOGIN: gives the user a token
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    res.json({ token });
});

// Middleware: checks the token on every request
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}

app.use('/api/inventory', authenticate);
