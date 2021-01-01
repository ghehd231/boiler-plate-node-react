const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//환경 변수(process.env.NODE_ENV)개발/배포 환경 분기
const config = require("./config/key");

const { User } = require("./models/User");
//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("mongoDB connected.."))
  .catch((err) => console.log("errored" + err));

app.get("/", (req, res) => res.send("hello"));

//route

app.post("/register", (req, res) => {
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

app.post("/login", (req, res) => {
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
app.listen(port, () => console.log(`express on ${port}`));
