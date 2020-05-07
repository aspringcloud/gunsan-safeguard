<template>
  <div id="main">
    <!-- Header -->
    <div class="main-header">
      <div>
        <div class="header-title text-blue">
          <span class="text-blue">SpringGo</span> 안전요원
        </div>
      </div>
      <div class="header-right">
        <span>{{user.info.first_name}}</span>님 안녕하세요!
        <button @click="openSetting()">
          <img src="setting.png" alt="setting button" />
          환경설정
        </button>
        <button @click="logout()">
          <img src="loggout.png" alt="logout button" />
          로그아웃
        </button>
      </div>
      <div class="header-mobile">
        <img @click="closeMobileSetting()" src="menu.png" alt="mobile menu" />
      </div>
    </div>

    <!-- 햄버거 메뉴 오픈 -->
    <div class="small-menu" v-if="openHam">
      <div class="small-menu-title">
        <b>{{user.info.first_name}}</b> 님 안녕하세요
      </div>
      <div class="small-menu-menus">
        <button @click="openSetting()">로그인 정보</button>
        <button @click="openmobilepw()">비밀번호 변경</button>
        <button @click="logout()">로그아웃</button>
      </div>
    </div>

    <!-- 모바일버전 로그인정보 모달-->
    <div class="mobile-setting-modal" v-if="sloginInfo">
      <div class="mobile-setting-modal-title">
        <div>로그인 정보</div>
        <button @click="sloginInfo=false;">
          <img width="18px;" src="close.png" alt="close button" />
        </button>
      </div>
      <div class="setting-login-img">
        <img src="profile.png" alt="user profile image" />
        <div>
          <div class="setting-username">{{user.info.last_name}} {{user.info.first_name}}</div>
          <button class="setting-btn">사진 변경하기</button>
        </div>
      </div>
      <div class="mobile-loginInfo-content">
        <div class="mobile-loginInfo-title">이메일 ID</div>
        <div class="mobile-loginInfo-info">{{user.info.email}}</div>
        <div class="mobile-loginInfo-title">팀</div>
        <div class="mobile-loginInfo-info">{{user.profile.team}}</div>
        <div class="mobile-loginInfo-title">휴대폰</div>
        <div class="mobile-loginInfo-info">{{user.profile.phone}}</div>
        <div class="mobile-loginInfo-title">권한</div>
        <div class="mobile-loginInfo-info">{{user.profile.level}}</div>
      </div>
    </div>

    <!-- 모바일버전 비밀번호 변경 모달-->
    <div class="mobile-setting-modal" v-if="schangePw">
      <div class="mobile-setting-modal-title">
        <div>비밀번호 변경</div>
        <button @click="schangePw=false;">
          <img width="18px;" src="close.png" alt="close button" />
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
          <div v-if="errmsg" class="errmsg errmsg-pos">{{errmsg}}</div>
          <div v-if="successmsg" class="text-blue errmsg-pos">{{successmsg}}</div>
          <div class="setting-pwrule">
            ※ 비밀번호에 이메일ID, 이름을 포함할 수 없습니다.
            <br />※ 비밀번호는 8글자 이상이어야 합니다.
            <br />※ 비밀번호는 숫자로만 입력은 불가능합니다.
          </div>
          <button class="setting-btn rspw-btn-pos" type="submit">변경하기</button>
        </form>
      </div>
    </div>

    <!-- 태블릿,PC버전 환경설정 모달 -->
    <div v-if="isSetting">
      <div class="modal-back" v-if="600<windowWidth && windowWidth<=960"></div>
      <div class="modalBox modalBox-setting">
        <button class="setting-closebtn" @click="isSetting = false">
          <img src="closebtn.png" alt="close button" />
        </button>
        <div class="setting-tab">
          <button
            class="setting-tab-login"
            :class="{'setting-activetab': loginInfo}"
            @click="loginInfo=true"
          >로그인 정보</button>
          <div class="setting-tab-divider"></div>
          <button
            class="setting-tab-pw"
            :class="{'setting-activetab': !loginInfo}"
            @click="loginInfo=false"
          >비밀번호 변경</button>
        </div>
        <div v-if="loginInfo" class="setting-content setting-loginInfo">
          <div class="setting-login-img">
            <img src="profile.png" alt="user profile image" />
            <div>
              <div class="setting-username">{{user.info.last_name}} {{user.info.first_name}}</div>
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
            <div v-if="errmsg" class="errmsg errmsg-pos">{{errmsg}}</div>
            <div v-if="successmsg" class="text-blue errmsg-pos">{{successmsg}}</div>
          </form>
          <div class="setting-pwrule">
            ※ 비밀번호에 이메일ID, 이름을 포함할 수 없습니다.
            <br />※ 비밀번호는 8글자 이상이어야 합니다.
            <br />※ 비밀번호는 숫자로만 입력은 불가능합니다.
          </div>
        </div>
      </div>
    </div>

    <!-- <modal v-if="isDash" :selectedCar="selectedCar" :title="false" @close="resetCar">
      <slot>gd</slot>
    </modal>-->

    <div class="modal" v-if="isDash">
      <div class="modalBox modalBox-submit">
        <div class="modal-content">
          <div>차량</div>
          <div class="modal-txt">
            <span class="text-blue" style="font-size: 24px;">{{selectedCar.name}}</span> 을 선택합니까?
          </div>
        </div>
        <div class="modalBtn">
          <button class="modalBtn-cancel text-blue" @click="resetCar()">취소</button>
          <button class="modalBtn-save" @click="submitCar()">선택하기</button>
        </div>
      </div>
    </div>

    <div class="selectCar" v-if="!dashboard">
      <img src="shuttle.png" alt="shuttle image" />
      <div>
        <div class="selectCar-title">
          운행하시는 차량을
          <br />선택해주세요.
        </div>
        <select v-model="selectedCar" name="selectCar" id="selectCar">
          <option value>차량을 선택하세요.</option>
          <option v-for="car in cars" :key="car.name" :value="car">{{car.name}}</option>
        </select>
      </div>
    </div>

    <modal v-if="isSubmit" :selectedCar="selectedCar" :title="modalTitle" @close="isSubmit=false"></modal>
    <!-- <div v-if="isSubmit" class="modal">
      <div class="modalBox modalBox-submit">
        <div class="modal-content">
          <div>{{selectedCar.name}}</div>
          <div class="modal-txt">
            <span>{{modalTitle}}</span> 변경하시겠습니까?
          </div>
        </div>
        <div class="modalBtn">
          <button class="modalBtn-cancel text-blue" @click="isSubmit=false">취소</button>
          <button class="modalBtn-save" @click="submitModal()">변경하기</button>
        </div>
      </div>
    </div>-->

    <modal v-if="isMsg" :selectedCar="selectedCar" title="msg" @close="isMsg=false">
      <slot>
        <div class="msg-content">
          <div class="msg-title">
            <b>사이트</b> 통합관제 화면으로 전송
          </div>
          <textarea
            @keydown="calcbyte()"
            @keyup="calcbyte"
            v-model="msgtxt"
            name="msgtxt"
            id="msgtxt"
            cols="30"
            rows="10"
          ></textarea>
          <div class="msg-byte">{{byte}}/200bytes</div>
        </div>
      </slot>
    </modal>

    <!-- <div v-if="isMsg" class="modal">
      <div class="modalBox modalBox-msg">
        <div class="modalBtn">
          <button class="modalBtn-cancel text-blue" @click="closeMsg()">취소</button>
          <button class="modalBtn-save" @click="sendMsg()">보내기</button>
        </div>
      </div>
    </div>-->

    <div v-if="dashboard" class="main-board">
      <div class="board-left">
        <div class="carinfo">
          <img src="shuttle2.png" alt="shuttle image" />
          <div class="mobile-clock" v-if="windowWidth<=960">
            <div class="time">{{clock}}</div>
            <div class="date">{{today}}</div>
          </div>
          <div v-if="600<windowWidth && windowWidth<=960" class="board-info">
            <div class="info-title">차량 전원</div>
            <img
              class="powerbtn"
              @click="powerOff()"
              v-if="isOn"
              src="switchOn.png"
              alt="switchOFF button"
            />
            <img
              class="powerbtn"
              @click="powerOn()"
              v-if="!isOn"
              src="switchOff.png"
              alt="switchOFF button"
            />
          </div>
        </div>
        <div v-if="windowWidth<600" class="mobile-firstContainer">
          <div class="mobile-carChange">
            <div class="info-title">차량</div>
            <div class="carinfo-txt">
              {{selectedCar.name}}
              <a @click="carChange(selectedCar.name)">차량 변경하기</a>
            </div>
          </div>
          <div class="mobile-power">
            <img
              class="powerbtn"
              @click="powerOff()"
              v-if="isOn"
              src="mobile_poweron.png"
              alt="switchOFF button"
            />
            <img
              class="powerbtn"
              @click="powerOn()"
              v-if="!isOn"
              src="mobile_poweroff.png"
              alt="switchOFF button"
            />
            <div class="info-title">
              차량
              <br />전원
            </div>
          </div>
        </div>
        <div class="board-info">
          <div class="info-title">현재위치</div>
          <div class="info-txt">{{location}}</div>
        </div>
        <div class="mobile-drivetime">
          <div class="board-info">
            <div class="info-title">운행시간</div>
            <div class="info-txt">{{drivetime}}</div>
          </div>
          <div class="board-info">
            <div class="info-title">마지막 전원 ON</div>
            <div class="info-txt">{{lastOn}}</div>
          </div>
        </div>
        <div v-if="windowWidth>=980" class="board-info">
          <div class="info-title">차량 전원</div>
          <img
            class="powerbtn"
            @click="powerOff()"
            v-if="isOn"
            src="switchOn.png"
            alt="switchOFF button"
          />
          <img
            class="powerbtn"
            @click="powerOn()"
            v-if="!isOn"
            src="switchOff.png"
            alt="switchOFF button"
          />
        </div>
      </div>

      <div class="board-right">
        <div v-if="windowWidth>=980" class="datetime">
          <div class="time">{{clock}}</div>
          <div class="date">{{today}}</div>
        </div>
        <div class="board-info">
          <div class="info-title">메시지</div>
          <select v-model="msgTo" name="msgTo" id="msgTo">
            <option value>사이트 통합관제</option>
            <option v-for="center in centers" :key="center.name" :value="center">{{center.name}}</option>
          </select>
          <button v-if="windowWidth<=600" class="btn-outline msgTo-btn" @click="isMsg=true">보내기</button>
          <button v-else class="btn-outline msgTo-btn" @click="isMsg=true">메시지 보내기</button>
        </div>
        <div class="board-info">
          <div class="info-title">탑승객 수</div>
          <div class="psnginfo">
            <div class="psng-txt">
              <span>{{psng}}</span> 명
            </div>
            <div class="psng-cnt">
              <button class="btn-minus" @click="decrease()">
                <img src="minus.png" alt="minus button" />
              </button>
              <input type="number" v-model="psngTemp" />
              <button class="btn-plus" @click="increase()">
                <img src="plus.png" alt="plus button" />
              </button>
            </div>
            <button class="btn-outline psng-save" @click="savePsng()">저장</button>
          </div>
        </div>
        <div class="board-info">
          <div class="info-title">주행모드</div>
          <div class="info-btngroup">
            <button class="togglebtn" :class="{btnActive: isAuto==1}" @click="autoOn()">자동주행</button>
            <button class="togglebtn" :class="{btnActive: isAuto==2}" @click="autoOff()">수동주행</button>
          </div>
        </div>
        <div class="board-info">
          <div class="info-title">주차여부</div>
          <div class="info-btngroup">
            <button class="togglebtn" :class="{btnActive: isPark}" @click="parkOn()">예</button>
            <button class="togglebtn" :class="{btnActive: !isPark}" @click="parkOff()">아니오</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import router from "../router";
import Modal from "../components/modal";

const url = "http://115.93.143.2:9103/api/";

export default {
  name: "Main",
  components: { Modal },
  data: () => ({
    dashboard: false,
    isDash: false,
    newpw: "",
    repw: "",
    user: "",
    errmsg: "",
    headers: {
      accept: "application/json",
      authorization: "",
      "Content-Type": "application/json"
    },
    isSetting: false,
    loginInfo: true,
    sloginInfo: false,
    schangePw: false,
    cars: [],
    selectedCar: "",
    date: "",
    isOn: 1,
    isSubmit: false,
    lastOn: " ",
    location: "경기도 안성시 죽산면 죽산리 343-1",
    psng: 0,
    isAuto: 1,
    isPark: 1,
    isMsg: false,
    msgtxt: "",
    modalTitle: "",
    modalValue: "",
    msgTo: "",
    centers: [{ name: "사이트 통합관제" }],
    drivetime: " ",
    successmsg: "",
    byte: 0,
    today: "",
    clock: "",
    openHam: false,
    windowWidth: 0,
    psngTemp: 0
  }),
  beforeCreate() {
    if (!this.$session.exists()) {
      router.push({ name: "Login" });
    }
  },
  created() {
    if (this.$session.exists()) {
      this.user = this.$session.get("user");
      this.headers.authorization = "Basic " + this.user.basic;
      axios
        .get(url + "vehicles/", { headers: this.headers })
        .then(res => {
          var infos = res.data;
          for (let i = 0; i < infos.length; i++) {
            this.cars.push({ id: infos[i].id, name: infos[i].name });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    setInterval(this.showClock, 1000);
    this.windowWidth = window.innerWidth;
  },
  watch: {
    clock: function() {
      if (this.drivetime != " ") {
        this.calcDrivetime(this.lastOn);
      }
    },
    selectedCar: function() {
      if (this.selectedCar) {
        this.isDash = true;
      }
    },
    windowWidth: function() {
      if (this.windowWidth < 601) {
        if (this.isSetting) {
          if (this.loginInfo) {
            this.sloginInfo = true;
          } else {
            this.schangePw = true;
          }
        }
        this.isSetting = false;
      } else {
        this.openHam = false;
        if (this.schangePw) {
          this.schangePw = false;
          this.isSetting = true;
          this.loginInfo = false;
        }
        if (this.sloginInfo) {
          this.sloginInfo = false;
          this.isSetting = true;
          this.loginInfo = true;
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.onResize);
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    closeMobileSetting() {
      if (this.sloginInfo) {
        this.sloginInfo = false;
        return;
      } else if (this.schangePw) {
        this.schangePw = false;
        return;
      } else {
        this.openHam = !this.openHam;
      }
    },
    onResize() {
      this.windowWidth = window.innerWidth;
    },
    openmobilepw() {
      this.errmsg = "";
      this.successmsg = "";
      this.schangePw = true;
      this.openHam = false;
      this.isModal = true;
    },
    resetCar() {
      this.selectedCar = "";
      this.isDash = false;
    },
    submitCar() {
      axios
        .get(url + "vehicles/" + this.selectedCar.id, { headers: this.headers })
        .then(res => {
          // console.log("초기값", res.data);
          this.psng = res.data.passenger;
          this.isOn = res.data.drive;
          this.isAuto = res.data.drive_mode;
          if (!this.psng) this.psng = 0;
          this.psngTemp = this.psng;
          this.isPark = res.data.isparked;
          if (res.data.lon && res.data.lat) {
            axios
              .get(
                `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${res.data.lon}&y=${res.data.lat}&input_coord=WGS84`,
                {
                  headers: {
                    Authorization: "KakaoAK 13d764d3755ffa0f1ee21f204fd52fe1"
                  }
                }
              )
              .then(res => {
                this.location = res.data.documents[0].address.address_name;
              })
              .catch(err => {
                console.log(err);
                this.location = "서비스 에러";
              });
          } else {
            this.location = "위치정보 없음";
          }
        })
        .catch(err => {
          console.log(err);
        });

      axios
        .get(url + "oplogs/vehicle/" + this.selectedCar.id, {
          headers: this.headers
        })
        .then(res => {
          var i = res.data.length;
          if (i) {
            var time = res.data[i - 1].time_start;
            time = time.split("-").join("/");
            time = time.replace("T", " ");
            time = time.replace("Z", "");
            this.lastOn = time;
            this.calcDrivetime(time);
          } else {
            this.lastOn = " ";
            this.drivetime = " ";
          }
        })
        .catch(err => {
          console.log(err);
        });
      this.isDash = false;
      this.dashboard = true;
    },
    addZeros(num, digit) {
      var zero = "";
      num = num.toString();
      if (num.length < digit) {
        for (var i = 0; i < digit - num.length; i++) {
          zero += "0";
        }
      }
      return zero + num;
    },
    showClock() {
      var now = new Date();
      var day = now.getDay();
      var week = ["일", "월", "화", "수", "목", "금", "토"];
      this.today =
        now.getFullYear() +
        "/" +
        (now.getMonth() + 1) +
        "/" +
        now.getDate() +
        " " +
        week[day] +
        "요일";
      var nowH = this.addZeros(now.getHours(), 2);
      var nowMin = this.addZeros(now.getMinutes(), 2);
      var nowSec = this.addZeros(now.getSeconds(), 2);
      this.clock = nowH + ":" + nowMin + ":" + nowSec;
    },
    calcDrivetime(time) {
      if (!this.isOn || !this.lastOn) return;
      else {
        var timediff = new Date() - new Date(time);
        var diffD = parseInt(timediff / 86400000);
        timediff %= 86400000;
        var diffH = parseInt(timediff / 3600000);
        timediff %= 3600000;
        var diffM = parseInt(timediff / 60000);
        this.drivetime = `${diffH}시간 ${diffM}분`;
        if (diffD) this.drivetime = `${diffD}일 ` + this.drivetime;
      }
    },
    calcbyte() {
      var b, i, c;
      var s = this.msgtxt;
      var l = s.length;
      for (b = i = 0; i < l; i++) {
        c = s.charCodeAt(i);
        b += c >> 11 ? 3 : c >> 7 ? 2 : 1;
        if (b > 200) {
          this.msgtxt = s.substr(0, i);
          this.byte = b - (c >> 11 ? 3 : c >> 7 ? 2 : 1);
          alert("메세지는 200byte까지 입력 가능합니다.");
          return;
        }
        this.byte = b;
      }
      this.byte = b;
    },
    resetPw() {
      axios
        .post(
          url + "auth/password/change/",
          { new_password1: this.newpw, new_password2: this.repw },
          { headers: this.headers }
        )
        .then(res => {
          console.log(res.data.detail);
          this.errmsg = "";
          this.successmsg = "새로운 비밀번호로 변경되었습니다.";
          var temp = this.$session.get("user");
          temp.basic = btoa(this.user.info.email + ":" + this.newpw);
          this.$session.set("user", temp);
          this.headers.authorization =
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
    },

    logout() {
      axios
        .post(url + "auth/logout/")
        .then(res => {
          console.log(res.data.detail);
          this.$session.destroy();
          router.push({ name: "Login" });
        })
        .catch(err => {
          console.log(err);
        });
    },

    getTime() {
      var date = new Date();
      var timeString =
        date.getHours() +
        "시 " +
        date.getMinutes() +
        "분 " +
        date.getSeconds() +
        "초";
      var dateString =
        date.getFullYear() +
        "년 " +
        date.getMonth() +
        "월 " +
        date.getDate() +
        "일 ";
      return timeString + dateString;
    },

    carChange() {
      this.modalTitle = "차량";
      this.modalValue = this.selectedCar.name;
      this.isSubmit = true;
    },
    openSetting() {
      if (!this.user.profile) {
        axios
          .get(url + "users/" + this.user.info.pk, { headers: this.headers })
          .then(res => {
            this.user.profile = res.data.profile;
            if (this.windowWidth < 601) {
              this.sloginInfo = true;
              this.openHam = false;
            } else {
              this.isSetting = true;
              this.loginInfo = true;
              this.errmsg = "";
              this.successmsg = "";
            }
          })
          .catch(err => {
            alert(
              err,
              "사용자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
            );
          });
      } else {
        if (this.windowWidth < 601) {
          this.sloginInfo = true;
          this.openHam = false;
        } else {
          this.loginInfo = true;
          this.isSetting = true;
          this.errmsg = "";
          this.successmsg = "";
        }
      }
    },
    submitModal() {
      if (this.modalTitle == "차량") {
        this.selectedCar = "";
        this.dashboard = false;
        this.isSubmit = false;
      } else if (this.modalTitle == "전원") {
        axios
          .patch(
            url + "vehicles/" + this.selectedCar.id + "/",
            { drive: !this.isOn },
            { headers: this.headers }
          )
          .then(res => {
            this.isOn = res.data.drive;
          })
          .catch(err => {
            console.log(err);
            alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
          });
        this.isSubmit = false;
      } else if (this.modalTitle == "주행모드") {
        if (this.isAuto == 1) {
          axios
            .patch(
              url + "vehicles/" + this.selectedCar.id + "/",
              { drive_mode: 2 },
              { headers: this.headers }
            )
            .then(res => {
              this.isAuto = res.data.drive_mode;
            })
            .catch(err => {
              console.log(err);
              alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
            });
        } else if (this.isAuto == 2) {
          axios
            .patch(
              url + "vehicles/" + this.selectedCar.id + "/",
              { drive_mode: 1 },
              { headers: this.headers }
            )
            .then(res => {
              this.isAuto = res.data.drive_mode;
            })
            .catch(err => {
              console.log(err);
              alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
            });
        }
        this.isSubmit = false;
      } else {
        axios
          .patch(
            url + "vehicles/" + this.selectedCar.id + "/",
            { isparked: !this.isPark },
            { headers: this.headers }
          )
          .then(res => {
            this.isPark = res.data.isparked;
          })
          .catch(err => {
            console.log(err);
            alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
          });
        this.isSubmit = false;
      }
    },

    powerOn() {
      if (this.isOn) return;
      else {
        this.isSubmit = true;
        this.modalTitle = "전원";
        this.modalValue = "ON";
      }
    },

    powerOff() {
      if (!this.isOn) return;
      else {
        this.isSubmit = true;
        this.modalTitle = "전원";
        this.modalValue = "OFF";
      }
    },

    savePsng() {
      if (this.psngTemp >= 2147483847) {
        alert("탑승객 수를 확인해주세요.");
        this.psngTemp = this.psng;
        return;
      }
      axios
        .patch(
          url + "vehicles/" + this.selectedCar.id + "/",
          { passenger: this.psngTemp },
          { headers: this.headers }
        )
        .then(res => {
          this.psng = res.data.passenger;
        })
        .catch(err => {
          console.log(err);
          alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
        });
    },

    autoOn() {
      if (this.isAuto == 2) {
        this.isSubmit = true;
        this.modalTitle = "주행모드";
        this.modalValue = "자동주행";
      }
    },

    autoOff() {
      if (this.isAuto == 1) {
        this.isSubmit = true;
        this.modalTitle = "주행모드";
        this.modalValue = "수동주행";
      }
    },

    parkOn() {
      if (this.isPark) return;
      else {
        this.isSubmit = true;
        this.modalTitle = "주차여부";
        this.modalValue = "예";
      }
    },

    parkOff() {
      if (!this.isPark) return;
      else {
        this.isSubmit = true;
        this.modalTitle = "주차여부";
        this.modalValue = "아니오";
      }
    },

    decrease() {
      this.psngTemp = parseInt(this.psngTemp);
      if (this.psngTemp > 0) {
        this.psngTemp -= 1;
      }
    },
    increase() {
      this.psngTemp = parseInt(this.psngTemp);
      if (this.psngTemp < 2147483847) {
        this.psngTemp += 1;
      } else alert("입력값이 초과되었습니다.");
    },

    sendMsg() {
      if (!this.msgtxt) {
        alert("메세지를 입력해주세요.");
        return;
      }
      alert("메세지 기획 필요");
      this.isMsg = false;
      this.byte = 0;
      this.msgtxt = "";
    },
    closeMsg() {
      this.isMsg = false;
      this.byte = 0;
      this.msgtxt = "";
    }
  }
};
</script>

 <!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#main {
  margin-top: 101px;
}
.small-menu {
  display: none;
}
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
.selectCar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 186px;
}
.selectCar img {
  margin-top: 34px;
  margin-right: 140px;
}
.selectCar-title {
  font-size: 34px;
  font-weight: 500;
  margin-bottom: 46px;
}
.header-mobile {
  display: none;
  cursor: pointer;
}
#selectCar {
  width: 302px;
  border: 1px solid #e0e0e0;
  border-left: none;
  border-right: none;
  background-color: transparent;
  height: 44px;
  font-size: 16px;
  color: #828282;
  padding-left: 10px;
  background: url("../../public/dropdown.png") no-repeat 95% 50%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.main-board {
  display: flex;
  margin-top: 31px;
  justify-content: center;
}
.board-left {
  margin-right: 186px;
}
.info-title {
  color: #828282;
  font-size: 16px;
  margin-bottom: 19px;
}
.info-txt {
  height: 26.5px;
  width: 100%;
  min-width: 126px;
  padding-left: 52px;
  font-size: 18px;
  color: #333333;
}
.carinfo {
  display: inline-flex;
  justify-content: space-between;
  margin-bottom: 75px;
  align-items: center;
}
.carinfo-box {
  width: 32px;
  margin-left: 46px;
}
.carinfo-title {
  color: #828282;
  font-size: 16px;
}
.carinfo-txt {
  font-size: 36px;
  color: #333333;
  margin-bottom: 11px;
  text-align: center;
}
.carinfo-btn {
  width: 139px;
  height: 38px;
  border-radius: 19px;
}
.board-info {
  margin-bottom: 49px;
}
.powerbtn {
  cursor: pointer;
  margin-left: 92px;
}
.errmsg {
  color: #eb5757;
}
.modal {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}
.modalBox {
  background-color: #ffffff;
  box-shadow: 0px 11px 15px rgba(0, 0, 0, 0.2), 0px 9px 46px rgba(0, 0, 0, 0.12),
    0px 24px 38px rgba(0, 0, 0, 0.14);
}
.modalBox-msg {
  border-radius: 2px;
  width: 563px;
}
.msg-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.msg-title {
  font-size: 18px;
  margin-bottom: 26px;
  color: #333333;
  width: 463px;
  margin-top: 40px;
}
.msg-content textarea {
  border: none;
  width: 463px;
  height: 148px;
  background: #fafafa;
  box-shadow: inset -5px -5px 30px #ffffff, inset 4px 4px 8px #ededed;
  border-radius: 4px;
  resize: none;
  font-size: 18px;
  padding: 44px 35px 0 35px;
}
.msg-byte {
  color: #828282;
  margin-top: 10px;
  margin-bottom: 13px;
  width: 463px;
  text-align: end;
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
}
.setting-infos {
  display: flex;
  flex-direction: column;
  position: relative;
}
.errmsg-pos {
  position: absolute;
  bottom: 52px;
}
.setting-pwrule {
  color: #828282;
  line-height: 24px;
  margin-top: 30px;
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
}
.setting-infos input::placeholder {
  color: #bdbdbd;
}
.modalBox-submit {
  border-radius: 2px;
  width: 323px;
  /* height: 191px; */
}
.modalBox-submit * {
  font-size: 18px;
  font-weight: 500;
}
.modal-content {
  color: #333333;
  padding: 44px 30px 38px 58px;
}
.modalBtn {
  display: flex;
}
.modalBtn button {
  border: none;
  border-top: 0.5px solid #3bbae2;
  width: 50%;
  height: 61px;
  font-size: 18px;
}
.modal-txt {
  font-weight: normal;
}
.modal-txt span {
  font-weight: bold;
}
.modalBtn-cancel {
  background: #ffffff;
  border-radius: 0px 0px 0px 2px;
}
.modalBtn-save {
  background-color: #3bbae2;
  color: white;
  border-radius: 0px 0px 2px 0px;
}
.datetime {
  margin-top: 7px;
  margin-bottom: 31px;
  width: 319px;
  text-align: end;
}
.time {
  color: #333333;
  font-weight: 500;
  font-size: 36px;
}
.date {
  color: #333333;
  font-size: 18px;
}
#msgTo {
  border: 0.5px solid #828282;
  border-radius: 8px;
  width: 162px;
  height: 44px;
  padding-left: 16px;
  font-size: 16px;
  margin-left: 58px;
  background: url("../../public/chevron_right.png") no-repeat 90% 50%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.msgTo-btn {
  width: 82px;
  height: 38px;
  border-radius: 19px;
  margin-left: 24px;
}
.psng-cnt {
  display: flex;
  margin-left: 28px;
}
.psng-cnt button {
  border: none;
  background: #f4f4f4;
  width: 44px;
  height: 43px;
}
.psnginfo {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.psng-txt {
  font-size: 24px;
  display: flex;
  align-items: center;
}
.psng-txt span {
  font-weight: bold;
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 78px;
  margin-right: 2px;
}
.btn-minus {
  z-index: 1;
  padding-bottom: 8px;
  border-radius: 8px 0px 0px 8px;
}
.btn-plus {
  margin-left: -43px;
  left: 87px;
  z-index: 1;
  border-radius: 0 8px 8px 0;
}
.psng-cnt input {
  margin-left: -44px;
  font-weight: bold;
  font-size: 18px;
  background: #ffffff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: none;
  height: 43px;
  width: 131px;
  padding-left: 23px;
  text-align: center;
}
.btn-outline {
  border: 0.5px solid #828282;
  background-color: #ffffff;
  font-weight: 500;
  font-size: 14px;
}
.btn-outline:active {
  background: #3bbae2;
  border-color: #3bbae2;
  color: #ffffff;
}
.psng-save {
  margin-left: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
}
.info-btngroup {
  margin-left: 30px;
}
.togglebtn {
  width: 120px;
  height: 53px;
  border-radius: 8px;
  color: #333333;
  border: none;
  font-weight: 500;
  font-size: 18px;
  margin-left: 28px;
}

.btnActive {
  background: #3bbae2;
  color: #ffffff;
}

@media (max-width: 600px) {
  #main {
    margin-top: 76px;
  }
  #selectCar {
    width: 312px;
    text-align-last: center;
    background: url("../../public/dropdown.png") no-repeat 80% 50%;
  }
  .header-mobile {
    display: block;
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
  .small-menu-menus button:active {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .main-header {
    height: 56px;
    padding: 0 24px;
  }
  .header-right {
    display: none;
  }
  .header-title {
    font-size: 14px;
  }
  .selectCar {
    flex-direction: column;
    width: 312px;
    margin: 114px auto 0 auto;
    align-items: center;
    text-align: center;
  }
  .selectCar img {
    width: 234.29px;
    margin: 0 0 53.8px 0;
  }
  .selectCar-title {
    font-size: 28px;
    margin-bottom: 61px;
  }
  .modalBox-submit {
    width: 290px;
  }
  .modal-content {
    padding: 44px 0 37px 42px;
  }
  .modalBtn button {
    height: 60px;
  }
  .mobile-setting-modal {
    z-index: 2;
    color: #333333;
    font-size: 13px;
    background: #ffffff;
    position: fixed;
    top: 56px;
    width: 312px;
    height: 410px;
    right: 0;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.12),
      0px 0px 2px rgba(0, 0, 0, 0.14);
  }
  .mobile-setting-modal-title {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    font-weight: 500;
    font-size: 16px;
  }
  .mobile-setting-modal-title button {
    border: none;
    background-color: transparent;
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
  .mobile-loginInfo-content {
    width: 160px;
    margin: 20px auto;
  }
  .mobile-loginInfo-title {
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
  }
  .errmsg-pos {
    bottom: 113px;
  }
  /* Dash board */
  .main-board {
    flex-direction: column;
    margin: 0;
    padding-top: 20px;
    align-items: center;
  }
  .board-left {
    margin: 0;
    width: 312px;
  }
  .carinfo {
    width: 100%;
    align-items: start;
    margin-bottom: 19px;
  }
  .carinfo img {
    width: 134.5px;
  }
  .mobile-clock {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .mobile-clock .time {
    font-size: 28px;
  }
  .mobile-clock .date {
    font-size: 14px;
  }
  .board-right {
    width: 312px;
  }
  .mobile-firstContainer {
    display: flex;
    width: 311px;
    justify-content: space-between;
    margin-bottom: 26px;
  }
  .info-title {
    font-size: 13px;
    margin-bottom: 10px;
  }
  .mobile-carChange .info-title {
    margin-bottom: 0;
  }
  .carinfo-txt {
    font-weight: 500;
    font-size: 24px;
  }
  .carinfo-txt a {
    text-decoration-line: underline;
    font-size: 13px;
    color: #3bbae2;
    cursor: pointer;
  }
  .mobile-power {
    display: flex;
    align-items: center;
  }
  .mobile-power .info-title {
    margin: 0;
    margin-left: 7px;
  }
  .powerbtn {
    margin: 0;
  }
  .info-txt {
    padding: 0;
    margin: 0;
    font-size: 14px;
  }
  .board-info {
    margin-bottom: 15px;
  }
  .mobile-drivetime {
    display: flex;
    justify-content: space-between;
    margin-bottom: 23px;
  }
  #msgTo {
    width: 150px;
    height: 35px;
    font-size: 14px;
    margin-left: 0;
    margin-bottom: 6px;
  }
  .msgTo-btn {
    width: 122px;
    height: 35px;
    margin-left: 40px;
    color: #4f4f4f;
  }
  .psng-txt {
    font-size: 18px;
    margin-right: 22px;
  }
  .psng-txt span {
    font-size: 24px;
  }
  .psng-cnt button {
    width: 33px;
    height: 35px;
  }
  .psng-cnt input {
    width: 96px;
    height: 35px;
    margin-left: -33px;
    padding-left: 5px;
  }
  .btn-plus {
    margin-left: -30px;
    left: 63px;
  }
  .psng-save {
    margin-left: 18px;
    border-radius: 17.5px;
    width: 48px;
    height: 35px;
    color: #4f4f4f;
  }
  .info-btngroup {
    margin: 0;
    display: flex;
    justify-content: space-evenly;
    padding: 0 10px;
    /* width: 100%; */
  }
  .togglebtn {
    width: 86px;
    height: 35px;
    font-size: 14px;
    margin: 0;
  }
  .modalBox-msg {
    width: 312px;
  }
  .msg-title {
    width: 272px;
    font-size: 16px;
    margin-top: 23px;
    margin-bottom: 17px;
  }
  .msg-content textarea {
    width: 272px;
    height: 113px;
    font-size: 14px;
    padding: 20px;
  }
  .msg-byte {
    width: 272px;
  }
}
@media (min-width: 601px) and (max-width: 960px) {
  .selectCar {
    flex-direction: column;
    margin-top: 235px;
    align-items: center;
    text-align: center;
  }
  .selectCar img {
    height: 208px;
    margin: 0;
  }
  .selectCar-title {
    margin-top: 70px;
    margin-bottom: 68px;
  }
  .modalBox-setting {
    margin: 0 auto;
    top: 219px;
    left: 0;
    right: 0;
  }
  .modal-back {
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.3);
  }
  .main-board {
    flex-direction: column;
    align-items: center;
  }
  .board-left {
    margin: 0;
    width: 640px;
  }
  .carinfo {
    width: 100%;
    display: grid;
    grid: auto auto auto auto;
  }
}
</style>