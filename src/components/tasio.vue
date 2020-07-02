<template>
  <div id="Tasio" :class="ver">
    {{status}}
    <div class="modal-back">
      <div v-if="status=='call'" class="modalBox tasio-alarm">
        <h1>타시오 요청 알림</h1>
        <div class="loc-container">
          <div class="loc-box">
            <div class="tasio-content-title">출발지</div>
            <h5 class="content-default">{{depart}}</h5>
            <div class="loc-txt">까지 예상 이동시간</div>
            <div class="content-default">4분</div>
          </div>
          <img src="@/assets/img/tasio_arrow.png" alt="arrow image" />
          <div class="loc-box">
            <div class="tasio-content-title">도착지</div>
            <h5 class="content-default">{{arrival}}</h5>
            <div class="loc-txt">까지 예상 이동시간</div>
            <div class="content-default">4분</div>
          </div>
        </div>
        <div class="info-container">
          <div class="info-box">
            <div class="tasio-content-title">탑승인원</div>
            <div class="content-default">{{psng}}</div>
          </div>
          <div class="info-box">
            <div class="tasio-content-title">요청시간</div>
            <div class="content-default">{{reqTime}}</div>
          </div>
          <div class="info-box">
            <div class="tasio-content-title">남은 배차 수락 시간</div>
            <div class="errmsg">{{remainTime}}</div>
          </div>
        </div>
        <button @click="update('start')">배차 수락하기</button>
      </div>

      <div v-if="status=='denied'" class="modalBox tasio-denied">
        <h1>타시오 요청 취소 알림</h1>
        <div class="denied-txt">
          <span class="bold">{{reqTime}}</span> 발생한
          <br />타시오 요청이
          <span class="errmsg">자동 취소</span>됐습니다.
        </div>
        <div class="denied-info-container">
          <div class="denied-loc-box">
            <div class="tasio-content-title">
              출발
              <span class="content-darkgray">{{depart}}</span>
            </div>

            <div class="tasio-content-title">
              도착
              <span class="content-darkgray">{{arrival}}</span>
            </div>
          </div>
          <div class="denied-psng-box">
            <div class="tasio-content-title">인원</div>
            <div class="content-darkgray">{{psng}}</div>
          </div>
        </div>
        <button @click="update(false)">확인</button>
      </div>
    </div>

    <!-- <div v-if="isSimple && !isDetail" class="tasio-simple-container">
      <h1>타시오 배차 정보</h1>
      <div>도착지로 이동중</div>
      <button @click="isDetail=true">자세히</button>
    </div>-->

    <!-- <div class="tasio-detail-container" v-if="isDetail && status">
      <div class="tasio-detail-header">
        <h1>타시오 배차 정보</h1>
        <div>출발지로 이동중</div>
      </div>
    </div>-->
  </div>
</template>
<script>
export default {
  name: "Tasio",
  props: ["ver", "tasioStatus"],
  data: () => ({
    isDetail: false,
    isSimple: false,
    remainTotal: 10,
    status: "",
    depart: "자율주행 테마파크",
    arrival: "고군산 탐방센터",
    psng: "3명",
    arrTime: "4분",
    moveTime: "8분",
    psngName: "홍길동",
    reqTime: "오후 1시 42분 32초"
  }),
  created() {
    this.status = this.tasioStatus;
    this.timer();
  },
  computed: {
    remainTime() {
      var min = Math.floor(this.remainTotal / 60);
      if (min) {
        var sec = this.remainTotal - min * 60;
        return min + "분 " + sec + "초";
      } else return this.remainTotal + "초";
    }
  },
  methods: {
    update(status) {
      console.log(status);
      this.status = status;
      this.$emit("newStatus", status);
    },
    timer() {
      this.startTimer = setInterval(() => {
        if (this.remainTotal <= 0) {
          this.timeStop();
          this.status = "denied";
        } else this.remainTotal--;
      }, 1000);
    },
    timeStop() {
      clearInterval(this.startTimer);
      this.remainTotal = 120;
    }
  }
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
.content-default {
  font-weight: 500;
  font-size: 18px;
  color: #333333;
}
.content-darkgray {
  font-weight: 500;
  font-size: 18px;
  color: #4f4f4f;
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
.denied-txt {
  text-align: center;
  font-size: 18px;
  padding: 24px 0;
}
.denied-info-container {
  display: flex;
  justify-content: space-between;
  padding: 4px 15px;
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
.loc-container {
  margin-top: 17px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.loc-box {
  text-align: center;
}
.tasio-content-title {
  color: #bdbdbd;
  margin-bottom: 6px;
  font-size: 16px;
}

.loc-txt {
  font-size: 16px;
  color: #4f4f4f;
}

.info-container {
  margin-top: 21px;
  display: flex;
  justify-content: space-between;
  text-align: center;
}
.tasio-alarm button,
.tasio-denied button {
  margin-top: 22px;
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
.mobile #Tasio {
  padding-top: 112px;
}
.pad #tasio {
  padding-top: 136px;
}
.mobile .modal-back {
  top: -56px;
  z-index: 10;
}
.pad .modal-back {
  top: -68px;
  z-index: 10;
}
.modalBox-size .tasio-denied {
  width: 385px;
  height: 314px;
  padding: 0 20px;
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
.pad .tasio-simple-container {
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
}
.tasio-simple-container h1 {
  font-weight: 500;
  color: #333333;
}
.pad .tasio-simple-container h1 {
  font-size: 18px;
}
.mobile .tasio-simple-container h1 {
  font-size: 16px;
}
.tasio-simple-container div {
  font-weight: 500;
  color: #eb5757;
}
.pad .tasio-simple-container div {
  padding-top: 2px;
  font-size: 14px;
}
.mobile .tasio-simple-container div {
  padding-top: 3px;
  font-size: 13px;
}
.tasio-simple-container button {
  background: #4f4f4f;
  border-radius: 3px;
  font-weight: 500;
  color: #ffffff;
}
.pad .tasio-simple-container button {
  width: 74px;
  height: 34px;
  font-size: 16px;
}
.mobile .tasio-simple-container button {
  width: 53px;
  height: 24px;
  font-size: 13px;
}
</style>