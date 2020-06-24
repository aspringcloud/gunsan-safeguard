<template>
  <div id="Navbar">
    <div class="main-header">
      <div>
        <div class="header-title text-blue">
          <span class="text-blue">SpringGo</span> 안전요원
        </div>
      </div>
      <div class="header-right">
        <span>{{ user.info.first_name }}</span>님 안녕하세요!
        <button @click="openSetting">
          <img src="@/assets/img/setting.png" alt="setting button" />
          환경설정
        </button>
        <button @click="logout">
          <img src="@/assets/img/loggout.png" alt="logout button" />
          로그아웃
        </button>
      </div>
    </div>

    <!-- 태블릿,PC버전 환경설정 모달 -->
    <div v-if="isSetting">
      <div class="modal-back"></div>
      <div class="modalBox modalBox-setting">
        <button class="setting-closebtn" @click="isSetting=false">
          <img src="@/assets/img/closebtn.png" alt="close button" />
        </button>
        <div class="setting-tab">
          <button
            class="setting-tab-login"
            :class="{ 'setting-activetab': loginInfo }"
            @click="loginInfo = true"
          >로그인 정보</button>
          <div class="setting-tab-divider"></div>
          <button
            class="setting-tab-pw"
            :class="{ 'setting-activetab': !loginInfo }"
            @click="loginInfo = false"
          >비밀번호 변경</button>
        </div>
        <div v-if="loginInfo" class="setting-content setting-loginInfo">
          <div class="setting-login-img">
            <img src="@/assets/img/profile.png" alt="user profile image" />
            <div>
              <div class="setting-username">{{ user.info.last_name }} {{ user.info.first_name }}</div>
              <button class="setting-btn">사진 변경하기</button>
            </div>
          </div>
          <div class="setting-infos">
            <label for="email">이메일 ID</label>
            <input name="email" type="text" :value="user.info.email" readonly />
            <label for="team">팀</label>
            <input name="team" type="text" :value="user.profile.team" readonly />
            <label for="phone">휴대폰</label>
            <input name="phone" type="text" :value="user.profile.phone" readonly />
            <label for="auth">권한</label>
            <input name="auth" type="text" :value="user.profile.level" readonly />
          </div>
        </div>

        <div v-if="!loginInfo" class="setting-content">
          <form class="setting-infos" @submit.prevent="resetPw">
            <label for="currentPw">현재 비밀번호</label>
            <input id="currentPw" value="1234567890" disabled type="password" name="newPw" />
            <label for="newPw">새 비밀번호</label>
            <input v-model="newpw" type="password" name="newPw" placeholder="새로운 비밀번호를 입력하세요." />
            <label for="renewPw">새 비밀번호 확인</label>
            <input v-model="repw" type="password" name="renewPw" placeholder="새로운 비밀번호를 다시 입력하세요." />
            <button class="setting-btn rspw-btn-pos" type="submit">변경하기</button>
            <div v-if="errmsg" class="errmsg errmsg-pos">{{ errmsg }}</div>
            <div v-if="successmsg" class="text-blue errmsg-pos">{{ successmsg }}</div>
          </form>
          <div class="setting-pwrule">
            ※ 비밀번호에 이메일ID, 이름을 포함할 수 없습니다.
            <br />※ 비밀번호는 8글자 이상이어야 합니다.
            <br />※ 비밀번호는
            숫자로만 입력은 불가능합니다.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Navbar",
  props: ["user"],
  data: () => ({
    newpw: "",
    repw: "",
    openHam: false,
    isSetting: false,
    loginInfo: true,
    errmsg: "",
    successmsg: ""
  }),
  methods: {
    openSetting() {
      if (!this.user.profile) {
        this.$http
          .get(this.$api + "users/" + this.user.info.pk, {
            headers: this.$headers
          })
          .then(res => {
            this.user.profile = res.data.profile;
            this.isSetting = true;
            this.loginInfo = true;
            this.errmsg = "";
            this.successmsg = "";
          })
          .catch(err => {
            alert(
              err,
              "사용자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
            );
          });
      } else {
        this.loginInfo = true;
        this.isSetting = true;
        this.errmsg = "";
        this.successmsg = "";
        this.newpw = "";
        this.repw = "";
      }
    },
    logout() {
      this.$http
        .post(this.$api + "auth/logout/")
        .then(res => {
          console.log(res.data.detail);
          this.$session.destroy();
          this.$router.push({ name: "Login" });
        })
        .catch(err => {
          console.log(err);
        });
    },
    resetPw() {
      this.$http
        .post(
          this.$api + "auth/password/change/",
          { new_password1: this.newpw, new_password2: this.repw },
          { headers: this.$headers }
        )
        .then(res => {
          console.log(res.data.detail);
          this.errmsg = "";
          this.successmsg = "새로운 비밀번호로 변경되었습니다.";
          var temp = this.$session.get("user");
          temp.basic = btoa(this.user.info.email + ":" + this.newpw);
          this.$session.set("user", temp);
          this.$headers.authorization =
            "Basic " + this.$session.get("user").basic;
          this.newpw = "";
          this.repw = "";
        })
        .catch(error => {
          console.log(error.response.data);
          var err = error.response.data.new_password2[0];
          if (
            err ==
            "This password is too short. It must contain at least 8 characters."
          ) {
            this.errmsg = "8글자 이상의 비밀번호를 입력하세요.";
          } else if (err == "The two password fields didn't match.") {
            this.errmsg = "두 개의 비밀번호가 일치하지 않습니다.";
          } else if (err == "This field may not be blank.") {
            this.errmsg = "비밀번호를 입력해주세요.";
          } else if (err == "This password is too common.") {
            this.errmsg = "평범하지 않은 비밀번호를 입력하세요.";
          } else if (err == "This password is entirely numeric.") {
            this.errmsg = "비밀번호에 숫자 외의 문자를 포함하세요.";
          } else if (
            err == "The password is too similar to the email address."
          ) {
            this.errmsg = "비밀번호가 이메일ID와 너무 유사합니다.";
          } else if (err == "The password is too similar to the username.") {
            this.errmsg = "비밀번호가 사용자 이름과 너무 유사합니다.";
          } else {
            console.log(this.errmsg);
          }
        });
    }
  }
};
</script>
<style scoped>
.main-header {
  position: fixed;
  top: 0;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  height: 68px;
  background-color: #f4f4f4;
  padding: 0 36px;
  box-shadow: 0px 0.5px 0px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(27.1828px);
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}
.header-title span {
  font-weight: 800;
  font-size: 24px;
  font-family: "NanumSquareRound", sans-serif;
}
.header-right {
  display: inline-flex;
  align-items: center;
}
.header-right button {
  border: none;
  background-color: #f4f4f4;
  margin-left: 26px;
  display: inline-flex;
  align-items: center;
}
.header-right span {
  font-weight: 500;
  margin-right: 4px;
}
.header-right img {
  margin-right: 10px;
}
.modalBox-setting {
  z-index: 2;
  border-radius: 14px;
  height: 500px;
  width: 383px;
  position: fixed;
  top: 68px;
  right: 100px;
}
.setting-closebtn {
  position: absolute;
  border: none;
  background: none;
  top: -18px;
  right: -20px;
}
.setting-tab {
  display: flex;
  height: 60px;
  box-shadow: 0px 0.5px 0px rgba(0, 0, 0, 0.3);
}
.setting-username {
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  margin-bottom: 15px;
}
.setting-btn {
  border: 1px solid #3bbae2;
  border-radius: 4px;
  color: #3bbae2;
  font-size: 14px;
  background: transparent;
  width: 117px;
  height: 40px;
}
.setting-btn:active {
  color: #ffffff;
  background-color: #38bae2;
}
.setting-tab button {
  background: #f3f3f3;
  border: none;
  font-size: 18px;
  width: 192px;
}
.setting-tab-login {
  border-radius: 14px 0 0 0;
}
.setting-tab-divider {
  width: 1px;
  background-color: rgba(0, 0, 0, 0.2);
}
.setting-tab-pw {
  border-radius: 0 14px 0 0;
}
.setting-activetab {
  color: #3bbae2;
  font-weight: bold;
}
.setting-login-img {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 270px;
  margin-bottom: 10px;
}

.setting-content {
  padding-top: 30px;
  width: 100%;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.setting-infos {
  display: flex;
  flex-direction: column;
}
.errmsg-pos {
  position: absolute;
  top: 240px;
}
.setting-pwrule {
  color: #828282;
  line-height: 24px;
  margin-top: 30px;
  font-size: 14px;
}

#currentPw {
  background: #bdbdbd;
  color: #666666;
}
.rspw-btn-pos {
  margin-top: 43px;
  align-self: flex-end;
}
.setting-infos label {
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}
.setting-infos input {
  width: 268px;
  background-color: #f8f8f8;
  border: 0.2px solid #e0e0e0;
  border-radius: 2px;
  height: 30px;
  padding-left: 20px;
  color: #666666;
}
.setting-infos input::placeholder {
  color: #bdbdbd;
}
</style>