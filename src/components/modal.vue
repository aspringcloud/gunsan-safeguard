<template>
  <div id="modal">
    <div
      class="modalBox modal-container"
      :style="{width:width, height:height}"
    >
      <div class="modal-content">
        <slot name="content">
          <div>내용을 입력하세요</div>
        </slot>
      </div>
      <div class="modal-footer">
        <slot name="btn">
          <button class="btn-white btn-w50" @click="closeModal()">취소</button>
          <button class="btn-blue btn-w50" @click="submitModal()" >확인</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props: ["width", "height"],
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
  background: rgba(0, 0, 0, 0.25);
  position: fixed;
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
  position: relative;
  width: 323px;
  height: 191px;

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
  height: 60px;
  font-weight: 500;
}
.btn-blue {
  color: #FFFFFF;
  background-color:  #3bbae2;
}
.btn-white {
  color: #3bbae2;
}
.btn-w100 {
  width: 100%;
}
.btn-w50{
  width: 50%;
}
</style>