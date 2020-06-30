<template>
  <div id="Tasio" :class="ver">
    <div class="tasio-simple-container">
      <h1>타시오 배차 정보</h1>
      <div>도착지로 이동중</div>
      <button @click="isDetail=true">자세히</button>
    </div>
    <div class="tasio-detail-container" v-if="isDetail">gd</div>
  </div>
</template>
<script>
export default {
  name: "Tasio",
  props: ["ver"],
  data: () => ({
    isDetail: false
  }),
  methods: {}
};
</script>
<style scoped>
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