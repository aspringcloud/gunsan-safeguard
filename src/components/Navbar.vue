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
import navbarMixin from "@/components/navfunc.js";
import "@/components/navbar.css";

export default {
  name: "Navbar",
  mixins: [navbarMixin],
  methods: {}
};
</script>
<style scoped>
.main-header {
  height: 68px;
  padding: 0 36px;
}
.header-title {
  font-size: 18px;
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
  position: absolute;
  border-radius: 14px;
  height: 500px;
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
.setting-btn {
  width: 117px;
  height: 40px;
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

.setting-content {
  padding-top: 30px;
}
.setting-infos label {
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}
.errmsg-pos {
  top: 240px;
}
.setting-pwrule {
  margin-top: 30px;
  font-size: 14px;
}

.rspw-btn-pos {
  margin-top: 43px;
}
@media (min-width: 601px) and (max-width: 960px) {
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