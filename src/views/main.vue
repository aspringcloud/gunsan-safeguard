<template>
  <div id="main">
    <navbar :user="user"></navbar>

    <!-- OPLOG!!!!20.07.10 -->
    <div v-if="isOplog" class="modal-back oplog-back">
      <div id="oplog">
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
            <div class="oplog-sbox totalpsng-box">
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
              <input type="number" id="DTG" class="sbox-input-wide" /> KB
            </div>
            <div class="oplog-sbox">
              <div class="oplog-label">DVR size</div>
              <input type="number" id="DVR" class="sbox-input-wide" /> GB
            </div>
          </div>
        </div>
        <div class="oplog-row">
          <div class="textarea-box">
            <div class="oplog-label">Task</div>
            <textarea name id></textarea>
          </div>
        </div>
        <div class="oplog-btn-container">
          <button class="text-blue" @click="isOplog=false;">취소</button>
          <button class="text-white blue" @click="submitOplog">저장하기</button>
        </div>
      </div>
    </div>

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
          <b class="text-blue" style="font-size: 24px;">
            {{
            selectedCar.name
            }}
          </b>
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

    <div class="msg-toast" :class="{'show-msg-toast':isTasioToast}">
      <h1>
        <span>SpringGo</span> 안전요원
      </h1>
      <div>배차를 취소했습니다.</div>
    </div>

    <!-- passed station modal -->
    <modal class="passedst-modal" v-if="stModal" width="330px" height="391px">
      <template #content>
        <h5>현재위치 변경</h5>
        <div class="passedst-select-container">
          <div
            class="passedst-select-list"
            :class="{'hide-st':stationInfo.site != site.id,'active-station':nowSt==stationInfo}"
            @click="nowSt = stationInfo"
            v-for="(stationInfo, i) in stationList"
            :key="i"
          >
            {{
            stationInfo.site == site.id
            ? stationInfo.name + " (" + stationInfo.mid + ")"
            : ""
            }}
            <!-- {{stationInfo.name}}{{ stationInfo.site}} -->
            <div v-if="nowSt==stationInfo" class="active-station"></div>
          </div>
        </div>
      </template>
      <template #btn>
        <button class="text-blue" @click="stModal = false; nowSt = false;">취소</button>
        <button class="blue text-white" @click="changeSt">선택</button>
      </template>
    </modal>

    <!-- request change station modal -->
    <!-- <modal v-if="reqStation" width="442px" height="222px">
      <template #content>
        <div class="reqst-container">
          <div class="reqst-txt">
            탑승객 수를 변경하기 전,
            <br />설정된 현재위치가 맞는지 다시 한번 확인해주세요.
          </div>
          <div class="reqst-stInfo">
            현재 위치:
            <span
              v-if="selectedCar.station"
            >{{stationList[selectedCar.station-1].name + " (" + stationList[selectedCar.station-1].mid + ")" }}</span>
            <span v-else>차량의 현재 위치를 선택하세요</span>
          </div>
        </div>
      </template>
      <template #btn>
        <button class="text-blue" @click="sameStPsng">이상 없음</button>
        <button
          class="blue text-white"
          @click="
            reqStation = false;
            stModal = 1;
          "
        >현재위치 변경하기</button>
      </template>
    </modal> -->

    <!-- 타시오 배차정보 -->
    <tasio
      v-if="tasioStatus"
      :tasioStatus="tasioStatus"
      :ver="ver"
      @newStatus="updateTasio"
      :tasioInfo="tasioInfo"
    ></tasio>

    <!-- <div
      @click="getTasioCall"
      v-if="!tasioStatus"
      style="position:absolute; top:100px; left: 50px; padding: 10px; z-index:1;"
      class="blue text-white bold"
    >T</div>-->

    <!-- 차량 선택 화면 -->
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
      <div class="dashboard-container">
        <div class="clock-box box-default">
          <div class="date text-333">{{today}}</div>
          <div class="time text-333 bold">{{clock}}</div>
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
                <img
                  @click="isOn?powerOff():powerOn()"
                  height="31px"
                  :src=" isOn? require('@/assets/img/switchOn.png'):require('@/assets/img/switchOff.png')"
                  alt="차량 전원On"
                />
              </div>
              <div class="msgTo-container">
                <div class="site-box">{{site.alias}} 통합관제</div>
                <!-- <select name="msgTo" id="msgTo">사이트 통합관제</select> -->
                <button @click="isMsg=true">메시지 보내기</button>
              </div>
            </div>
          </div>
          <div class="box-default infobox">
            <div class="infobx-col">
              <div class="box-title station-title">
                현재위치
                <img v-if="!selectedCar.station" src="@/assets/img/warnP.png" alt="warning" />
              </div>
              <div class="station-content">
                <div class="station-txt" v-if="selectedCar.station && stationList">
                  <!-- {{ stationList[selectedCar.station-1].name }} -->
                  {{nowStation.name}}
                  <br />
                  {{nowStation.mid}}
                  <!-- {{ stationList[selectedCar.station-1].mid }} -->
                </div>
                <div class="empty-station-txt" v-else>차량의 현재 위치를 선택하세요</div>
                <button @click="stModal = true">변경</button>
              </div>
            </div>
            <div class="infobox-divider" />
            <div class="infobx-col">
              <div class="box-title">마지막 전원 OFF</div>
              <div class="infobox-txt">{{lastOff}}</div>
            </div>
            <div class="infobox-divider" />
            <div class="infobx-col">
              <div class="box-title">운행시간</div>
              <div class="infobox-txt">{{isOn?drivetime:''}}</div>
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
            <!-- <div class="dashboard-col2-row1">
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
            </div>-->
            <div class="dashboard-col2-row2">
              <div class="box-title">정지사유</div>
              <div class="dashboard-col2-gunsan-container">
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
import Tasio from "@/components/tasio";
import Modal from "@/components/modal";
import Navbar from "@/components/Navbar";
import operateMixin from "@/views/operate.js";
import "@/views/main.css";

export default {
  mixins: [operateMixin],
  name: "Main",
  components: { Modal, Navbar, Tasio },
};
</script>

<style scoped>
#main {
  padding-top: 68px;
  height: 100vh;
  min-height: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
}
#dashboard {
  height: 100%;
}
.selectCar-container img {
  margin-top: 34px;
  margin-right: 140px;
}
.selectCar-title {
  font-size: 34px;
  margin-bottom: 46px;
}

#msgtxt {
  width: 463px;
  height: 148px;
  font-size: 18px;
  padding: 44px 35px 0 35px;
  margin-top: 23px;
}
.msg-byte {
  width: 463px;
}
.box-default {
  padding: 12px;
}
.box-title {
  font-size: 14px;
}
.dashboard-container {
  display: flex;
  justify-content: space-between;
  position: relative;
  width: 952px;
  min-width: 952px;
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

.stopMsg-container {
  width: 349px;
  height: 374px;
  align-items: flex-start;
  padding: 13px 17px;
}
.box-title {
  font-size: 14px;
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
  position: absolute;
  right: 0;
  top: 0;
  width: 182px;
  height: 86px;
}
.time {
  font-size: 36px;
  line-height: 35px;
}
.date {
  font-size: 18px;
  letter-spacing: 0.02em;
}
.infobox {
  width: 568px;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding-left: 0;
  padding-right: 0;
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
.psng-form > button:active {
  background: #2e92b0;
  color: #ffffff;
  border: none;
}
.btn-toggle {
  font-size: 16px;
}
.dashboard-col1-row3 .btn-toggle {
  border-radius: 24px;
  margin-top: 13px;
  width: 120px;
  height: 48px;
}

.dashboard-col2-btn-container {
  display: grid;
  grid-template-columns: max-content max-content max-content;
  column-gap: 20px;
  row-gap: 10px;
  margin-top: 5px;
  margin-bottom: 13px;
}
.dashboard-col2-gunsan-container {
  margin-top: 17px;
  display: grid;
  grid-template-columns: repeat(3, max-content);
  column-gap: 15px;
  row-gap: 31px;
  margin-bottom: 26px;
}
.dashboard-col2-gunsan-container .btn-toggle {
  border-radius: 10px;
  width: 95px;
  height: 42px;
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
  height: 42px;
}
.site-box {
  width: 141px;
}
.station-title {
  justify-content: center;
  margin-bottom: 6px;
}
.empty-station-txt {
  font-size: 14px;
}
.station-content {
  align-items: center;
}
.station-content button {
  margin-left: 10px;
}
.passedst-modal h5 {
  font-size: 18px;
  height: 52px;
  line-height: 52px;
}
.passedst-select-container {
  height: 256px;
}
.passedst-select-list {
  width: 310px;
  font-size: 16px;
}
.reqst-stInfo {
  font-weight: 500;
  margin-top: 26px;
}
.msg-toast {
  top: 204px;
  left: calc(50vw - 148px);
  width: 296px;
  height: 124px;
}
.msg-toast h1 {
  height: 35px;
  line-height: 35px;
}
.msg-toast div {
  font-size: 18px;
}
#oplog {
  padding: 13px 20px 0 20px;
  width: 544px;
  top: 30px;
  left: calc(50vw - 272px);
  height: 559px;
}
#oplog textarea {
  height: 64px;
}
.oplog-row {
  margin-top: 16px;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
}
.totalpsng-box {
  margin-right: 47px;
}
.oplog-btn-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}
.oplog-btn-container button {
  height: 60px;
  font-size: 18px;
}
.oplog-label {
  margin-bottom: 6px;
}
@media (min-width: 601px) and (max-width: 900px) {
  #main {
    height: 970px;
  }
  #oplog {
    height: 633px;
    top: calc(50vh - 350px);
  }
  #oplog textarea {
    height: 128px;
  }
  .msg-toast {
    top: 345px;
  }
  .selectCar-container {
    flex-direction: column;
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
  /* gunsan */
  .dashboard-col2-gunsan-container {
    grid-template-columns: repeat(4, max-content);
    margin-top: 15px;
    row-gap: 20px;
    margin-bottom: 15px;
  }
  .dashboard-col2-gunsan-container .btn-toggle {
    width: 100px;
  }
}
</style>
