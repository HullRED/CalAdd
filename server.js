const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/admin", express.static("admin"));
app.use("/data", express.static("data"));

app.post("/save-event", (req, res) => {
  const event = req.body;
  fs.writeFile(path.join(__dirname, "data", "event.json"), JSON.stringify(event, null, 2), err => {
    if(err) return res.json({ success:false });
    return res.json({ success:true });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
