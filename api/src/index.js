require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const linksRoutes = require("./routes/links");
const redirectRoutes = require("./routes/redirect");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/links", linksRoutes);
app.use("/", redirectRoutes); // sempre por último

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});