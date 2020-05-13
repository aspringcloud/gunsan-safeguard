<template>
  <div id="socketTest">
    <div>{{ status }}</div>
    <div>{{ message }}</div>
    <input type="number" v-model="num" />
    <button @click="sendMessage">보내기</button>
    <button @click="disconnect">XXX</button>
  </div>
</template>
<script>
export default {
  name: "socketTest",
  created() {
    // this.$socket.on((res) => {
    //   console.log("연결완료");
    //   this.message = res;
    // });
    this.socket = new WebSocket("ws://115.93.143.2:9103/ws/vehicle");
    this.socket.onopen = () => {
      this.status = "connected!";
    };
    this.socket.onmessage = ({ data }) => {
      this.message = data;
    };
  },
  data() {
    return {
      message: "!!!!",
      status: "nnn",
      num: 0,
    };
  },
  methods: {
    sendMessage() {
      //   this.$socket.emit("parking", {
      //     vehicle_id: 0,
      //     current_passenger: this.num,
      //   });
      this.socket.send(this.num);
      this.num = 0;
    },
    disconnect() {
      this.socket.close();
      this.status = false;
    },
  },
};
</script>
