<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <title>Hull Red CIO | Admin</title>
  <link rel="stylesheet" href="../style.css" />
</head>
<body data-page="admin">
  <header class="topbar">
    <div class="topbar-inner">
      <div class="nav-brand">
        <div class="nav-logo">
          <img src="../HullRed.png" alt="Hull Red CIO Logo">
        </div>
        <div class="nav-title">Hull Red CIO Admin</div>
      </div>

      <nav class="nav-links">
        <a href="../">Back to Event</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <section class="hero">
      <div class="brand">
        <div class="logo">
          <img src="../HullRed.png" alt="Hull Red CIO Logo">
        </div>

        <div class="brand-text">
          <h1>Admin Event Editor</h1>
          <p class="subtitle">Sign in to update the public event shown on the main page.</p>
        </div>
      </div>

      <div class="admin-wrap">
        <div class="login-card" id="loginCard">
          <h2 class="login-title">Admin Login</h2>
          <p class="login-copy">Enter your credentials to edit the current event.</p>

          <div class="field">
            <label for="adminUsername">Username</label>
            <input type="text" id="adminUsername" autocomplete="username" placeholder="Enter username">
          </div>

          <div class="field">
            <label for="adminPassword">Password</label>
            <input type="password" id="adminPassword" autocomplete="current-password" placeholder="Enter password">
          </div>

          <div class="login-actions">
            <button class="btn-primary" id="loginBtn" type="button">Login</button>
            <a class="btn-secondary" href="../">Cancel</a>
          </div>

          <div class="status" id="loginStatus"></div>
          <div class="small-note">Default login: <strong>admin</strong> / <strong>HullRed2026!</strong></div>
        </div>

        <section class="admin-panel hidden" id="adminPanel">
          <div class="admin-head">
            <div>
              <h3 class="admin-title">Edit Live Event</h3>
              <p class="admin-note">Changes are saved locally in this browser and reflected on the public page.</p>
            </div>
            <button class="btn-danger" id="logoutBtn" type="button">Logout</button>
          </div>

          <div class="form-grid">
            <div class="field full">
              <label for="eventTitle">Event title</label>
              <input type="text" id="eventTitle" placeholder="Event title">
            </div>

            <div class="field">
              <label for="eventStartDate">Start date</label>
              <input type="date" id="eventStartDate">
            </div>

            <div class="field">
              <label for="eventEndDate">End date</label>
              <input type="date" id="eventEndDate">
            </div>

            <div class="field">
              <label for="eventStartTime">Start time</label>
              <input type="time" id="eventStartTime">
            </div>

            <div class="field">
              <label for="eventEndTime">End time</label>
              <input type="time" id="eventEndTime">
            </div>

            <div class="field full">
              <label for="eventLocation">Location</label>
              <input type="text" id="eventLocation" placeholder="Event location">
            </div>

            <div class="field full">
              <label for="eventDescription">Description</label>
              <textarea id="eventDescription" placeholder="Event description"></textarea>
            </div>
          </div>

          <div class="admin-actions">
            <button class="btn-primary" id="saveBtn" type="button">Save Event</button>
            <button class="btn-secondary" id="resetBtn" type="button">Reset to Default</button>
          </div>

          <div class="status" id="adminStatus"></div>
        </section>
      </div>
    </section>

    <div class="footer">
      © 2026 Hull Red CIO • Admin Panel • Static Version
    </div>
  </main>

  <script src="admin.js"></script>
</body>
</html>
