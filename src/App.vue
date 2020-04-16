<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
  data: function() {
    return {
      name: ""
    };
  },
  methods: {
    logout: function() {
      alert("로그아웃");
    },
    setting: function() {
      alert("셋팅");
    }
  }
};
</script>

<style>
body {
  background-color: #fafafa;
  color: #4f4f4f;
  font-size: 14px;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: "Noto Sans KR", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.text-blue {
  color: #3bbae2;
}
button {
  cursor: pointer;
}
a {
  color: #82c0df;
}
</style>
