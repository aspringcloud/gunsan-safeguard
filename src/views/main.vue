<template>
  <div id="main">
    <navbar :user="user"></navbar>
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

    <!-- msg 모달 -->
    <modal
      v-if="isMsg"
      :selectedCar="selectedCar"
      title="msg"
      @close="isMsg = false"
      @submit="sendMsg"
    >
      <slot>
        <div class="msg-title">
          <b>사이트</b> 통합관제 화면으로 전송
        </div>
        <textarea
          @keydown="calcbyte()"
          @keyup="calcbyte"
          v-model="msgtxt"
          name="msgtxt"
          id="msgtxt"
          cols="30"
          rows="10"
        ></textarea>
        <div class="msg-byte">{{ byte }}/200bytes</div>
      </slot>
    </modal>

    <!-- 차량 선택 화면 -->
    <div class="selectCar-container" v-if="!dashboard">
      <img src="@/assets/img/shuttle.png" alt="shuttle image" />
      <div>
        <div class="selectCar-title">
          운행하시는 차량을
          <br />선택해주세요.
        </div>
        <select v-model="selectedCar" name="selectCar" id="selectCar">
          <option value>차량을 선택하세요.</option>
          <option v-for="car in cars" :key="car.name" :value="car">
            {{
            car.name
            }}
          </option>
        </select>
      </div>
    </div>

    <div id="dashboard" v-else>
      <div class="dashboard-container">
        <div class="clock-box box-default">
          <div class="date">{{today}}</div>
          <div class="time">{{clock}}</div>
        </div>
        <div class="dashboard-col1">
          <div class="dashboard-col1-row1">
            <div class="box-carselect box-default">
              <div class="box-title">차량</div>
              <img src="@/assets/img/shuttle2.png" alt="shuttle image" />
              <div class="carselect-txt">{{ selectedCar.name }}</div>
              <button @click="openSubmit('차량')">차량 변경하기</button>
            </div>
            <div class="dashboard-col1-row1-col2">
              <div class="box-power box-default">
                <div class="box-tohide"></div>
                <div class="box-title">차량 전원</div>
                <img @click="powerOff()" v-if="isOn" src="@/assets/img/switchOn.png" alt="차량 전원On" />
                <img @click="powerOn()" v-else src="@/assets/img/switchOff.png" alt="차량 전원Off" />
              </div>
              <div class="msgTo-container">
                <select name="msgTo" id="msgTo">사이트 통합관제</select>
                <button>메시지 보내기</button>
              </div>
            </div>
          </div>
          <div class="box-default infobox">
            <div class="infobx-col">
              <div class="box-title">현재위치</div>
              <div class="infobox-txt">{{location}}</div>
            </div>
            <div class="infobox-divider" />
            <div class="infobx-col">
              <div class="box-title">마지막 전원 ON</div>
              <div class="infobox-txt">{{lastOn}}</div>
            </div>
            <div class="infobox-divider" />
            <div class="infobx-col">
              <div class="box-title">운행시간</div>
              <div class="infobox-txt">{{drivetime}}</div>
            </div>
          </div>
          <div class="dashboard-col1-row3">
            <div class="box-default">
              <div class="box-title">탑승객 수</div>
              <div class="psng-txt">
                <span>{{psng}}</span>
                명
              </div>
              <div class="psng-form">
                <div class="psng-cnt">
                  <button class="btn-minus" @click="decrease">
                    <img src="@/assets/img/minus.png" alt="minus button" />
                  </button>
                  <input type="number" v-model="psngTemp" />
                  <button class="btn-plus" @click="increase">
                    <img src="@/assets/img/plus.png" alt="plus button" />
                  </button>
                </div>
                <button @click="savePsng()">저장</button>
              </div>
            </div>
            <div class="box-default">
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
            <div class="box-default">
              <div class="box-title">주차여부</div>
              <button class="btn-toggle" :class="{ 'btn-toggle-active': isPark }" @click="parkOn">예</button>
              <button
                class="btn-toggle"
                :class="{ 'btn-toggle-active': !isPark }"
                @click="parkOff"
              >아니오</button>
            </div>
          </div>
        </div>
        <div class="dashboard-col2">
          <div class="box-default stopMsg-container">
            <div class="dashboard-col2-row1">
              <div class="box-title">구분</div>
              <div class="dashboard-col2-btn-container">
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
            </div>
            <div class="dashboard-col2-row2">
              <div class="box-title">정지사유</div>
              <div class="dashboard-col2-btn-container">
                <button
                  v-for="(opt,i) in stopOptList"
                  :key="i"
                  @click="pickOpt(opt)"
                  class="btn-toggle"
                  :class="{'btn-toggle-active': stopOpt==opt}"
                >{{opt}}</button>
              </div>
            </div>
            <div class="dashboard-col2-row3">
              <textarea
                :disabled="!(stopOpt=='오류' || stopOpt=='기타')"
                name="stopMsg"
                id="stopMsg"
                v-model="stopReason"
                rows="2"
              ></textarea>
              <button class="stopBtn" :class="blockStopSubmit" @click="beforeSubmitStop()">전송하기</button>
              <div class="errmsg-container">
                <transition name="fade">
                  <div
                    :class="[stopSMsg? 'text-blue':'errmsg']"
                    v-if="stopEMsg || stopSMsg"
                  >{{stopEMsg}}{{stopSMsg}}</div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Modal from "@/components/modal";
import Navbar from "@/components/Navbar";
import "@/assets/css/mainStyle.css";
import operateMixin from "@/views/operate.js";
export default {
  mixins: [operateMixin],
  name: "Main",
  components: { Modal, Navbar }
};
</script>

<style scoped>
#main {
  margin-top: 68px;
}

.selectCar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 186px;
  margin-bottom: 100px;
}
.selectCar-container img {
  margin-top: 34px;
  margin-right: 140px;
}
.selectCar-title {
  font-size: 34px;
  font-weight: 500;
  margin-bottom: 46px;
}
#selectCar {
  width: 302px;
  border: 1px solid #e0e0e0;
  border-left: none;
  border-right: none;
  background-color: transparent;
  height: 44px;
  font-size: 16px;
  color: #828282;
  padding-left: 10px;
  background: url("../assets/img/dropdown.png") no-repeat 95% 50%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
#msgtxt {
  border: none;
  width: 463px;
  height: 148px;
  background: #fafafa;
  box-shadow: inset -5px -5px 30px #ffffff, inset 4px 4px 8px #ededed;
  border-radius: 4px;
  resize: none;
  font-size: 18px;
  padding: 44px 35px 0 35px;
  margin-top: 23px;
}
.msg-byte {
  color: #828282;
  font-size: 14px;
  width: 463px;
  text-align: end;
}
#dashboard {
  background: #d8f1f9;
  padding: 30px 36px;
  min-height: 100vh;
  width: 100%;
  min-width: max-content;
  height: 100%;
  display: flex;
  justify-content: center;
}
.dashboard-container {
  display: flex;
  justify-content: space-between;
  position: relative;
  width: 951px;
  min-width: 951px;
  height: 500px;
}
.dashboard-col1 {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.dashboard-col2 {
  display: flex;
  align-items: flex-end;
}
.dashboard-col1-row1 {
  display: flex;
  align-items: flex-end;
}
.dashboard-col1-row3 {
  display: flex;
  justify-content: space-between;
}
.dashboard-col1-row1-col2 {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.box-default {
  background: #ffffff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: 3px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stopMsg-container {
  width: 349px;
  height: 374px;
  align-items: flex-start;
  padding: 13px 17px;
}
.box-title {
  font-weight: 500;
  font-size: 14px;
  color: #bdbdbd;
  text-align: center;
}
.box-carselect .box-title {
  align-self: flex-start;
}
.box-carselect {
  border-radius: 20px 20px 0 20px;
  width: 182px;
  height: 205px;
  padding: 8px 23px;
}
.box-power {
  border-radius: 0 20px 20px 0;
  height: 79px;
  position: relative;
  padding-left: 21px;
  padding-right: 23px;
}
.box-tohide {
  position: absolute;
  z-index: 1;
  width: 5px;
  height: 79px;
  background-color: #ffffff;
  left: -4px;
  top: 0;
}
.clock-box {
  display: flex;
  flex-direction: column;
  padding-top: 8px;
  align-items: center;
  position: absolute;
  right: 0;
  top: 0;
  width: 182px;
  height: 86px;
  border-radius: 14px;
}
.time {
  font-weight: 500;
  font-size: 36px;
  line-height: 35px;
  color: #333333;
}
.date {
  font-size: 18px;
  letter-spacing: 0.02em;
  color: #333333;
}
.infobox {
  width: 568px;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
.infobox-divider {
  height: 50px;
  width: 0.5px;
  background-color: #3bbae2;
}
.infobox-txt {
  color: #333333;
  font-size: 16px;
  margin-top: 8px;
  height: 23px;
  min-width: 1px;
}
.box-carselect img {
  width: 126px;
  margin-top: 2px;
}
.carselect-txt {
  font-size: 36px;
  margin-top: -3px;
  color: #333333;
}
.box-carselect button {
  border-radius: 19px;
  width: 130px;
  height: 32px;
  background: #ffffff;
  border: 0.5px solid #828282;
  margin-top: -3px;
  color: #4f4f4f;
  font-size: 14px;
  font-weight: 500;
}
.box-carselect button:active {
  background: #2e92b0;
  color: white;
}
.box-power img {
  height: 31px;
  cursor: pointer;
}
.msgTo-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
#msgTo {
  background: #ffffff;
  border: 0.5px solid #828282;
  border-radius: 3px;
  width: 141px;
  height: 34px;
}
.msgTo-container button {
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  background: #ffffff;
  border: 0.5px solid #2e92b0;
  border-radius: 3px;
  height: 34px;
  font-weight: 500;
  font-size: 14px;
  color: #2e92b0;
}
.msgTo-container button:active {
  background: #2e92b0;
  color: #ffffff;
  border: none;
}
.psng-txt {
  font-size: 24px;
  color: #333333;
}
.psng-txt span {
  font-weight: bold;
  font-size: 48px;
}
.psng-form {
  display: flex;
  align-items: center;
  margin-top: 14px;
}
.psng-cnt {
  display: flex;
}
.psng-cnt button {
  border: none;
  background: #f4f4f4;
  width: 44px;
  height: 43px;
}
.btn-minus {
  z-index: 1;
  padding-bottom: 8px;
  border-radius: 8px 0px 0px 8px;
}
.btn-plus {
  margin-left: -43px;
  left: 87px;
  z-index: 1;
  border-radius: 0 8px 8px 0;
}
.psng-cnt input {
  margin-left: -44px;
  font-weight: bold;
  font-size: 18px;
  background: #ffffff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: none;
  height: 43px;
  width: 132px;
  padding-left: 20px;
  text-align: center;
}
.psng-form > button {
  margin-left: 16px;
  width: 63px;
  height: 34px;
  background: #ffffff;
  border: 0.5px solid #4f4f4f;
  border-radius: 3px;
  font-weight: 500;
  font-size: 14px;
  margin-top: 2px;
}
.psng-form > button:active,
.MsgBtn-container button:active {
  background: #2e92b0;
  color: #ffffff;
  border: none;
}
.btn-toggle {
  background: #e0e0e0;
  color: #333333;
  font-weight: 500;
  font-size: 16px;
}
.dashboard-col1-row3 .btn-toggle {
  border-radius: 24px;
  margin-top: 13px;
  width: 120px;
  height: 48px;
}
.btn-toggle-active {
  background: #3bbae2;
  color: #ffffff;
}
.dashboard-col2-btn-container {
  display: grid;
  grid-template-columns: max-content max-content max-content;
  column-gap: 20px;
  row-gap: 10px;
  margin-top: 5px;
  margin-bottom: 13px;
}
.dashboard-col2-btn-container .btn-toggle {
  border-radius: 10px;
  min-width: 74px;
  height: 42px;
  padding: 9px 17px;
}
.dashboard-col2 .box-title {
  text-align: start;
}
.dashboard-col2-row3 {
  position: relative;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  height: 117px;
  justify-content: space-between;
  align-items: flex-end;
}
.dashboard-col2 textarea {
  border-radius: 3px;
  border: 0.5px solid #828282;
  width: 315px;
  height: 60px;
  resize: none;
  padding: 10px 9px;
  font-size: 14px;
  color: #333333;
}
.dashboard-col2 textarea:disabled {
  background: #f2f2f2;
  border-color: #bdbdbd;
}
.errmsg-container {
  position: absolute;
  left: 9px;
  top: 72px;
}
.stopBtn {
  width: 80px;
  height: 42px;
  border: 0.5px solid #4f4f4f;
  border-radius: 3px;
  font-weight: 500;
  font-size: 14px;
  color: #4f4f4f;
}
.MsgBtn-container button:disabled {
  color: #bdbdbd;
  border-color: #bdbdbd;
}
.disabled-stopBtn {
  color: #bdbdbd;
  border-color: #bdbdbd;
}
.errmsg-container .fade-enter-active,
.errmsg-container .fade-leave-active {
  transition: opacity 0.5s;
}
.errmsg-container .fade-enter,
.errmsg-container .fade-leave-to {
  opacity: 0;
}
@media (min-width: 601px) and (max-width: 960px) {
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
    margin-top: 70px;
    margin-bottom: 68px;
  }
  .dashboard-container {
    flex-direction: column;
    width: 568px;
    min-width: 568px;
    height: 838px;
    align-items: center;
    position: relative;
  }
  .dashboard-col1 {
    min-height: 510px;
  }
  .dashboard-col2-btn-container {
    grid-template-columns: max-content max-content max-content max-content max-content;
  }
  .stopMsg-container {
    width: 568px;
    height: 308px;
  }
  .dashboard-col2 textarea {
    width: 444px;
    height: 42px;
    overflow: hidden;
  }
  .dashboard-col2-row3 {
    flex-direction: row;
    height: 44px;
    align-items: center;
    width: 539px;
    margin-top: 37px;
  }
  .errmsg-container {
    top: 52px;
  }
}
</style>
