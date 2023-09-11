const express = require("express");
const cors = require("cors");
const user = require("./routes/user");
const app = express();

app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000"
};
app.use(cors(corsOptions));  // enable CORS

app.get("/", (req, res) => {
  res.json({ message: "Welcome to MigraCode Auth application." });
});

app.use("/user", user);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
