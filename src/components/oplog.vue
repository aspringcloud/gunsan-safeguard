<template>
  <div id="oplog" :class="ver">
    <modal :width="ver=='mobile'?'348px':'544px'" :height="ver=='mobile'?'788px':'633px'">
      <template #content>
        <input type="datetime-local" />
      </template>
      <template #btn></template>
    </modal>
  </div>
</template>

<script>
import Modal from "@/components/modal";

export default {
  name: "Oplog",
  props: ["ver"],
  components: { Modal }
};
</script>
<style scoped>
::-webkit-calendar-picker-indicator {
  background: url("../assets/img/calendar.png") no-repeat;
  cursor: pointer;
}
</style>