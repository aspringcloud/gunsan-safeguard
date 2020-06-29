<template>
  <div id="NavbarM">
    <!-- Header -->
    <div class="main-header">
      <div>
        <div class="header-title text-blue">
          <span class="text-blue">SpringGo</span> 안전요원
        </div>
      </div>
      <div class="header-mobile">
        <img @click="closeSetting" src="@/assets/img/menu.png" alt="mobile menu" />
      </div>
    </div>

    <!-- 햄버거 메뉴 오픈 -->
    <div class="small-menu" v-if="openHam">
      <div class="small-menu-title">
        <b>{{ user.info.first_name }}</b> 님 안녕하세요
      </div>
      <div class="small-menu-menus">
        <button @click="openSetting()">로그인 정보</button>
        <button @click="openmobilepw()">비밀번호 변경</button>
        <button @click="logout()">로그아웃</button>
      </div>
    </div>

    <!-- 모바일버전 로그인정보 모달-->
    <div class="modalBox-setting" v-if="loginInfo">
      <div class="setting-title">
        <div>로그인 정보</div>
        <button @click="loginInfo = false">
          <img width="18px;" src="@/assets/img/close.png" alt="close button" />
        </button>
      </div>
      <div class="setting-login-img">
        <img src="@/assets/img/profile.png" alt="user profile image" />
        <div>
          <div class="setting-username">{{ user.info.last_name }} {{ user.info.first_name }}</div>
          <button class="setting-btn">사진 변경하기</button>
        </div>
      </div>
      <div class="loginInfo-content">
        <div class="loginInfo-title">이메일 ID</div>
        <div class="loginInfo-info">{{ user.info.email }}</div>
        <div class="loginInfo-title">팀</div>
        <div class="loginInfo-info">{{ user.profile.team }}</div>
        <div class="loginInfo-title">휴대폰</div>
        <div class="loginInfo-info">{{ user.profile.phone }}</div>
        <div class="loginInfo-title">권한</div>
        <div class="loginInfo-info">{{ user.profile.level }}</div>
      </div>
    </div>

    <!-- 모바일버전 비밀번호 변경 모달-->
    <div class="modalBox-setting" v-if="changePw">
      <div class="setting-title">
        <div>비밀번호 변경</div>
        <button @click="changePw = false">
          <img width="18px;" src="@/assets/img/close.png" alt="close button" />
        </button>
      </div>
      <div class="setting-content">
        <form class="setting-infos" @submit.prevent="resetPw">
          <label for="currentPw">현재 비밀번호</label>
          <input id="currentPw" value="1234567890" disabled type="password" name="newPw" />
          <label for="newPw">새 비밀번호</label>
          <input v-model="newpw" type="password" name="newPw" placeholder="새로운 비밀번호를 입력하세요." />
          <label for="renewPw">새 비밀번호 확인</label>
          <input v-model="repw" type="password" name="renewPw" placeholder="새로운 비밀번호를 다시 입력하세요." />
          <div v-if="errmsg" class="errmsg errmsg-pos">{{ errmsg }}</div>
          <div v-if="successmsg" class="text-blue errmsg-pos">{{ successmsg }}</div>
          <div class="setting-pwrule">
            ※ 비밀번호에 이메일ID, 이름을 포함할 수 없습니다.
            <br />※ 비밀번호는 8글자 이상이어야 합니다.
            <br />※ 비밀번호는
            숫자로만 입력은 불가능합니다.
          </div>
          <button class="setting-btn rspw-btn-pos" type="submit">변경하기</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import navbarMixin from "@/components/navbar.js";
import "@/components/navbar.css";

export default {
  name: "NavbarM",
  mixins: [navbarMixin],

  data: () => ({
    openHam: false,
    changePw: false
  }),
  methods: {
    openmobilepw() {
      this.errmsg = "";
      this.successmsg = "";
      this.newpw = "";
      this.repw = "";
      this.changePw = true;
      this.openHam = false;
      this.isModal = true;
    },
    closeSetting() {
      if (this.loginInfo) {
        this.loginInfo = false;
        this.openHam = false;
        return;
      } else if (this.changePw) {
        this.openHam = false;
        this.changePw = false;
        return;
      } else {
        this.openHam = !this.openHam;
      }
    }
  }
};
</script>
<style scoped>
.main-header {
  height: 56px;
  padding: 0 24px;
}
.header-title {
  font-size: 14px;
}
.header-mobile {
  display: block;
  cursor: pointer;
}
.small-menu {
  display: block;
  position: fixed;
  top: 56px;
  right: 0;
  width: 162px;
  height: 249px;
  background-color: #ffffff;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.12),
    0px 0px 2px rgba(0, 0, 0, 0.14);
  padding: 20px;
}
.small-menu-title {
  text-align: center;
  height: 38px;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.2);
  font-size: 14px;
}
.small-menu-menus {
  margin-top: 8px;
}
.small-menu-menus button {
  height: 57px;
  font-size: 16px;
  text-align: end;
  vertical-align: middle;
  border: none;
  width: 100%;
  padding-right: 15px;
  background-color: #ffffff;
}
.small-menu-menus button:hover,
.small-menu-menus button:active {
  background-color: rgba(0, 0, 0, 0.1);
}
.modalBox-setting {
  position: absolute;
  color: #333333;
  font-size: 13px;
  background: #ffffff;
  top: 56px;
  width: 312px;
  height: 410px;
  right: 0;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.12),
    0px 0px 2px rgba(0, 0, 0, 0.14);
}
.setting-title {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  font-weight: 500;
  font-size: 16px;
}
.setting-login-img {
  width: 225px;
  margin: 10px 40px;
}
.setting-login-img img {
  width: 80px;
}
.setting-login-img button {
  width: 110px;
  height: 30px;
  font-size: 13px;
}
.loginInfo-content {
  width: 160px;
  margin: 20px auto;
}
.loginInfo-title {
  margin-top: 10px;
  color: #828282;
  margin-bottom: 5px;
}
.setting-content {
  padding-top: 8px;
}
.setting-infos label {
  font-size: 13px;
  margin-bottom: 5px;
  margin-top: 7px;
}
.setting-infos input {
  width: 278px;
  font-size: 12px;
  padding-left: 10px;
}
.rspw-btn-pos {
  margin-top: 14px;
}
.setting-btn {
  width: 96px;
  height: 30px;
  font-size: 13px;
  margin-top: 10px;
}
.setting-pwrule {
  margin-top: 25px;
  font-size: 13px;
}
.errmsg-pos {
  top: 197px;
}
</style>