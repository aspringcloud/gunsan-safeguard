<template>
  <div id="modal">
    <div
      class="modalBox modal-container"
      :style="{width:width, height:height}"
      :class="[title=='msg'? 'modal-msg':'modal-submit']"
    >
      <div class="modal-content">
        <slot name="content">
          <div v-if="selectedCar" class="modal-car">{{selectedCar.name}}</div>
          <div>
            <b>{{title}}</b> 변경하시겠습니까?
          </div>
        </slot>
      </div>
      <div class="modal-footer">
        <slot name="btn">
          <button class="text-blue" @click="closeModal()">취소</button>
          <button v-if="title=='msg'" @click="submitModal()" class="blue text-white">보내기</button>
          <button v-else @click="submitModal()" class="blue text-white">변경하기</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props: ["selectedCar", "title", "width", "height"],
  methods: {
    closeModal() {
      this.$emit("close");
    },
    submitModal() {
      this.$emit("submit");
    }
  }
};
</script>

<style scoped>
* {
  font-size: 18px;
}
#modal {
  position: fixed;
  top: -68px;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  margin: auto auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
.modal-container {
  display: flex;
  flex-direction: column;
}
.modal-submit {
  width: 323px;
  height: 191px;
}
.modal-msg {
  width: 563px;
  height: 333px;
  padding-top: 22px;
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
  .modal-submit {
    width: 290px;
  }
  .modal-footer button {
    font-size: 16px;
  }
  .modal-msg {
    width: 312px;
    height: 270px;
    padding-top: 10px;
  }
}
</style>