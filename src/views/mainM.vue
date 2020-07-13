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
      <template #content>
        <b>차량</b>
        <div>
          <b class="text-blue" style="font-size: 24px;">{{ selectedCar.name }}</b>
          을 선택합니까?
        </div>
      </template>
    </modal>

    <!-- submit 모달 -->
    <modal
      v-if="isSubmit"
      :selectedCar="selectedCar"
      :title="modalTitle"
      @close="isSubmit = false"
      @submit="submitModal_socket"
    ></modal>

    <!-- passed station modal -->
    <modal class="passedst-modal" v-if="stModal" width="250px" height="346px">
      <template #content>
        <h5>현재위치 변경</h5>
        <div class="passedst-select-container">
          <div
            class="passedst-select-list"
            :class="{'hide-st':stationInfo.site!=site.id,'active-station':nowSt==stationInfo}"
            @click="nowSt = stationInfo"
            v-for="(stationInfo, i) in stationList"
            :key="i"
          >
            {{
            stationInfo.site == site.id
            ? stationInfo.name + " (" + stationInfo.mid + ")"
            : ""
            }}
            <div v-if="nowSt==stationInfo" class="active-station"></div>
          </div>
        </div>
      </template>
      <template #btn>
        <button class="text-blue" style="height: 47px;" @click="stModal = false">취소</button>
        <button class="blue text-white" style="height: 47px;" @click="changeSt">선택</button>
      </template>
    </modal>

    <!-- request change station modal -->
    <modal v-if="reqStation" width="300px" height="240px">
      <template #content>
        <div class="reqst-container">
          <div class="reqst-txt">
            탑승객 수를 변경하기 전, 설정된 현재위치가 맞는지 다시 한번
            확인해주세요.
          </div>
          <div class="reqst-stInfo">
            <h5>현재 위치:</h5>
            <div
              v-if="selectedCar.station"
            >{{ selectedCar.station.name + " (" + selectedCar.station.mid + ")" }}</div>
            <div v-else>차량의 현재 위치를 선택하세요</div>
          </div>
        </div>
      </template>
      <template #btn>
        <button
          class="text-blue"
          style="height: 47px;"
          @click="
            isStation = true;
            reqStation = false;
          "
        >이상 없음</button>
        <button
          class="blue text-white"
          style="height: 47px;"
          @click="
            reqStation = false;
            stModal = true;
          "
        >현재위치 변경하기</button>
      </template>
    </modal>

    <!-- msg 모달 -->
    <modal v-if="isMsg" :selectedCar="selectedCar" title="msg" @close="closeMsg" @submit="sendMsg">
      <template #content>
        <div class="msg-title">
          <b>{{site.name}}</b> 통합관제 화면으로 전송
        </div>
        <textarea
          @keydown="getbyte"
          @keyup="getbyte"
          v-model="msgtxt"
          name="msgtxt"
          id="msgtxt"
          cols="30"
          rows="10"
        ></textarea>
        <div class="msg-byte">{{ msgbyte }}/200bytes</div>
      </template>
    </modal>
    <div class="msg-toast" :class="{'show-msg-toast':isMsgToast}">
      <h1>
        <span>SpringGo</span> 안전요원
      </h1>
      <div>메시지를 전송했습니다.</div>
    </div>

    <!-- oplog modal -->
    <!-- <oplog ver="mobile"></oplog> -->
    <div v-if="isOplog" id="oplog">
      <h1>운행기록</h1>
      <div class="oplog-row">
        <div class="oplog-box">
          <div class="oplog-label">시작시간</div>
          <input type="datetime-local" />
        </div>
        <div class="oplog-box">
          <div class="oplog-label">종료시간</div>
          <input type="datetime-local" />
        </div>
      </div>
      <div class="oplog-row">
        <div class="oplog-box">
          <div class="oplog-label">주요이슈</div>
          <select name id></select>
        </div>
        <div class="oplog-box">
          <div class="oplog-label">주요질문</div>
          <select name id></select>
        </div>
      </div>
      <div class="oplog-row">
        <div class="oplog-box two-box-container">
          <div class="oplog-sbox">
            <div class="oplog-label">주행거리</div>
            <input type="number" id="driveDist" /> km
          </div>
          <div class="oplog-sbox">
            <div class="oplog-label">탑승객 수</div>
            <input type="number" id="totalPsng" /> 명
          </div>
        </div>
        <div class="oplog-box two-box-container">
          <div class="oplog-sbox">
            <div class="oplog-label">날씨</div>
            <select name id="weather"></select>
          </div>
          <div class="oplog-sbox">
            <div class="oplog-label">온도</div>
            <input type="number" id="climate" /> ˚C
          </div>
        </div>
      </div>
      <div class="oplog-row">
        <div class="oplog-box">
          <div class="oplog-label">이벤트</div>
          <select name id></select>
        </div>
        <div class="oplog-box two-box-container">
          <div class="oplog-sbox">
            <div class="oplog-label">DTG size</div>
            <input type="number" id="DTG" /> KB
          </div>
          <div class="oplog-sbox">
            <div class="oplog-label">DVR size</div>
            <input type="number" id="DVR" /> GB
          </div>
        </div>
      </div>
      <div class="oplog-box">
        <div class="oplog-label">Task</div>
        <textarea name id cols="30" rows="10"></textarea>
      </div>
      <div class="oplog-btn-container">
        <button class="text-blue" @click="isOplog=false;">취소</button>
        <button class="text-white blue" @click="submitOplog">저장하기</button>
      </div>
    </div>

    <!-- 타시오 배차정보 -->
    <tasio v-if="tasioStatus" :tasioStatus="tasioStatus" ver="mobile" @newStatus="updateTasio"></tasio>
    <div
      @click="tasioStatus = 'call'"
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
          <option v-for="car in cars" :key="car.name" :value="car">{{ car.name }}</option>
        </select>
      </div>
    </div>
    <div id="dashboard" v-else>
      <div class="mainM-container">
        <div class="mainM-row1">
          <div class="clock-box box-default">
            <div class="date text-333">{{ today }}</div>
            <div class="time text-333 bold">{{ clock }}</div>
          </div>
          <div class="site-box">{{site.alias}} 통합관제</div>
          <button @click="isMsg=true"></button>
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
                @click="isOn ? powerOff() : powerOn()"
                :src="
                  isOn
                    ? require('@/assets/img/switchOn.png')
                    : require('@/assets/img/switchOff.png')
                "
                alt="차량 전원On"
              />
            </div>
          </div>
          <div class="box-default box-info">
            <!-- passed station -->
            <div class="box-title station-title">
              현재위치
              <img v-if="!selectedCar.station" src="@/assets/img/warnM.png" alt="warning" />
            </div>
            <div class="station-content">
              <div class="station-txt" v-if="selectedCar.station">
                {{ selectedCar.station.name }}
                <br />
                {{ selectedCar.station.mid }}
              </div>
              <div class="empty-station-txt" v-else>차량의 현재 위치를 선택하세요</div>
              <button @click="stModal = true">변경</button>
            </div>

            <div class="box-title">마지막 전원 ON</div>
            <div class="infobox-txt">{{ lastOn }}</div>
            <div class="box-title">운행시간</div>
            <div class="infobox-txt">{{ drivetime }}</div>
          </div>
        </div>
        <div class="mainM-row3">
          <div class="box-default">
            <div class="box-title">탑승객 수</div>
            <div class="text-333">
              <span>{{ psng }}</span>
              명
            </div>
            <div class="psng-form">
              <select name="psngForm" id="psngForm" v-model="psngTemp">
                <option v-for="i in 15" :key="i" :value="i">{{ i }}</option>
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
                :class="{ 'btn-toggle-active': stopOpt == '출발' }"
              >출발</button>
              <button
                @click="pickOpt('도착')"
                class="btn-toggle"
                :class="{ 'btn-toggle-active': stopOpt == '도착' }"
              >도착</button>
            </div>
            <div class="stop-div">
              <div class="box-title">정지사유</div>
              <select v-model="stopOpt" name="stopReason" id="stopReason">
                <option value>선택하세요</option>
                <option v-for="(opt, i) in stopOptList" :key="i" :value="opt">
                  {{
                  opt
                  }}
                </option>
              </select>
            </div>
          </div>
          <input
            :disabled="!(stopOpt == '오류' || stopOpt == '기타')"
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
                  :class="[stopSMsg ? 'text-blue' : 'errmsg']"
                  v-if="stopEMsg || stopSMsg"
                >{{ stopEMsg }}{{ stopSMsg }}</div>
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
// import Oplog from "@/components/oplog";
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
  background: #ffffff;
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
  background: #ffffff;
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
.empty-station-txt {
  font-size: 13px;
  width: 101px;
}
.stmodal-btn {
  height: 47px;
}
.passedst-modal h5 {
  font-size: 16px;
  height: 39px;
  line-height: 39px;
}
.passedst-select-container {
  height: 230px;
}
.passedst-select-list {
  width: 230px;
  font-size: 14px;
}
.reqst-container {
  display: flex;
  flex-direction: column;
  height: 140px;
  justify-content: space-between;
  align-items: center;
}
.reqst-txt {
  font-size: 14px;
  text-align: center;
  line-height: 23px;
  width: 150px;
}
.reqst-stInfo h5 {
  font-weight: 500;
  font-size: 14px;
  text-align: center;
  line-height: 22px;
}
.reqst-stInfo div {
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
}
.site-box {
  width: 110px;
}
.msg-title {
  font-size: 16px;
}
.msg-title b {
  font-size: 16px;
}
#msgtxt {
  margin-top: 17px;
  width: 272px;
  height: 113px;
  font-size: 14px;
  padding: 20px;
}
.msg-byte {
  width: 272px;
}
.msg-toast {
  top: 200px;
  left: calc(50vw - 117px);
  width: 234px;
  height: 122px;
}
.msg-toast h1 {
  height: 32px;
  line-height: 32px;
}
.msg-toast div {
  font-size: 14px;
}
#oplog {
  position: fixed;
  width: 348px;
  height: calc(100vh - 60px);
  top: 45px;
  left: calc(50vw - 176px);
  padding: 13px 58px 0 48px;
}
.oplog-box {
  margin-top: 10px;
  width: 100%;
}
#oplog textarea {
  height: 128px;
}
.oplog-btn-container {
  margin-top: 15px;
  margin-left: -48px;
  width: 343px;
}
.oplog-btn-container button {
  height: 47px;
}
</style>
