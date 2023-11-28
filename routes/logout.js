const express = require("express");
const router = express.Router();
const cookieSession = require("cookie-session");

router.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

router.post("/", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

module.exports = router;
