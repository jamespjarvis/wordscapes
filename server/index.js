require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();
const server = require("http").Server(app);

const io = require("./lib/socket")(server);

const isProduction = process.env.NODE_ENV === "production";

const accessLogStream = fs.createWriteStream(
  path.resolve(__dirname, "access.log")
);

app.use(
  isProduction ? morgan("combined", { stream: accessLogStream }) : morgan("dev")
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../app/dist")));

app.use(require("./routes"));

/// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

/// error handler
app.use((err, req, res, next) => {
  const errors = {};
  if (!isProduction) {
    console.log(err.stack);
    errors.message = err.message;
    errors.error = err;
  }
  res.status(err.status || 500);
  res.json({
    errors
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Listening on port ${server.address().port}`);
});
