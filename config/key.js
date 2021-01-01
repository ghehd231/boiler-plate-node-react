if (process.env.NODE_ENV === "production") {
  //실제
  module.exports = require("./prod");
} else {
  //개발 환경일 때
  module.exports = require("./dev");
}
