import jwt from 'jsonwebtoken';

// Static credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

// Generate JWT Token
export const generateToken = (username) => {
  return jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Verify credentials and login
export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username and password',
    });
  }

  if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const token = generateToken(username);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    expiresIn: '7 days',
  });
};

// Verify token middleware
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Access denied.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Verify token route (for frontend to check if token is still valid)
export const verifyTokenRoute = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user,
  });
};

