const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//환경 변수(process.env.NODE_ENV)개발/배포 환경 분기
const config = require("./config/key");
const { auth } = require("./middleware/auth"); //인증처리
const { User } = require("./models/User");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

// const mongoose = require("mongoose");

// mongoose
//   .connect(config.mongoURI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//   })
//   .then(() => console.log("mongoDB connected.."))
//   .catch((err) => console.log("errored" + err));

//mariaDB
const mariadb = require("mariadb");
// const pool = mariadb.createPool({
//   host: "127.0.0.1", //로컬 mariaDB | 서버연결시 도메인 네임 또는 ip
//   user: "root",//로컬에서 연결할때 root | 서버에서는 서버에서의 유저네임
//   password: "rldjrdl2",
//   connectionLimit: 5,
// });
require("dotenv/config");

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
});
async function asyncFunction() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("mariaDB connected...11");
    const rows = await conn.query("show databases");
    console.log(rows);
  } catch (error) {
    console.log("error~~~~");
    throw error;
  } finally {
    if (conn) return conn.end();
  }
}
const temp = asyncFunction();
//route
app.get("/", (req, res) => res.send("hello"));

app.post("/api/users/register", (req, res) => {
  //회원가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  //요청된 이메일을 디비에서 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당되는 유저가 없습니다.",
      });
    }

    //비밀번호가 맞는 비밀번호인지 확인. comparePassword는 User.js에서 정의됌
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        //비밀번호가 같지 않다면
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      }

      //비밀번호까지 맞으면 토큰생성.generateToken는 User.js에서 정의
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        //토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 여기는 쿠키
        //쿠키에 저장하기 위해서 쿠키파서를 다운받아야 한다.
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

//auth 관련 (로그인 할 떄 쿠키에 저장한 값과 서버에서 발행한 토큰을 비교해서)
//지금 로그인 한 유저가 사이트를 사용가능한 유저인지 체크
// , auth ,는 미들웨어
app.get("/api/users/auth", auth, (req, res) => {
  //여기까지 왔다는 것은 auth 미들웨어를 통과해서 req에 토큰과 유저정보를 가지고 있다는 뜻
  // role : 0은 일반유저 0이 아니면 관리자
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

//로그아웃 -토큰 지우기
app.get("/api/users/logout", auth, (req, res) => {
  //auth 미들웨어 에서 토큰을 비교해서 맞다면 req에 유저정보를 넣어준다
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`express on ${port}`));
