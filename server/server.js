// server/server.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Allow-list regex rules
const RE = {
  fullname: /^[A-Za-zÀ-ž' \-]{2,100}$/,
  idNumber: /^[0-9]{6,20}$/,
  accountNumber: /^[0-9]{6,20}$/,
  password: /^.{12,128}$/, // require 12+ chars in final product
  amount: /^(?:\d+|\d{1,3}(?:,\d{3})*)(?:\.\d{1,2})?$/,
  currency: /^(USD|EUR|GBP|ZAR|AUD|CAD|JPY|CHF)$/,
  swift: /^[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/
};

const app = express();

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');

const isProd = process.env.NODE_ENV === 'production';

// ----------------------------------------------------------------------
// 🛡️ Security Middleware
// ----------------------------------------------------------------------
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ✅ Add custom Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"],
      "connect-src": ["'self'", "http://localhost:4000", "http://localhost:5173"],
      "font-src": ["'self'", "data:"],
    },
  })
);

// ✅ Extra hardening headers
app.use(helmet.frameguard({ action: "deny" })); // Prevent clickjacking
app.use(helmet.noSniff()); // Prevent MIME sniffing


// Add frame and content-type protections (helmet covers many)
app.use(helmet.frameguard({ action: 'deny' })); // X-Frame-Options: DENY
app.use(helmet.noSniff()); // X-Content-Type-Options: nosniff

// Smaller body sanitation for XSS:
app.use(xss());

// cookies (needed for csurf)
app.use(cookieParser());

// Limit repeated requests to auth and pay endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try later.' }
});
app.use(['/api/auth/login','/api/auth/register','/api/pay','/api/employee/login'], authLimiter);

// CSRF protection for state-changing endpoints (POST)
// use cookie-based CSRF tokens
app.use(csurf({
  cookie: {
    httpOnly: true,
    secure: isProd,    // secure in production
    sameSite: 'strict'
  }
}));

// Custom handler for CSRF errors
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).json({ error: 'Invalid CSRF token' });
});

// Route to send CSRF token to the client
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ Middleware setup
app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:4001'],
  credentials: true
}));
app.use(bodyParser.json());

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

// ✅ File paths
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const employeesFile = path.join(dataDir, 'employees.json');
const paymentsFile = path.join(dataDir, 'payments.json');

// Ensure data folder and files exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]');
if (!fs.existsSync(employeesFile)) fs.writeFileSync(employeesFile, '[]');
if (!fs.existsSync(paymentsFile)) fs.writeFileSync(paymentsFile, '[]');

// ----------------------------------------------------------------------
// 🧍 CUSTOMER REGISTRATION & LOGIN
// ----------------------------------------------------------------------

// Register new customer
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullname, idNumber, accountNumber, password } = req.body;

    if (!RE.fullname.test(fullname)) return res.status(400).json({ error: 'Invalid fullname' });
if (!RE.idNumber.test(idNumber)) return res.status(400).json({ error: 'Invalid idNumber' });
if (!RE.accountNumber.test(accountNumber)) return res.status(400).json({ error: 'Invalid accountNumber' });
if (!RE.password.test(password)) return res.status(400).json({ error: 'Password must be 12+ characters' });


    if (!fullname || !idNumber || !accountNumber || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const users = JSON.parse(fs.readFileSync(usersFile));
    if (users.find(u => u.accountNumber === accountNumber))
      return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = { fullname, idNumber, accountNumber, password: hashedPassword, role: 'customer' };
    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.json({ success: true, message: 'Registration successful' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Customer login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { accountNumber, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find(u => u.accountNumber === accountNumber);

    if (!RE.accountNumber.test(accountNumber)) return res.status(400).json({ error: 'Invalid accountNumber' });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: accountNumber, role: 'customer' },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({ accessToken: token, user: { fullname: user.fullname, role: 'customer' } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----------------------------------------------------------------------
// 💸 CUSTOMER PAYMENT
// ----------------------------------------------------------------------
app.post('/api/pay', (req, res) => {
  try {
    const { amount, currency, payeeAccount, swift } = req.body;
    if (!amount || !currency || !payeeAccount || !swift)
      return res.status(400).json({ error: 'All fields required' });

    if (!RE.amount.test(String(amount))) return res.status(400).json({ error: 'Invalid amount' });
if (!RE.currency.test(currency)) return res.status(400).json({ error: 'Unsupported currency' });
if (!RE.accountNumber.test(payeeAccount)) return res.status(400).json({ error: 'Invalid payee account' });
if (!RE.swift.test(swift)) return res.status(400).json({ error: 'Invalid SWIFT/BIC' });


    const payments = JSON.parse(fs.readFileSync(paymentsFile));
    const tx_id = 'TX' + Math.floor(Math.random() * 100000);
    const newPayment = { tx_id, amount, currency, payee_account: payeeAccount, swift, verified: false };

    payments.push(newPayment);
    fs.writeFileSync(paymentsFile, JSON.stringify(payments, null, 2));

    res.json({ success: true, message: 'Payment submitted', tx_id });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----------------------------------------------------------------------
// 🧑‍💼 EMPLOYEE LOGIN (PRELOADED USERS)
// ----------------------------------------------------------------------
app.post('/api/employee/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = fs.readFileSync(employeesFile, 'utf8');
    const employees = data ? JSON.parse(data) : [];

    const RE_EMP = { username: /^[A-Za-z0-9_.-]{3,30}$/, password: RE.password };
if (!RE_EMP.username.test(username)) return res.status(400).json({ error: 'Invalid username' });


    const emp = employees.find(e => e.username === username);
    if (!emp) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, emp.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: emp.id, role: 'employee', username: emp.username },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      accessToken: token,
      user: { id: emp.id, username: emp.username, fullname: emp.fullname, role: emp.role }
    });
  } catch (err) {
    console.error('Employee login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----------------------------------------------------------------------
// 🧾 EMPLOYEE PORTAL (VERIFY / SUBMIT PAYMENTS)
// ----------------------------------------------------------------------

// Get pending payments
app.get('/api/employee/pending', (req, res) => {
  try {
    const payments = JSON.parse(fs.readFileSync(paymentsFile));
    res.json({ payments });
  } catch (err) {
    console.error('Fetch payments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify a payment
app.post('/api/employee/verify/:tx_id', (req, res) => {
  try {
    const txId = req.params.tx_id;
    const payments = JSON.parse(fs.readFileSync(paymentsFile));
    const updated = payments.map(p =>
      p.tx_id === txId ? { ...p, verified: true } : p
    );
    fs.writeFileSync(paymentsFile, JSON.stringify(updated, null, 2));
    res.json({ success: true, tx_id: txId });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit to SWIFT (clear verified payments)
app.post('/api/employee/submit', (req, res) => {
  try {
    fs.writeFileSync(paymentsFile, '[]');
    res.json({ success: true, message: 'All verified payments submitted to SWIFT' });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----------------------------------------------------------------------
// 🌐 START SERVER (HTTPS for Dev)
// ----------------------------------------------------------------------
if (!isProd) {
  const https = require('https');
  const certFile = path.join(__dirname, 'localhost+2.pem');
  const keyFile = path.join(__dirname, 'localhost+2-key.pem');

  if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
    const options = {
      key: fs.readFileSync(keyFile),
      cert: fs.readFileSync(certFile),
    };
    https.createServer(options, app).listen(4001, () => {
      console.log('✅ HTTPS Server running on https://localhost:4001 (dev cert)');
    });
  } else {
    console.log('⚠️ Dev certs not found, falling back to HTTP');
    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  }
} else {
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}

