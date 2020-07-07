<template>
  <div id="mainM">
    <navbar-m :user="user"></navbar-m>
    <!-- 차량 선택 모달 -->
    <modal
      v-if="isDash"
      :selectedCar="selectedCar"
      :title="false"
      @close="resetCar"
      @submit="submitCar"
    >
      <slot>
        <b>차량</b>
        <div>
          <b class="text-blue" style="font-size: 24px;">
            {{
            selectedCar.name
            }}
          </b>
          을 선택합니까?
        </div>
      </slot>
    </modal>

    <!-- submit 모달 -->
    <modal
      v-if="isSubmit"
      :selectedCar="selectedCar"
      :title="modalTitle"
      @close="isSubmit = false"
      @submit="submitModal"
    ></modal>

    <!-- 타시오 배차정보 -->

    <tasio v-if="tasioStatus" :tasioStatus="tasioStatus" ver="mobile" @newStatus="updateTasio"></tasio>

    <div
      @click="tasioStatus='call'"
      v-if="!tasioStatus"
      style="position:absolute; top:100px; left: 50px; padding: 10px; z-index:1;"
      class="blue text-white bold"
    >T</div>

    <div class="selectCar-container" v-if="!dashboard">
      <img src="@/assets/img/shuttle.png" alt="shuttle image" />
      <div>
        <div class="selectCar-title">
          운행하시는 차량을
          <br />선택해주세요.
        </div>
        <select v-model="selectedCar" name="selectCar" id="selectCar">
          <option value selected>차량을 선택하세요.</option>
          <option v-for="car in cars" :key="car.name" :value="car">
            {{
            car.name
            }}
          </option>
        </select>
      </div>
    </div>
    <div id="dashboard" v-else>
      <div class="mainM-container">
        <div class="mainM-row1">
          <div class="clock-box box-default">
            <div class="date text-333">{{today}}</div>
            <div class="time text-333 bold">{{clock}}</div>
          </div>
          <select name="msgTo" id="msgTo">사이트 통합관제</select>
          <button></button>
        </div>
        <div class="mainM-row2">
          <div>
            <div class="box-default box-carselect">
              <div class="box-title">차량</div>
              <div class="carselect-txt">{{ selectedCar.name }}</div>
              <button @click="openSubmit('차량')">차량 변경하기</button>
            </div>
            <div class="box-default box-power">
              <div class="box-title">차량 전원</div>
              <img
                @click="isOn?powerOff():powerOn()"
                :src=" isOn? require('@/assets/img/switchOn.png'):require('@/assets/img/switchOff.png')"
                alt="차량 전원On"
              />
            </div>
          </div>
          <div class="box-default box-info">
            <div class="box-title">현재위치</div>
            <div class="infobox-txt">{{location}}</div>
            <div class="box-title">마지막 전원 ON</div>
            <div class="infobox-txt">{{lastOn}}</div>
            <div class="box-title">운행시간</div>
            <div class="infobox-txt">{{drivetime}}</div>
          </div>
        </div>
        <div class="mainM-row3">
          <div class="box-default">
            <div class="box-title">탑승객 수</div>
            <div class="text-333">
              <span>{{psng}}</span>
              명
            </div>
            <div class="psng-form">
              <select name="psngForm" id="psngForm" v-model="psngTemp">
                <option v-for="i in 15" :key="i" :value="i">{{i}}</option>
              </select>
              <button @click="savePsng()">저장</button>
            </div>
          </div>
          <div class="box-default box-toggle">
            <div class="box-title">주행모드</div>
            <button
              class="btn-toggle"
              :class="{ 'btn-toggle-active': isAuto == 1 }"
              @click="autoOn"
            >자동주행</button>
            <button
              class="btn-toggle"
              :class="{ 'btn-toggle-active': isAuto == 2 }"
              @click="autoOff"
            >수동주행</button>
          </div>
          <div class="box-default box-toggle">
            <div class="box-title">주차여부</div>
            <button class="btn-toggle" :class="{ 'btn-toggle-active': isPark }" @click="parkOn">예</button>
            <button
              class="btn-toggle"
              :class="{ 'btn-toggle-active': !isPark }"
              @click="parkOff"
            >아니오</button>
          </div>
        </div>
        <div class="box-default mainM-row4">
          <div class="mainM-row4-row1">
            <div class="stop-div">
              <div class="box-title">구분</div>
              <button
                @click="pickOpt('출발')"
                class="btn-toggle"
                :class="{'btn-toggle-active': stopOpt=='출발'}"
              >출발</button>
              <button
                @click="pickOpt('도착')"
                class="btn-toggle"
                :class="{'btn-toggle-active': stopOpt=='도착'}"
              >도착</button>
            </div>
            <div class="stop-div">
              <div class="box-title">정지사유</div>
              <select v-model="stopOpt" name="stopReason" id="stopReason">
                <option value>선택하세요</option>
                <option v-for="(opt,i) in stopOptList" :key="i" :value="opt">{{opt}}</option>
              </select>
            </div>
          </div>
          <input
            :disabled="!(stopOpt=='오류' || stopOpt=='기타')"
            type="text"
            name="stopMsg"
            id="stopMsg"
            v-model="stopReason"
          />
          <div class="mainM-row4-row3">
            <div>
              <transition name="fade">
                <div
                  class="err-box"
                  :class="[stopSMsg? 'text-blue':'errmsg']"
                  v-if="stopEMsg || stopSMsg"
                >{{stopEMsg}}{{stopSMsg}}</div>
              </transition>
            </div>
            <button class="stopBtn" :class="blockStopSubmit" @click="beforeSubmitStop()">전송하기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Tasio from "@/components/tasio";

import Modal from "@/components/modal";
import NavbarM from "@/components/Navbar-m";
import operateMixin from "@/views/operate.js";
import "@/views/main.css";

export default {
  mixins: [operateMixin],
  name: "MainM",
  components: { NavbarM, Modal, Tasio },
  data: () => ({})
};
</script>
<style scoped>
#mainM {
  margin-top: 56px;
}
.selectCar-container {
  flex-direction: column;
  margin-top: 235px;
  align-items: center;
  text-align: center;
}
.selectCar-container img {
  height: 208px;
  margin: 0;
}
.selectCar-title {
  font-size: 28px;
  margin-top: 70px;
  margin-bottom: 68px;
}
#dashboard {
  padding: 14px 24px;
}
.mainM-container {
  width: 312px;
  min-width: 312px;
  height: 612px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.mainM-row1 {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.mainM-row1 select {
  width: 110px;
  height: 34px;
  border: 0.5px solid #828282;
  border-radius: 3px;
  margin-left: 10px;
}
.mainM-row1 button {
  width: 32px;
  height: 32px;
  background-image: url("../assets/img/send.png");
  background-size: cover;
}
.mainM-row1 button:active {
  background-image: url("../assets/img/send_a.png");
}
.mainM-row2 {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.mainM-row3 {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.clock-box {
  width: 140px;
  height: 71px;
  padding-top: 10px;
}
.date {
  font-size: 14px;
  line-height: 21px;
}
.time {
  font-size: 28px;
  line-height: 30px;
}
.box-default {
  padding: 7px;
}
.box-title {
  font-size: 13px;
}
.box-carselect {
  padding: 7px 14px 15px 14px;
  width: 119px;
  height: 97px;
  border-radius: 20px;
  margin-bottom: 8px;
  align-items: flex-start;
}
.carselect-txt {
  font-weight: 500;
  font-size: 24px;
  align-self: center;
  color: #333333;
}
.box-carselect button {
  align-self: flex-end;
  font-weight: 500;
  text-decoration-line: underline;
  color: #3bbae2;
}
.box-power {
  padding-bottom: 14px;
}
.box-power img {
  height: 31px;
  margin-top: 8px;
}
.box-info {
  width: 183px;
  height: 184px;
  padding: 11px;
  align-items: start;
  justify-content: space-between;
}
.infobox-txt {
  margin-bottom: 5px;
  letter-spacing: -0.03em;
  word-break: keep-all;
  color: #333333;
}
.mainM-row3 span {
  font-weight: 500;
  font-size: 36px;
}
.psng-form {
  margin-top: 9px;
  margin-bottom: 8px;
}
.psng-form select {
  border: 0.5px solid #4f4f4f;
  border-radius: 3px;
  width: 56px;
  height: 34px;
  margin-right: 7px;
  font-size: 16px;
  color: #333333;
  padding-left: 5px;
}
.psng-form button {
  width: 42px;
  height: 34px;
  color: #4f4f4f;
  font-weight: 500;
  font-size: 14px;
  border: 0.5px solid #4f4f4f;
  border-radius: 3px;
}
.psng-form button:active {
  border: none;
  color: #ffffff;
  background: #2e92b0;
}
.box-toggle .box-title {
  margin-bottom: 9px;
}
.btn-toggle {
  margin-top: 7px;
  margin-bottom: 3px;
  border-radius: 17.5px;
  font-size: 14px;
  width: 76px;
  height: 35px;
}
.mainM-row4 {
  width: 312px;
  height: 188px;
  padding: 8px 15px;
}
.mainM-row4-row1 {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.stop-div .box-title {
  text-align: start;
}
.stop-div .btn-toggle {
  border-radius: 10px;
  width: 58px;
  height: 35px;
  margin-right: 10px;
}
.stop-div select {
  border-radius: 3px;
  border: 0.5px solid #828282;
  width: 126px;
  height: 34px;
  color: #333333;
  margin-top: 7px;
  padding-left: 12px;
}
.mainM-row4 input {
  width: 282px;
  height: 34px;
  border: 0.5px solid #bdbdbd;
  border-radius: 3px;
  margin-top: 19px;
  padding-left: 10px;
}
.mainM-row4 input:disabled {
  background: #f2f2f2;
  border-color: #bdbdbd;
}
.mainM-row4-row3 {
  width: 100%;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
.stopBtn {
  height: 34px;
  margin-top: 4px;
}
.err-box {
  padding-left: 10px;
  font-size: 14px;
}
</style>