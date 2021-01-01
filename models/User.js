const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10; //몇글자로 암호화 할지 정의
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
  }
});
const User = mongoose.model("User", userSchema);

module.exports = { User };
