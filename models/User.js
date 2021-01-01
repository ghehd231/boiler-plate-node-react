const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10; //몇글자로 암호화 할지 정의

const jwt = require("jsonwebtoken");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, //빈칸 허용
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number, // 0은 관리자 , 1은 일반
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number, //토큰 유효기간
  },
});

//userSchema에서 pre(mongoose 문법) 로 register에서 save하기 전에
//실행 됀다.
userSchema.pre("save", function (next) {
  //사용자가 입력한 비밀번호를 userSchema에서 가져온다
  var user = this;

  //비밀번호 말고 이름이나 이메일을 바꿀때는 실행 되지 않게
  if (user.isModified("password")) {
    //비밀번호 암호화
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        //비밀번호를 만드는데 성공하면
        user.password = hash;
        next();
      });
    });
  } else {
    //비밀번호 말고 다른것들 수정할 때는 바로 넘겨줌
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  // pP 12345 암호화 된 !#$%23
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  //jsonwebtoken으로 토큰 생성, _id는 mongoDB에 있음(https://cloud.mongodb.com/v2/5feeb14acb577d031e5bc9b2#metrics/replicaSet/5feeb25a8c7d7a62a1843c63/explorer/boiler-plate/users/find)
  var token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err); //에러가 있다면 에러 전달
    cb(null, user); //save가 잘 됐으면 err는 없고, user정보만 전달
  });
};
const User = mongoose.model("User", userSchema);

module.exports = { User };
