<template>
  <div id="resetpw" class="login">
    <a class="btn-back" @click="$router.push({ name: 'Login' })"></a>
    <div>
      <div class="text-blue resetpw-title1">SpringGo</div>
      <div class="text-blue resetpw-title2">비밀번호 재설정</div>
    </div>
    <div class="resetpw-txt text-gray2">
      임시비밀번호 발급을 원하시면<br />
      bcchoi@aspringcloud.com 으로<br />
      이메일 아이디, 이름을 보내주시기 바랍니다.
    </div>
    <div class="copyright">Copyright ⓒ GUNSANCITY. All right reserved</div>
  </div>
</template>
<script>
export default {
  name: "respetpw",
};
</script>
<style>
.btn-back {
  background-color: transparent;
  cursor: pointer;
  border: none;
  position: absolute;
  top: 11px;
  left: 37px;
  width: 27px;
  height: 27px;
  background-image: url("../assets/img/back.png");
}
.resetpw-title1 {
  font-weight: 800;
  font-size: 24px;
  font-family: "NanumSquareRound", sans-serif;
  margin-top: 72px;
  text-align: center;
}
.resetpw-title2 {
  font-weight: bold;
  margin-top: 20px;
  font-size: 30px;
  line-height: 30px;
}
.resetpw-txt {
  margin-top: 200px;
  font-weight: 500;
  font-size: 16px;
  line-height: 23px;
  text-align: center;
  color: #4f4f4f;
}
@media (max-width: 960px) {
  .btn-back {
    top: 60px;
    width: 25px;
    height: 25px;
  }
  .resetpw-title1 {
    margin-top: 89px;
  }
  .resetpw-txt {
    margin-top: 280px;
  }
}
</style>
