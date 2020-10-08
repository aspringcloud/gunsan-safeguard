<template>
  <div id="cancelCall" :class="ver">
    <div v-if="!isSimple" class="modal-back">
      <div class="modalBox tasio-denied">
        <h1>배차 요청 취소 알림</h1>
        <div class="denied-txt">
          <span class="bold">{{ call.when }}</span> 발생한 <br />배차 요청이
          <span class="errmsg">탑승자에 의해 취소</span>됐습니다.
        </div>
        <div class="denied-info-container">
          <div class="denied-loc-box">
            <div class="tasio-content-title">
              출발
              <span class="content-default">{{ call.departName }}</span>
            </div>

            <div class="tasio-content-title">
              도착
              <span class="content-default">{{ call.arrivalName }}</span>
            </div>
          </div>
          <div class="denied-psng-box">
            <div class="tasio-content-title">인원</div>
            <div class="content-default">{{ call.passenger }}</div>
          </div>
        </div>
        <button class="bottom-btn" @click="closeModal()">확인</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "cancelCall",
  props: ["ver", "call"],
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
  methods: {
    closeModal() {
      this.$emit("close");
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


