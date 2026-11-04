
const ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    FINANCE: 'finance'
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        // Check if the user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Get the user's assigned role
        const userRole = String(req.user.role || '').toLowerCase();

        // Check user permissions
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        // Allow the request to continue
        next();
    };
};

module.exports = {
    ROLES,
    authorizeRoles
};
