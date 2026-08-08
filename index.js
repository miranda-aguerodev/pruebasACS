const express = require("express");
const db = require("./db");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("NovaTech funciona");
});

app.get("/usuarios", (req, res) => {
  db.query("SELECT id, nombre, email, rol FROM usuarios", (error, resultados) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(resultados);
  });
});



app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});