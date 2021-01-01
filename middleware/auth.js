const { User } = require("../models/User");

let auth = (req, res, next) => {
  //인증 처리를 하는곳 (쿠키 토큰과 서버 DB에 있는 토큰 비교)
  //클라리언트 쿠키에서 토큰을 가져온다.
  let token = req.cookies.x_auth;

  //토큰을 복호화 한후 유저를 찾는다.
  User.findByToken(token, (err, user) => {
    //에러가 있으면 에러를 보내주고
    if (err) throw err;
    //유저가 없다면 클라이언트에게 토큰이 유효하지 않다고 알려준다.
    if (!user) return res.json({ isAuth: false, error: true });

    //유저가 있다면 index.js에서 req.user로 사용가능 하게끔 넣어준다
    req.token = token;
    req.user = user;
    next(); //미들웨어 이므로 다음 동작으로 이어갈 수 있게끔
  });
};

module.exports = { auth };
