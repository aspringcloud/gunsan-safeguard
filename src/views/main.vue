<template>
  <div id="main">
    <navbar :user="user"></navbar>
    <!-- 차량 선택 모달 -->
    <modal
      v-if="isDash"
      :selectedCar="selectedCar"
      :title="false"
      @close="resetCar"
      @submit="submitCar"
    >
      <slot>
        <b>차량</b>
        <div>
          <b class="text-blue" style="font-size: 24px;">
            {{
            selectedCar.name
            }}
          </b>
          을 선택합니까?
        </div>
      </slot>
    </modal>

    <!-- 차량 선택 화면 -->
    <div class="selectCar" v-if="!dashboard">
      <img src="@/assets/img/shuttle.png" alt="shuttle image" />
      <div>
        <div class="selectCar-title">
          운행하시는 차량을
          <br />선택해주세요.
        </div>
        <select v-model="selectedCar" name="selectCar" id="selectCar">
          <option value>차량을 선택하세요.</option>
          <option v-for="car in cars" :key="car.name" :value="car">
            {{
            car.name
            }}
          </option>
        </select>
      </div>
    </div>

    <!-- submit 모달 -->
    <modal
      v-if="isSubmit"
      :selectedCar="selectedCar"
      :title="modalTitle"
      @close="isSubmit = false"
      @submit="submitModal"
    ></modal>

    <!-- msg 모달 -->
    <modal
      v-if="isMsg"
      :selectedCar="selectedCar"
      title="msg"
      @close="isMsg = false"
      @submit="sendMsg"
    >
      <slot>
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
        <div class="msg-byte">{{ byte }}/200bytes</div>
      </slot>
    </modal>
  </div>
</template>

<script>
import Modal from "@/components/modal";
import Navbar from "@/components/Navbar";
import "@/assets/css/mainStyle.css";

export default {
  name: "Main",
  components: { Modal, Navbar },
  data: () => ({
    dashboard: false,
    isDash: false,
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
    msgTo: "사이트 통합관제",
    centers: [{ name: "사이트 통합관제" }],
    drivetime: " ",
    byte: 0,
    today: "",
    clock: "",
    windowWidth: 0,
    psngTemp: 0
  }),
  beforeCreate() {
    if (!this.$session.exists()) {
      this.$router.push({ name: "Login" });
    }
  },
  created() {
    if (this.$session.exists()) {
      this.user = this.$session.get("user");
      this.$http
        .get(this.$api + "vehicles/", { headers: this.$headers })
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
      this.$http
        .get(this.$api + "vehicles/" + this.selectedCar.id, {
          headers: this.$headers
        })
        .then(res => {
          // console.log("초기값", res.data);
          this.psng = res.data.passenger;
          this.isOn = res.data.drive;
          this.isAuto = res.data.drive_mode;
          if (!this.psng) this.psng = 0;
          this.psngTemp = this.psng;
          this.isPark = res.data.isparked;
          if (res.data.lon && res.data.lat) {
            this.$http
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

      this.$http
        .get(this.$api + "oplogs/vehicle/" + this.selectedCar.id, {
          headers: this.$headers
        })
        .then(res => {
          var i = res.data.length;
          if (i) {
            var time = res.data[i - 1].time_start;
            console.log(time);
            time = time.split("-").join("/");
            time = time.replace("T", " ");
            time = time.replace("Z", "");
            time = time.replace("+09:00", "");
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

    openSubmit(v) {
      this.modalTitle = v;
      this.isSubmit = true;
    },
    submitModal() {
      if (this.modalTitle == "차량") {
        this.selectedCar = "";
        this.dashboard = false;
        this.isSubmit = false;
      } else if (this.modalTitle == "전원") {
        this.$http
          .patch(
            this.$api + "vehicles/" + this.selectedCar.id + "/",
            { drive: !this.isOn },
            { headers: this.$headers }
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
          this.$http
            .patch(
              this.$api + "vehicles/" + this.selectedCar.id + "/",
              { drive_mode: 2 },
              { headers: this.$headers }
            )
            .then(res => {
              this.isAuto = res.data.drive_mode;
            })
            .catch(err => {
              console.log(err);
              alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
            });
        } else if (this.isAuto == 2) {
          this.$http
            .patch(
              this.$api + "vehicles/" + this.selectedCar.id + "/",
              { drive_mode: 1 },
              { headers: this.$headers }
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
        this.$http
          .patch(
            this.$api + "vehicles/" + this.selectedCar.id + "/",
            { isparked: !this.isPark },
            { headers: this.$headers }
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
      this.$http
        .patch(
          this.$api + "vehicles/" + this.selectedCar.id + "/",
          { passenger: this.psngTemp },
          { headers: this.$headers }
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
      this.$http
        .post(
          this.$api + "event/message/",
          { vehicle_id: this.selectedCar.id, message: this.msgtxt },
          { headers: this.$headers }
        )
        .then(res => {
          alert("메세지가 전송되었습니다.");
          console.log(res);
        })
        .catch(err => {
          console.log(err);
          alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
        });
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

<style scoped>
#main {
  margin-top: 68px;
}
.selectCar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 186px;
  margin-bottom: 100px;
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
  background: url("../assets/img/dropdown.png") no-repeat 95% 50%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.dash-padding {
  padding: 0 93px 47px 93px;
}
.info-txt {
  height: 26.5px;
  width: 100%;
  min-width: 126px;
  padding-left: 52px;
  font-size: 18px;
  color: #333333;
}
.carinfo-txt {
  font-size: 36px;
  color: #333333;
  text-align: center;
}
.powerbtn {
  cursor: pointer;
  margin-left: 92px;
}
#msgtxt {
  border: none;
  width: 463px;
  height: 148px;
  background: #fafafa;
  box-shadow: inset -5px -5px 30px #ffffff, inset 4px 4px 8px #ededed;
  border-radius: 4px;
  resize: none;
  font-size: 18px;
  padding: 44px 35px 0 35px;
  margin-top: 23px;
}
.msg-byte {
  color: #828282;
  font-size: 14px;
  width: 463px;
  text-align: end;
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
  background: url("../assets/img/chevron_right.png") no-repeat 90% 50%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.msgTo-btn {
  width: 82px;
  height: 38px;
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
.psng-save {
  margin-left: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
}
.info-btngroup {
  margin: 19px 0 54px 0;
}
.togglebtn {
  width: 120px;
  height: 53px;
  border-radius: 8px;
  color: #333333;
  background-color: #e0e0e0;
  border: none;
  font-weight: 500;
  font-size: 18px;
  margin-left: 28px;
}

.btnActive {
  background: #3bbae2;
  color: #ffffff;
}
.lg-section1 {
  width: 326px;
  margin-right: 193px;
}
.lg-section2 {
  min-width: 312px;
  width: max-content;
}
.car-btn-size {
  width: 139px;
  height: 38px;
  margin-top: 11px;
}
.lg-container1 {
  margin-bottom: 75px;
}
.lg-container2 .info-txt {
  margin: 19px 0 49px 52px;
}
.msg-container {
  margin-top: 15px;
  margin-bottom: 39px;
}
.psng-container {
  align-items: center;
  margin-top: 25px;
  margin-bottom: 54px;
}
@media (max-width: 600px) {
  #main {
    margin-top: 76px;
  }
  #selectCar {
    width: 312px;
    text-align-last: center;
    background: url("../assets/img/dropdown.png") no-repeat 80% 50%;
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
    font-size: 13px;
  }
  .errmsg-pos {
    top: 195px;
  }
  .time {
    font-size: 28px;
  }
  .date {
    font-size: 14px;
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
  .powerbtn {
    margin: 0;
  }
  .info-txt {
    padding: 0;
    margin: 10px 0 15px 0;
    font-size: 14px;
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
    padding-left: 20px;
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
    margin: 12px 0 14px 0;
    display: flex;
    justify-content: space-evenly;
    padding: 0 10px;
  }
  .togglebtn {
    width: 86px;
    height: 35px;
    font-size: 14px;
    margin: 0;
  }
  .msg-title {
    font-size: 16px;
  }
  .msg-title b {
    font-size: 16px;
  }
  #msgtxt {
    margin-top: 17px;
    width: 272px;
    height: 113px;
    font-size: 14px;
    padding: 20px;
  }
  .msg-byte {
    width: 272px;
  }
  /* ------------------------------------- */
  .dash-padding {
    padding-left: 24px;
    padding-right: 24px;
  }
  .dash-shuttle-size {
    width: 134.5px;
  }
  .info-title-size {
    font-size: 13px;
  }
  .board-section2 {
    margin-bottom: 23px;
  }
  .msg-container {
    margin-top: 12px;
    margin-bottom: 15px;
  }
  .psng-container {
    display: flex;
    justify-content: flex-end;
    margin: 7px 0 0 0;
  }
  .board-section3 {
    margin-bottom: 18px;
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
  .msgTo-btn {
    width: 123px;
    height: 38px;
    border-radius: 19px;
  }
  .psng-save {
    width: 94px;
    height: 38px;
    border-radius: 19px;
  }
  .dash-padding {
    padding-left: 36px;
    padding-right: 36px;
  }
  .dash-shuttle-size {
    width: 180px;
  }
  .info-title-size {
    font-size: 16px;
  }
  .pad-col-width {
    width: 219px;
  }
  .car-btn-size {
    width: 148px;
    height: 38px;
    margin-left: 13px;
  }
  .powerbtn {
    margin-left: 16px;
    width: 101px;
  }
  .info-txt {
    font-size: 18px;
    margin-top: 9px;
    margin-bottom: 30px;
    padding-left: 15px;
  }
  .msgTo-btn {
    width: 123px;
    height: 38px;
    margin: 0;
  }
  .msg-container {
    display: flex;
    flex-direction: column;
    margin: 17px 0 0 15px;
  }
  .psng-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin: 15px 0 0 0;
  }
  #msgTo {
    margin: 0 0 20px 0;
  }
  .psng-save {
    margin: 20px 0 0 0;
  }
  .board-section1 {
    margin-top: 18px;
    margin-bottom: 35px;
    align-items: flex-end;
  }
  .board-section2 {
    margin-bottom: 30px;
  }
  .board-section3 {
    margin-bottom: 55px;
  }
  .info-btngroup {
    margin: 20px 0 30px 0;
    display: flex;
    justify-content: space-evenly;
  }
  .board-section4 {
    width: 80%;
    align-self: center;
  }
}
</style>
