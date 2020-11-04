<template>
  <div id="cancelCall">
    <div class="modal-back">
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
  name: "cancel-call",
  props: ["call"],
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
.tasio-denied {
  width: 385px;
  height: 314px;
  padding: 0 20px;
  position: relative;
}
.tasio-content-title {
  color: #bdbdbd;
  display: flex;
  align-items: baseline;
  margin-bottom: 6px;
  font-size: 16px;
}
.content-default {
  font-weight: 500;
  font-size: 18px;
  color: #333333;
}
.denied-loc-box span {
  margin-left: 10px;
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
.tasio-denied h1 {
  font-weight: 500;
  font-size: 18px;
  color: #333333;
  height: 52px;
  line-height: 52px;
  border-bottom: 0.5px solid #e0e0e0;
}
.loc-box {
  text-align: center;
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
</style>


