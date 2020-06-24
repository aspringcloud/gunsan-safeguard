<template>
  <div id="app">
    <router-view v-if="!isMobile"></router-view>
    <router-view v-else name="mobile"></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
  data: () => ({
    isMobile: ""
  }),
  mounted() {
    this.onResize();
    window.addEventListener("resize", this.onResize);
  },
  methods: {
    onResize() {
      this.isMobile = window.innerWidth < 600;
    }
  },
  beforeDestroy() {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.onResize);
    }
  },
  watch: {}
};
</script>

