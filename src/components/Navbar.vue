<template>
  <div id="Navbar">
    <div class="main-header">
      <div>
        <div class="header-title text-blue">
          <span class="text-blue">SpringGo</span> 안전요원
        </div>
      </div>
      <div class="header-right">
        <span>{{ calcUserName }}</span
        >님 안녕하세요!
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
    <div v-if="isSetting" class="modal-back">
      <div></div>
      <div class="modalBox modalBox-setting">
        <button class="setting-closebtn" @click="isSetting = false">
          <img src="@/assets/img/closebtn.png" alt="close button" />
        </button>
        <div class="setting-tab">
          <button
            class="setting-tab-login"
            :class="{ 'setting-activetab': loginInfo }"
            @click="loginInfo = true"
          >
            로그인 정보
          </button>
          <div class="setting-tab-divider"></div>
          <button
            class="setting-tab-pw"
            :class="{ 'setting-activetab': !loginInfo }"
            @click="loginInfo = false"
          >
            비밀번호 변경
          </button>
        </div>
        <div v-if="loginInfo" class="setting-content setting-loginInfo">
          <div class="input-box">
            <label for="email">이메일 ID</label>
            <input name="email" type="text" :value="user.info.email" readonly />
          </div>
          <div class="input-box">
            <label for="team">이름</label>
            <input
              name="team"
              type="text"
              :value="user.info.username"
              readonly
            />
          </div>
          <div class="input-box">
            <label for="team">팀</label>
            <input
              name="team"
              type="text"
              :value="user.profile.team"
              readonly
            />
          </div>
          <div class="input-box">
            <label for="phone">휴대폰</label>
            <input
              name="phone"
              type="text"
              :value="user.profile.phone"
              readonly
            />
          </div>
          <div class="input-box">
            <label for="auth">권한</label>
            <input
              name="auth"
              type="text"
              :value="user.profile.level"
              readonly
            />
          </div>
        </div>

        <div v-if="!loginInfo" class="setting-content">
          <form class="resetpw-container" @submit.prevent="resetPw">
            <div class="input-box">
              <label for="currentPw">현재 비밀번호</label>
              <input
                id="currentPw"
                v-model="currentpw"
                type="password"
                name="currentPw"
                placeholder="현재 비밀번호를 입력하세요."
              />
            </div>
            <div class="input-box">
              <label for="newPw">새 비밀번호</label>
              <input
                v-model="newpw"
                type="password"
                name="newPw"
                placeholder="새로운 비밀번호를 입력하세요."
              />
            </div>
            <div class="input-box">
              <label for="renewPw">새 비밀번호 확인</label>
              <input
                v-model="repw"
                type="password"
                name="renewPw"
                placeholder="새로운 비밀번호를 다시 입력하세요."
              />
            </div>
            <div v-if="errmsg" class="errmsg errmsg-pos">{{ errmsg }}</div>
            <div v-if="successmsg" class="text-blue errmsg-pos">
              {{ successmsg }}
            </div>
            <div class="setting-pwrule">
              ※ 이메일ID, 이름을 포함할 수 없습니다.
              <br />※ 8글자 이상이어야 합니다. <br />※ 숫자로만 입력은
              불가능합니다.
            </div>
            <button class="setting-btn" type="submit">변경하기</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import navbarMixin from "@/components/navfunc.js";

export default {
  name: "Navbar",
  mixins: [navbarMixin],
  methods: {},
};
</script>
<style scoped>
.main-header {
  height: 68px;
  padding: 0 36px;
  position: fixed;
  z-index: 9;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  background-color: #f4f4f4;
  box-shadow: 0px 0.5px 0px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(27.1828px);
}
.header-title {
  font-weight: 500;
  font-size: 18px;
}
.header-right {
  display: inline-flex;
  align-items: center;
}
.header-title span {
  font-weight: 800;
  font-size: 24px;
  font-family: "NanumSquareRound", sans-serif;
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
.modal-back {
  z-index: 10;
}
.modalBox-setting {
  position: absolute;
  border-radius: 14px;
  height: 384px;
  width: 383px;
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
  width: 270px;
  margin-bottom: 10px;
}
.setting-username {
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  margin-bottom: 15px;
}
.setting-content {
  width: 100%;
  display: inline-flex;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
}
.setting-content input {
  background-color: #f8f8f8;
  border: 0.2px solid #e0e0e0;
  border-radius: 2px;
  height: 30px;
  color: #333333;
}
.setting-content input::placeholder {
  color: #bdbdbd;
  font-size: 12px;
}
.setting-content label {
  font-size: 13px;
  line-height: 30px;
  color: #555555;
  display: inline-block;
}
.input-box {
  width: 324px;
  display: flex;
  justify-content: space-between;
}
.setting-loginInfo input {
  width: 247px;
  margin-bottom: 10px;
  padding-left: 20px;
}
.resetpw-container input {
  width: 222px;
  margin-bottom: 15px;
  padding-left: 10px;
}
.errmsg-pos {
  position: absolute;
  top: 149px;
  left: 132px;
  font-size: 12px;
  margin-top: 5px;
  width: 222px;
}
.setting-pwrule {
  line-height: 21px;
  font-size: 12px;
  margin-top: 30px;
  margin-left: 102px;
  color: #828282;
}
.setting-btn {
  margin-left: 102px;
  margin-top: 10px;
  width: 222px;
  line-height: 30px;
  height: 30px;
  background: #2e92b0;
  border-radius: 2px;
  color: #ffffff;
  font-weight: 500;
  font-size: 13px;
}
@media (max-width: 900px) {
  .modalBox-setting {
    margin: 0 auto;
    top: 219px;
    left: 0;
    right: 0;
  }
  .modal-back {
    background-color: rgba(0, 0, 0, 0.3);
  }
}
</style>