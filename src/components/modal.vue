<template>
  <div id="modal" :class="[title=='msg'? 'modal-msg':'modal-submit']">
    <div class="modal-content">
      <slot>
        <div class="modal-car">{{selectedCar.name}}</div>
        <div>
          <b>{{title}}</b> 변경하시겠습니까?
        </div>
      </slot>
    </div>
    <div class="modal-footer">
      <button class="text-blue" @click="closeModal()">취소</button>
      <button v-if="title=='msg'" class="blue text-white">보내기</button>
      <button v-else class="blue text-white">변경하기</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props: ["selectedCar", "title"],
  methods: {
    closeModal() {
      this.$emit("close");
    }
  }
};
</script>

<style scoped>
* {
  font-size: 18px;
}
#modal {
  background: #ffffff;
  box-shadow: 0px 11px 15px rgba(0, 0, 0, 0.2), 0px 9px 46px rgba(0, 0, 0, 0.12),
    0px 24px 38px rgba(0, 0, 0, 0.14);
  border-radius: 2px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}
.modal-submit {
  width: 323px;
  height: 191px;
}
.modal-msg {
  width: 563px;
  height: 333px;
}
.modal-content {
  color: #333333;
  margin: auto auto;
}
.modal-footer {
  width: 100%;
}
.modal-footer button {
  border: none;
  border-top: 0.5px solid #3bbae2;
  width: 50%;
  height: 60px;
  font-weight: 500;
}
.modal-car {
  font-weight: 500;
}
@media (max-width: 600px) {
  #modal {
    width: 290px;
  }
  .modal-footer button {
    font-size: 16px;
  }
}
</style>