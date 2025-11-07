const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());

//const __dirname = path.resolve();
const usersFile = path.join(__dirname, 'data', 'users.json');
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Helper: read and write users
function readUsers() {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// 🧾 Registration
app.post('/api/auth/register', async (req, res) => {
  const { fullname, idNumber, accountNumber, password } = req.body;
  if (!fullname || !idNumber || !accountNumber || !password)
    return res.status(400).json({ error: 'All fields required' });

  const users = readUsers();
  if (users.find(u => u.accountNumber === accountNumber))
    return res.status(400).json({ error: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { fullname, idNumber, accountNumber, password: hashedPassword };
  users.push(newUser);
  saveUsers(users);

  res.json({ success: true });
});

// 🔐 Login
app.post('/api/auth/login', async (req, res) => {
  const { accountNumber, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.accountNumber === accountNumber);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ accountNumber }, SECRET, { expiresIn: '1h' });
 const csrfToken = Math.random().toString(36).substring(2);
  res.json({ accessToken: token, csrfToken });
});

// 💸 Payment submission
app.post('/api/pay', (req, res) => {
  const { amount, currency, payeeAccount, swift } = req.body;
  if (!amount || !currency || !payeeAccount || !swift)
    return res.status(400).json({ error: 'All fields required' });

  const txId = 'TX' + Math.floor(Math.random() * 100000);
  res.json({ success: true, txId });
});

// 🧾 Employee portal (dummy data)
app.get('/api/employee/pending', (req, res) => {
  res.json({
    payments: [
      { tx_id: 'TX101', amount: 2500, currency: 'USD', payee_account_last4: '1234', swift: 'ABSAZAJJ' },
      { tx_id: 'TX102', amount: 4800, currency: 'EUR', payee_account_last4: '9876', swift: 'FIRNZAJJ' }
    ]
  });
});

// Verify / Submit actions
app.post('/api/employee/verify', (req, res) => {
  const { txId, action } = req.body;
  if (!txId || !action) return res.status(400).json({ error: 'Missing fields' });
  res.json({ success: true, action, txId });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
