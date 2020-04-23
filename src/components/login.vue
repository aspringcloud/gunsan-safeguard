<template>
  <div id="login" class="login">
    <div class="login-logos">
      <img src="Logo_SC.png" alt="스프링고 로고" />
      <img src="Logo_AM.png" alt="AI모빌리티 로고" />
    </div>
    <div class="text-blue login-title1">SpringGo</div>
    <div class="text-blue login-title2">안전요원 로그인</div>
    <div class="login-form">
      <form @submit.prevent="login">
        <label for="emailID">이메일 아이디</label>
        <input
          v-model="user.email"
          id="emailID"
          type="text"
          name="emailID"
          placeholder="이메일 아이디를 입력해 주세요."
        />
        <label for="pw">비밀번호</label>
        <input v-model="user.pw" type="password" id="pw" name="pw" placeholder="비밀번호를 입력해 주세요." />
        <button type="submit" class="login-btn login-btn-pos">로그인</button>
      </form>
    </div>
    <div class="login-chkandpw">
      <div class="login-chkbox">
        <input type="checkbox" name="saveID" id="saveID" v-model="saveID" />
        <label for="saveID">이메일 아이디 기억하기</label>
      </div>
      <a href="/resetpw">비밀번호 재설정</a>
    </div>
    <div class="errmsg login-errmsg">
      {{errmsg1}}
      <br />
      {{errmsg2}}
    </div>
    <div class="join">
      "새로운 cloud build를 시작합니다"<br/>
      본 서비스 가입을 위해서는
      <a href="mailto:bcchoi@aspringcloud.com">bcchoi@aspringcloud.com</a>으로
      <br />이메일주소, 이름, 소속, 사진, 전화번호를 보내주시기 바랍니다.
    </div>
    <div class="copyright">COPYRIGHT@SPRINGCLOUD INC. ALL RIHTS RESERVED.</div>
  </div>
</template>
<script>
import axios from "axios";
import router from "../router";

export default {
  name: "login",
  data: () => ({
    saveID: false,
    user: {
      email: "",
      pw: "",
      username: "",
      first_name: "",
      last_name: "",
      token: "",
      basic: ""
    },
    errmsg1: "",
    errmsg2: ""
  }),
  beforeCreate() {
    if (this.$session.exists()) {
      this.$router.push("/");
    }
  },
  created() {
    if (this.$cookie.get("saveID")) {
      this.saveID = true;
      this.user.email = this.$cookie.get("emailID");
    }
  },
  methods: {
    login() {
      if (!this.user.email) {
        this.errmsg1 = "이메일 아이디를 입력해주세요.";
        this.errmsg2 = "";
        return;
      }
      var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
      if (!this.user.email.match(regExp)) {
        this.errmsg1 = "이메일 아이디를 올바르게 입력해주세요.";
        this.errmsg2 = "";
        return;
      }
      if (!this.user.pw) {
        this.errmsg1 = "비밀번호를 입력해주세요.";
        this.errmsg2 = "";
        return;
      }
      // 아이디 저장 해제시
      if (this.$cookie.get("saveID") && !this.saveID) {
        this.$cookie.delete("saveID");
        this.$cookie.delete("emailID");
      }
      // 아이디 저장 체크시{
      else if (this.saveID) {
        this.$cookie.set("saveID", 1, 7);
        this.$cookie.set("emailID", this.user.email, 7);
      }
      axios
        .post("http://115.93.143.2:9103/api/auth/login/", {
          email: this.user.email,
          password: this.user.pw
        })
        .then(res => {
          this.user = {
            token: res.data.token,
            basic: btoa(this.user.email + ":" + this.user.pw),
            info: res.data.user
          };
          this.$session.set("user", this.user);
          router.push({ name: "Main" });
        })
        .catch(err => {
          this.errmsg1 = "일치하는 사용자가 없습니다.";
          this.errmsg2 = "이름 또는 이메일 아이디를 확인해주세요.";
          console.log(err);
        });
    }
  }
};
</script>
<style>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-logos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 104.38px;
  margin-top: 49px;
  margin-bottom: 10px;
}
.login-title1 {
  font-family: "NanumSquareRound", sans-serif;
  font-weight: 800;
  font-size: 48px;
  line-height: 54px;
}
.login-title2 {
  font-weight: 500;
  font-size: 18px;
  line-height: 13px;
  margin-top: 8px;
  margin-bottom: 40px;
}

.login-form * {
  display: block;
  line-height: 13px;
}
.login-form label {
  margin-top: 20px;
  margin-bottom: 11px;
}
.login-form input {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  width: 464px;
  height: 44px;
  padding: 9px 16px;
}
.login-form input::placeholder {
  color: #bdbdbd;
}
.login-btn {
  width: 464px;
  height: 56px;
  border: none;
  background: #db5499;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  color: white;
}
.login-btn:active {
  box-shadow: inset 2px 4px 4px rgba(0, 0, 0, 0.25);
}
.login-btn-pos {
  margin-top: 47px;
}
.login-chkandpw {
  position: absolute;
  top: 397px;
  margin-left: auto;
  width: 464px;
  color: #82c0df;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}
.login-chkbox {
  position: relative;
}
input[id="saveID"] {
  position: absolute;
  width: 10px;
  height: 10px;
  top: 5px;
  left: 5px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
}
input[id="saveID"] + label {
  display: inline-block;
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
input[id="saveID"] + label:before {
  content: " ";
  display: inline-block;
  width: 17px;
  height: 17px;
  line-height: 17px;
  margin: -2px 3px 0 0;
  text-align: middle;
  vertical-align: middle;
  background-color: #ffffff;
  border-radius: 50%;
  border: 1px solid #82c0df;
}
input[id="saveID"]:checked + label:before {
  background-color: #82c0df;
  border-color: #ffffff;
  background-image: url("../../public/checked.png");
  background-repeat: no-repeat;
  background-position: center center;
}
.errmsg {
  color: #eb5757;
}
.login-errmsg {
  position: absolute;
  top: 503px;
  width: 464px;
  margin-left: auto;
}
.join {
  position: absolute;
  top: 662px;
  width: 464px;
  line-height: 20px;
  text-align: center;
  color: #828282;
}
.copyright {
  font-family: Roboto;
  color: #bdbdbd;
  position: absolute;
  top: 718px;
  width: 464px;
  margin-left: auto;
  text-align: center;
}
@media (max-width: 979px) {
  .login-logos {
    margin-top: 71px;
  }
  .login-title2 {
    font-size: 16px;
    margin-bottom: 64px;
  }
  .login-form input {
    width: 311px;
    height: 48px;
  }
  .login-btn {
    width: 311px;
    height: 50px;
    font-weight: normal;
  }
  .login-btn-pos {
    margin-top: 51px;
  }
  .login-chkandpw {
    top: 445px;
    width: 311px;
    font-size: 13px;
    top: 455px;
  }
  .login-chkbox {
    font-weight: normal;
  }
  .login-errmsg {
    top: 551px;
    width: 311px;
    font-size: 13px;
  }
  .join {
    display: none;
  }
  .copyright {
    top: 688px;
    font-size: 10px;
    margin-bottom: 14px;
    width: 311px;
  }
}
</style>