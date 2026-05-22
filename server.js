const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;
const RSVP_FILE = path.join(__dirname, 'rsvp_data.json');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
if (!fs.existsSync(RSVP_FILE)) {
  fs.writeFileSync(RSVP_FILE, JSON.stringify([], null, 2));
}

app.post('/api/rsvp', (req, res) => {
  const { name, email, guests, message, attendance } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }
  if (!attendance) {
    return res.status(400).json({ success: false, message: 'Please confirm your attendance.' });
  }

  const guestCount = parseInt(guests) || 1;
  if (guestCount < 1 || guestCount > 10) {
    return res.status(400).json({ success: false, message: 'Guest count must be between 1 and 10.' });
  }

  const entry = {
    id: Date.now(),
    name: name.trim(),
    email: email ? email.trim() : '',
    guests: guestCount,
    message: message ? message.trim() : '',
    attendance,
    timestamp: new Date().toISOString()
  };

  try {
    const data = JSON.parse(fs.readFileSync(RSVP_FILE, 'utf8'));
    data.push(entry);
    fs.writeFileSync(RSVP_FILE, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: `Thank you, ${entry.name}! Your response has been received with joy. 🌸`,
      entry
    });
  } catch (err) {
    console.error('Error saving RSVP:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

app.get('/api/rsvp', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(RSVP_FILE, 'utf8'));
    res.json({ success: true, total: data.length, entries: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not read RSVP data.' });
  }
});

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✨ Wedding Server running at http://localhost:${PORT}\n`);
});