<template>
  <div id="Tasio" :class="ver">
    <div v-if="!isSimple" class="modal-back">
      <div v-if="status=='call'" class="modalBox tasio-alarm">
        <h1>배차 요청 알림</h1>
        <div class="loc-container">
          <div class="loc-box">
            <div class="tasio-content-title">출발지</div>
            <h5 class="content-default">{{tasioInfo.depart}}</h5>
            <div class="loc-txt">까지 예상 이동시간</div>
            <div class="content-default">{{tasioInfo.currentETA}}분</div>
          </div>
          <img src="@/assets/img/tasio_arrow.png" alt="arrow image" />
          <div class="loc-box">
            <div class="tasio-content-title">도착지</div>
            <h5 class="content-default">{{tasioInfo.arrival}}</h5>
            <div class="loc-txt">까지 예상 이동시간</div>
            <div class="content-default">{{tasioInfo.targetETA}}분</div>
          </div>
        </div>
        <div class="info-container">
          <div class="info-box">
            <div class="tasio-content-title">탑승인원</div>
            <div class="content-default">{{tasioInfo.psngCnt}}</div>
          </div>
          <div class="info-box">
            <div class="tasio-content-title">요청시간</div>
            <div class="content-default">{{tasioInfo.callTime}}</div>
          </div>
          <div class="info-box">
            <div class="tasio-content-title">남은 배차 수락 시간</div>
            <div class="content-red">{{remainTime}}</div>
          </div>
        </div>
        <button class="bottom-btn" @click="accept">배차 수락하기</button>
      </div>

      <div v-if="status=='denied' || status=='cancel'" class="modalBox tasio-denied">
        <h1>배차 요청 취소 알림</h1>
        <div class="denied-txt">
          <span class="bold">{{tasioInfo.callTime}}</span> 발생한
          <br />배차 요청이
          <span class="errmsg">{{status=='denied'?'자동 취소':'탑승자에 의해 취소'}}</span>됐습니다.
        </div>
        <div class="denied-info-container">
          <div class="denied-loc-box">
            <div class="tasio-content-title">
              출발
              <span class="content-default">{{tasioInfo.depart}}</span>
            </div>

            <div class="tasio-content-title">
              도착
              <span class="content-default">{{tasioInfo.arrival}}</span>
            </div>
          </div>
          <div class="denied-psng-box">
            <div class="tasio-content-title">인원</div>
            <div class="content-default">{{tasioInfo.psngCnt}}</div>
          </div>
        </div>
        <button class="bottom-btn" @click="update(false)">확인</button>
      </div>

      <div
        v-if="status != 'denied' && status != 'call' && status != 'cancel'"
        class="modalBox tasio-moving"
      >
        <button class="black-btn" @click="isSimple = true">최소화</button>
        <div class="tasio-moving-title">
          <h1>배차 정보</h1>
          <div>{{statusTxt}}</div>
        </div>
        <div class="moving-loc-container">
          <div class="moving-loc-box">
            <div class="moving-loc-title">출발지</div>
            <div
              class="text-overflow-st"
              :class="[status=='go'? 'content-st-red':'content-st-default']"
            >{{tasioInfo.depart}}</div>
          </div>
          <img src="@/assets/img/tasio_arrow.png" alt="arrow image" />
          <div class="moving-loc-box">
            <div class="moving-loc-title">도착지</div>
            <div
              class="text-overflow-st"
              :class="[status=='toEnd'? 'content-st-red':'content-st-default']"
            >{{tasioInfo.arrival}}</div>
          </div>
        </div>
        <div class="moving-rows" :class="[status=='go'?'moving-rows2':'moving-rows3']">
          <div class="moving-grid moving-grid-first">
            <div class="tasio-content-title">
              탑승인원
              <span
                :class="[status=='wait'? 'content-red':'content-default']"
              >{{tasioInfo.psngCnt}}</span>
            </div>
          </div>
          <div class="moving-grid moving-grid-first">
            <div class="tasio-content-title name-box">
              탑승자 이름
              <div
                class="text-overflow-name"
                :class="[status=='wait'? 'content-red':'content-default']"
              >{{tasioInfo.psngName}}</div>
            </div>
          </div>
          <div class="moving-grid">
            <div class="tasio-content-title justify-center">요청시간</div>
            <div class="content-default justify-center">{{tasioInfo.callTime}}</div>
          </div>

          <div class="moving-grid">
            <div class="tasio-content-title justify-center">수락시간</div>
            <div class="content-default justify-center">{{acceptTime}}</div>
          </div>
          <div v-if="status!='go'" class="moving-grid">
            <div class="tasio-content-title justify-center">출발지 도착시간</div>
            <div class="content-default justify-center">{{arrivedTime}}</div>
          </div>
          <div v-if="status=='wait'" class="moving-grid">
            <div class="tasio-content-title justify-center">대기시간</div>
            <div
              class="justify-center"
              :class="[waitTime>=300 ? 'content-red': 'content-default']"
            >{{waitedTime}}</div>
          </div>
          <div v-if="status=='toEnd'" class="moving-grid">
            <div class="tasio-content-title justify-center">탑승객 탑승시간</div>
            <div class="content-default justify-center">{{rideTime}}</div>
          </div>
        </div>
        <div v-if="status != 'go'" class="moving-time-container"></div>
        <div v-if="status =='wait'" class="wait-btn-container">
          <button class="noride-btn" @click="noRide">탑승하지 않음</button>
          <button class="ride-btn" @click="isConfirm=true">{{detailBtnTxt}}</button>
        </div>
        <button v-else class="bottom-btn" @click="isConfirm=true">{{detailBtnTxt}}</button>
      </div>
    </div>

    <modal
      style="z-index:30; background:transparent;"
      v-if="isConfirm"
      :width="ver=='mobile'?'220px':'260px'"
      height="max-content"
    >
      <template #content>
        <div class="modal-content-p">
          <div
            class="modal-bold"
            v-if="status!='wait'"
          >{{status=='go'?tasioInfo.depart:tasioInfo.arrival}}</div>
          <div>{{modalTxt}}</div>
        </div>
      </template>
      <template #btn>
        <button class="text-blue modal-btn" @click="isConfirm=false">취소</button>
        <button
          @click="toNextStatus"
          class="blue text-white modal-btn"
        >{{status=="wait"? '탑승':'도착'}}</button>
      </template>
    </modal>

    <div v-if="isSimple" class="tasio-simple-container">
      <h1>배차 정보</h1>
      <div>{{statusTxt}}</div>
      <button class="black-btn" @click="isSimple = false">자세히</button>
    </div>
  </div>
</template>
<script>
import Modal from "@/components/modal";

export default {
  name: "Tasio",
  components: { Modal },
  props: ["ver", "tasioStatus", "tasioInfo"],
  data: () => ({
    isSimple: false,
    remainTotal: 120,
    acceptTime: "",
    arrivedTime: "",
    rideTime: "",
    status: "",
    isConfirm: false,
    waitTime: 0,
    timeover: false,
  }),
  created() {
    this.tasioCall();
  },
  computed: {
    modalTxt() {
      if (this.status == "wait") return "탑승자가 탑승했습니까?";
      else return "에 도착했습니까?";
    },
    detailBtnTxt() {
      if (this.status == "go") return "출발지에 도착함";
      else if (this.status == "wait") return "탑승자 확인함";
      else if (this.status == "toEnd") return "도착지에 도착함";
      return "";
    },
    statusTxt() {
      if (this.status == "go") return "출발지로 이동중";
      else if (this.status == "wait") return "탑승 대기중";
      else if (this.status == "toEnd") return "도착지로 이동중";
      return "";
    },
    waitedTime() {
      var min = Math.floor(this.waitTime / 60);
      if (min) {
        var sec = this.waitTime - min * 60;
        return min + "분 " + sec + "초";
      } else return this.waitTime + "초";
    },
    remainTime() {
      var min = Math.floor(this.remainTotal / 60);
      if (min) {
        var sec = this.remainTotal - min * 60;
        return min + "분 " + sec + "초";
      } else return this.remainTotal + "초";
    },
  },
  watch: {
    tasioStatus: function () {
      if (this.tasioStatus == "cancel") {
        this.status = "cancel";
        this.timeStop();
        this.destroySession();
        // this.update(false);
      } else if (this.tasioStatus == "call") {
        this.tasioCall();
      } else if (this.tasioStatus == "sentCancel") {
        this.destroySession();
        this.update(false);
      }
    },
  },
  methods: {
    tasioCall() {
      this.status = this.$session.get("tasioStatus");
      if (this.status == "call") this.timer();
      if (this.$session.get("remainTotal"))
        this.remainTotal = this.$session.get("remainTotal");
      if (this.$session.get("waitTime"))
        this.waitTime = this.$session.get("waitTime");
      this.acceptTime = this.$session.get("tasioACT");
      this.arrivedTime = this.$session.get("tasioAT");
      this.rideTime = this.$session.get("tasioRT");
      console.log("received tasio!!", this.tasioInfo);
      console.log("tasiostatus", this.status);
    },
    toNextStatus() {
      if (this.status == "go") {
        this.arrivedTime = this.getTime(new Date());
        this.$session.set("tasioAT", this.arrivedTime);
        this.$session.set("tasioStatus", "wait");
        this.status = "wait";
        this.waiting();
      } else if (this.status == "wait") {
        this.stopWait();
        this.rideTime = this.getTime(new Date());
        this.$session.set("tasioRT", this.rideTime);
        this.update("toEnd");
      } else if (this.status == "toEnd") {
        this.update(false);
        this.destroySession();
      }
      this.isConfirm = false;
    },
    accept() {
      this.timeStop();
      this.acceptTime = this.getTime(new Date());
      this.$session.set("tasioACT", this.acceptTime);
      this.update("go");
    },
    getTime(date) {
      var h = date.getHours();
      var m = date.getMinutes() + "분 ";
      var s = date.getSeconds() + "초";
      if (h >= 12) {
        if (h > 12) h -= 12;
        h = "오후 " + h;
      } else h = "오전 " + h;
      return h + "시 " + m + s;
    },
    update(status) {
      this.status = status;
      this.$emit("newStatus", status);
    },
    waiting() {
      this.waitingTimer = setInterval(() => {
        this.waitTime++;
        this.$session.set("waitTime", this.waitTime + 1);
      }, 1000);
    },
    timer() {
      this.startTimer = setInterval(() => {
        if (this.remainTotal <= 0) {
          this.timeStop();
          this.update("denied");
          this.destroySession();
        } else {
          this.remainTotal--;
          this.$session.set("remainTotal", this.remainTotal - 1);
        }
      }, 1000);
    },
    noRide() {
      this.stopWait();
      this.update("noRide");
    },
    stopWait() {
      clearInterval(this.waitingTimer);
      this.$session.remove("waitTime");
      this.waitTime = 0;
    },
    timeStop() {
      clearInterval(this.startTimer);
      this.remainTotal = 120;
    },
    destroySession() {
      this.$session.remove("tasioAT");
      this.$session.remove("tasioRT");
      this.$session.remove("tasioACT");
      this.$session.remove("tasioInfo");
      this.$session.remove("tasioStatus");
      this.$session.remove("remainTotal");
    },
  },
};
</script>
<style scoped>
.modal-back {
  display: flex;
  justify-content: center;
  align-items: center;
}
.tasio-alarm {
  width: 424px;
  height: 338px;
  padding: 0 20px;
  position: relative;
}
.mobile .tasio-alarm {
  width: 322px;
  height: 261px;
  padding: 0 14px;
}
.justify-center {
  justify-content: center;
}
.tasio-content-title {
  color: #bdbdbd;
  display: flex;
  align-items: baseline;
  margin-bottom: 6px;
  font-size: 16px;
}
.mobile .tasio-content-title {
  font-size: 13px;
}
.content-default {
  font-weight: 500;
  font-size: 18px;
  color: #333333;
}
.content-st-default {
  font-weight: 500;
  font-size: 16px;
  color: #333333;
}
.text-overflow-st {
  width: 144px;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}
.mobile .text-overflow-st {
  width: 112px;
}
.name-box {
  justify-content: space-between;
}
.text-overflow-name {
  display: inline-block;
  width: 83px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.mobile .text-overflow-name {
  width: 65px;
}
.mobile .content-default {
  font-size: 14px;
}
.mobile .content-st-default {
  font-size: 12px;
}
.content-red {
  font-weight: 500;
  font-size: 18px;
  color: #eb5757;
}
.content-st-red {
  font-weight: 500;
  font-size: 16px;
  color: #eb5757;
}
.mobile .content-red {
  font-size: 14px;
}
.mobile .content-st-red {
  font-size: 12px;
}
.denied-loc-box span {
  margin-left: 10px;
}
.tasio-denied {
  width: 385px;
  height: 314px;
  padding: 0 20px;
  position: relative;
}
.mobile .tasio-denied {
  width: 290px;
  height: 253px;
  padding: 0 13px;
}
.denied-txt {
  text-align: center;
  font-size: 18px;
  padding: 24px 0;
}
.mobile .denied-txt {
  font-size: 16px;
  padding: 25px 0;
}
.denied-info-container {
  display: flex;
  justify-content: space-between;
  padding: 4px 15px;
}
.mobile .denied-info-container {
  padding: 0 14px;
}
.tasio-alarm h1,
.tasio-denied h1 {
  font-weight: 500;
  font-size: 18px;
  color: #333333;
  height: 52px;
  line-height: 52px;
  border-bottom: 0.5px solid #e0e0e0;
}
.mobile .tasio-alarm h1,
.mobile .tasio-denied h1 {
  font-size: 16px;
  line-height: 39px;
  height: 39px;
}
.loc-container {
  margin-top: 17px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mobile .loc-container {
  margin-top: 7px;
  padding: 0 15px;
}
.loc-box {
  text-align: center;
}
.loc-txt {
  font-size: 16px;
  color: #4f4f4f;
}
.mobile .loc-txt {
  font-size: 13px;
  color: #bdbdbd;
}
.mobile img {
  height: 12px;
}

.info-container {
  margin-top: 21px;
  display: flex;
  justify-content: space-between;
  text-align: center;
}
.wait-btn-container {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  height: 60px;
  display: flex;
}
.noride-btn {
  width: 50%;
  font-size: 18px;
  line-height: 27px;
  color: #333333;
  border-top: 0.5px solid #3bbae2;
}
.ride-btn {
  width: 50%;
  font-size: 18px;
  line-height: 27px;
  background: #3bbae2;
  color: #ffffff;
}
.bottom-btn {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  background: #3bbae2;
  color: #ffffff;
  font-weight: 500;
  font-size: 18px;
}
.mobile .bottom-btn {
  font-size: 16px;
  height: 47px;
}
.mobile #Tasio {
  padding-top: 112px;
}
.pad #tasio {
  padding-top: 136px;
}
.mobile .modal-back {
  z-index: 25;
}
.pad .modal-back {
  z-index: 25;
}
.tasio-simple-container {
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  background: #ffffff;
  border-radius: 2px;
  box-shadow: 0px 11px 15px rgba(0, 0, 0, 0.2), 0px 9px 46px rgba(0, 0, 0, 0.12),
    0px 24px 38px rgba(0, 0, 0, 0.14);
}
.tasio-simple-container {
  padding: 8px 14px 8px 20px;
  width: 344px;
  height: 50px;
}
.verti .tasio-simple-container {
  top: 80px;
  left: 36px;
}
.hori .tasio-simple-container {
  top: 98px;
  left: 289px;
}
.mobile .tasio-simple-container {
  padding: 8px 12px 8px 15px;
  width: 291px;
  height: 40px;
  top: 60px;
  left: 25px;
}
.tasio-simple-container h1 {
  font-weight: 500;
  color: #333333;
  font-size: 18px;
}
.mobile .tasio-simple-container h1 {
  font-size: 16px;
}
.tasio-simple-container div {
  font-weight: 500;
  color: #eb5757;
  padding-top: 2px;
  font-size: 14px;
}

.mobile .tasio-simple-container div {
  padding-top: 3px;
  font-size: 13px;
}
.black-btn {
  background: #4f4f4f;
  border-radius: 3px;
  font-weight: 500;
  color: #ffffff;
  width: 74px;
  height: 34px;
  font-size: 16px;
}
.mobile .black-btn {
  width: 53px;
  height: 24px;
  font-size: 13px;
}

/* 디테일 박스  */
.tasio-moving {
  width: 370px;
  position: relative;
  padding: 13px 20px;
}
.mobile .tasio-moving {
  width: 302px;
  padding: 7px 10px 0 10px;
}
.tasio-moving .black-btn {
  position: absolute;
  top: -20px;
  right: -37px;
}
.mobile .tasio-moving .black-btn {
  top: -7px;
  right: -7px;
}
.tasio-moving-title {
  display: flex;
  justify-content: space-between;
}
.mobile .tasio-moving-title {
  justify-content: start;
  align-items: baseline;
}
.tasio-moving-title h1 {
  font-weight: 500;
  font-size: 18px;
  color: #333333;
}
.mobile .tasio-moving-title h1 {
  font-size: 16px;
  padding-left: 3px;
}
.tasio-moving-title div {
  font-weight: 500;
  font-size: 14px;
  color: #eb5757;
}
.mobile .tasio-moving-title div {
  font-size: 13px;
  margin-left: 10px;
}
.moving-loc-container {
  width: 340px;
  height: 74px;
  margin-top: 13px;
  margin-left: -5px;
  background: #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 11px 3px;
}
.mobile .moving-loc-container {
  margin-top: 8px;
  margin-left: 0;
  width: 282px;
  height: 57px;
  padding: 7px 3px;
}
.moving-loc-container img {
  margin-top: 4px;
}
.moving-loc-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.moving-loc-title {
  margin-bottom: 3px;
  font-weight: 500;
  font-size: 14px;
  color: #ffffff;
}
.mobile .moving-loc-title {
  font-size: 13px;
  margin-bottom: 1px;
}
.moving-rows {
  margin-top: 6px;
  display: grid;
  grid-template-columns: 165px 165px;
}
.mobile .moving-rows .tasio-content-title {
  margin: 0;
}
.mobile .moving-rows {
  padding: 1px 3px 9px 3px;
  grid-template-columns: 138px 138px;
}
.moving-rows2 {
  grid-template-rows: 44px 77px 60px;
}
.mobile .moving-rows2 {
  grid-template-rows: 35px 52px 47px;
}
.moving-rows3 {
  grid-template-rows: 44px 77px 77px 60px;
}
.mobile .moving-rows3 {
  grid-template-rows: 35px 52px 52px 47px;
}
.tasio-content-title span {
  margin-left: 10px;
}
.moving-grid {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-top: 0.5px solid #e0e0e0;
}
.mobile .moving-grid {
  border: none;
}
.moving-grid-first {
  border: none;
}
.modal-content-p {
  padding: 37px 0;
}
.mobile .modal-content-p {
  padding: 27px 0;
}
.modal-bold {
  font-weight: 500;
  font-size: 18px;
  color: #333333;
}
.mobile .modal-btn {
  height: 47px;
}
</style>


