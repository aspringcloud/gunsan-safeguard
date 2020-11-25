<template>
  <div id="auth">
    <div v-if="loginPage" id="login">
      <div class="login-logos">
        <img src="@/assets/img/logo_gs.png" alt="군산시 로고" />
        <img src="@/assets/img/Logo_SC.png" alt="스프링클라우드 로고" />
      </div>
      <div class="auth-title">
        <h1 class="title-springgo">SpringGo</h1>
        <h2 class="login-title">안전요원 로그인</h2>
      </div>
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
          <input
            v-model="user.pw"
            type="password"
            id="pw"
            name="pw"
            placeholder="비밀번호를 입력해 주세요."
          />
          <div class="login-chkandpw">
            <div class="login-chkbox">
              <input
                type="checkbox"
                name="saveID"
                id="saveID"
                v-model="saveID"
              />
              <label for="saveID">이메일 아이디 기억하기</label>
            </div>
            <a href="#reset" @click="loginPage = 0">비밀번호 재설정</a>
          </div>
          <button type="submit">로그인</button>
        </form>
      </div>
      <div class="errmsg login-errmsg">
        {{ errmsg1 }}
        <br />
        {{ errmsg2 }}
      </div>
      <div class="join">
        본 서비스 가입을 위해서는
        <a href="mailto:bcchoi@aspringcloud.com">bcchoi@aspringcloud.com</a>으로
        <br />이메일주소, 이름, 소속, 사진, 전화번호를 보내주시기 바랍니다.
      </div>
    </div>
    <div id="reset" v-else>
      <!-- <button class="btn-back" @click="loginPage = 1"></button> -->
      <a href="#login" class="btn-back" @click="loginPage = 1"></a>

      <div class="auth-title">
        <h1 class="title-springgo">SpringGo</h1>
        <h2 class="reset-title">비밀번호 재설정</h2>
      </div>
      <p class="reset-txt">
        임시비밀번호 발급을 원하시면<br />bcchoi@aspringcloud.com 으로<br />이메일
        아이디, 이름을 보내주시기 바랍니다.
      </p>
    </div>
    <div class="auth-copyright">Copyright ⓒ GUNSANCITY. All right reserved</div>
  </div>
</template>
<script>
export default {
  name: "auth",
  data: () => ({
    loginPage: 1,
    saveID: false,
    user: {
      email: "",
      pw: "",
      token: "",
      basic: "",
    },
    errmsg1: "",
    errmsg2: "",
  }),
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
      this.$http
        .post(this.$api + "auth/login/", {
          email: this.user.email,
          password: this.user.pw,
        })
        .then((res) => {
          this.user = {
            token: res.data.token,
            basic: btoa(this.user.email + ":" + this.user.pw),
            info: res.data.user,
          };
          this.$session.set("user", this.user);
          this.$headers.authorization = "Basic " + this.user.basic;

          this.$router.push({ name: "Main" });
        })
        .catch((err) => {
          this.errmsg1 = "일치하는 사용자가 없습니다.";
          this.errmsg2 = "이메일 또는 비밀번호를 확인해주세요.";
          console.log(err);
        });
    },
  },
};
</script>
<style scoped>
#auth {
  width: 100vw;
  height: 100vh;
  background: #fafafa;
  position: relative;
  display: flex;
  justify-content: center;
}
.auth-copyright {
  position: absolute;
  bottom: 16px;
  width: 100%;
  text-align: center;
  font-family: Roboto;
  font-size: 14px;
  line-height: 18px;
  color: #bdbdbd;
}
#login {
  margin-top: 53px;
  width: 464px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.login-logos img:first-child {
  margin-right: 19px;
}
.auth-title {
  color: #3bbae2;
  text-align: center;
}
.title-springgo {
  font-weight: 800;
}
#login .title-springgo {
  font-size: 48px;
}
#reset .title-springgo {
  font-size: 24px;
  margin-bottom: 14px;
}
.login-title {
  font-weight: 500;
  font-size: 18px;
}
.reset-title {
  font-weight: bold;
  font-size: 30px;
}
.title-springgo {
  font-family: "NanumSquareRound", sans-serif;
}
.login-form {
  font-size: 14px;
  margin-top: 30px;
}
#emailID,
#pw {
  width: 100%;
  height: 44px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 16px 9px;
  margin-top: 10px;
  margin-bottom: 15px;
}
label[for="emailID"],
label[for="pw"] {
  color: #4f4f4f;
  margin-top: 5px;
}
input::placeholder {
  color: #bdbdbd;
  font-size: 14px;
  font-weight: normal;
}
.login-chkandpw {
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-weight: 500;
  font-size: 14px;
  color: #82c0df;
  margin-bottom: 15px;
  align-items: center;
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
label[for="saveID"] {
  display: inline-block;
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
label[for="saveID"]:before {
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
#saveID:checked + label[for="saveID"]:before {
  background-color: #82c0df;
  border-color: #ffffff;
  background-image: url("../assets/img/checked.png");
  background-repeat: no-repeat;
  background-position: center center;
}
.login-form button {
  width: 100%;
  background: #db5499;
  height: 56px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
}
.login-form button:active {
  box-shadow: inset 2px 4px 4px rgba(0, 0, 0, 0.25);
}
.login-errmsg {
  position: absolute;
  top: 425px;
  left: 0;
  margin-left: auto;
}
.join {
  color: #828282;
  font-size: 14px;
  line-height: 20px;
  margin-top: 179px;
}
.btn-back {
  position: absolute;
  top: 11px;
  left: 37px;
  width: 27px;
  height: 27px;
  background-image: url("../assets/img/back.png");
}
#reset {
  padding-top: 72px;
}
.reset-txt {
  margin-top: 200px;
  font-weight: 500;
  font-size: 16px;
  line-height: 23px;
  text-align: center;
  color: #4f4f4f;
}
@media (max-width: 900px) {
  .auth-copyright {
    bottom: 39px;
  }
  #login {
    bottom: 73px;
    width: 420px;
    margin-top: 202px;
  }
  .login-logos {
    margin-bottom: 20px;
  }
  .login-form button {
    margin-top: 30px;
    margin-bottom: 18px;
  }
  .login-errmsg {
    top: 475px;
    font-size: 13px;
  }
  .btn-back {
    top: 60px;
  }
  #reset {
    padding-top: 89px;
  }
  .reset-txt {
    margin-top: 300px;
  }
}
</style>
