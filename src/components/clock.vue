<template>
  <div id="clock">
    <div>{{time}}</div>
    <div>{{date}}</div>
  </div>
</template>

<script>
export default {
  name: "Clock",
  data: () => ({
    time: "",
    date: ""
  }),
  created() {
    setInterval(this.showClock, 1000);
    this.windowWidth = window.innerWidth;
  },
  methods: {
    showClock() {
      var now = new Date();
      var day = now.getDay();
      var week = ["일", "월", "화", "수", "목", "금", "토"];
      this.date =
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
      this.time = nowH + ":" + nowMin + ":" + nowSec;
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
    }
  }
};
</script>

