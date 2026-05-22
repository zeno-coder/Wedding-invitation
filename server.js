const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const RSVP_FILE = path.join(__dirname, "rsvp_data.json");
app.use(cors());
app.use(bodyParser.json({limit: "10mb"}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
if (!fs.existsSync(RSVP_FILE)) {fs.writeFileSync(RSVP_FILE, JSON.stringify([], null, 2));}
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Wedding server is running"
  });
});

app.post("/api/rsvp", (req, res) => {

  try {

    const {
      name,
      email,
      guests,
      message,
      attendance
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance confirmation required"
      });
    }

    const guestCount = parseInt(guests) || 1;

    if (guestCount < 1 || guestCount > 10) {
      return res.status(400).json({
        success: false,
        message: "Guests must be between 1 and 10"
      });
    }

    let existingData = [];

    try {
      existingData = JSON.parse(
        fs.readFileSync(RSVP_FILE, "utf8")
      );
    } catch {
      existingData = [];
    }

    const entry = {
      id: Date.now(),
      name: name.trim(),
      email: email ? email.trim() : "",
      guests: guestCount,
      message: message ? message.trim() : "",
      attendance,
      timestamp: new Date().toISOString()
    };

    existingData.push(entry);

    fs.writeFileSync(
      RSVP_FILE,
      JSON.stringify(existingData, null, 2)
    );

    res.json({
      success: true,
      message: `Thank you ${entry.name} 🌸`,
      entry
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.get("/api/rsvp", (req, res) => {

  try {

    const data = JSON.parse(
      fs.readFileSync(RSVP_FILE, "utf8")
    );

    res.json({
      success: true,
      total: data.length,
      entries: data
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Could not read RSVP data"
    });
  }
});

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});