let operateMixin = {
  data: () => ({
    isLoading:true,
    callUidChain:{},
    callsArrivalInfo:{},
    calls:[],
    nowStation:{id:'',name:'', mid:'', lat:'',lon:'',site:''},
    isTasioToast: false,
    lastPing: false,
    tasioStatus: false,
    tasioInfo: false,
    isOplog: false,
    stationList: {},
    stModal: false,
    nowSt: false,
    site: {
      id: "",
      name: "",
      alias: "",
    },
    siteDict: {
      SIT001: "대구",
      SIT002: "세종",
      SIT003: "상암",
      SIT004: "군산",
      SIT005: "SNUT",
      SIT006: "규특",
      none: "NA",
    },
    dashboard: false,
    isDash: false,
    cars: [{
        id: 4,
        name: 1146,
      },
      {
        id: 5,
        name: 1147,
      },
      {
        id: 11,
        name: 6894,
      },
      {
        id: 12,
        name: 6895,
      },
    ],
    selectedCar: "",
    date: "",
    isOn: 1,
    isSubmit: false,
    lastOff: " ",
    lastOn: " ",
    location: "경기도 안성시 죽산면 죽산리 343-1",
    psng: 0,
    isAuto: 1,
    isPark: 1,
    isMsg: false,
    msgtxt: "",
    msgtxtL: 0,
    modalTitle: "",
    modalValue: "",
    msgTo: "사이트 통합관제",
    centers: [{
      name: "사이트 통합관제",
    }, ],
    drivetime: " ",
    msgbyte: 0,
    today: "",
    clock: "",
    windowWidth: 0,
    psngTemp: 0,
    stopSMsg: "",
    stopEMsg: "",
    stopOpt: "",
    stopReason: "",
    stopReasonL: 0,
    stopOptList: ["차", "사람", "환경요소", "오류", "기타"],
    ver: "",
    socket: false,
    status: false,
    socketMsg: "",
    isMsgToast: false,
  }),
  beforeCreate() {
    if (!this.$session.get("user")) {
      this.$router.push({
        name: "Login",
      });
    }
  },
  created() {
    this.connectSocket();
    if (this.$session.exists()) {
      this.user = this.$session.get("user");

      console.log("here", this.$session.get("user").info);

      this.$headers.authorization = "Basic " + this.$session.get("user").basic;
      this.getStationListGunsan();
      if (this.$session.get("selectedCar")) {
        this.selectedCar = this.$session.get("selectedCar");
        this.getStation(this.selectedCar.station)	
        console.log("nowstation", this.nowStation)
        this.dashboard = true;
        this.submitCar();
      }
      if (this.$session.get("site")) this.site = this.$session.get("site");
      if (this.$session.get("calls") && this.$session.get("calls").length) {
        this.calls = this.$session.get("calls");
        this.callUidChain = this.$session.get("callUidChain");
        this.callsArrivalInfo = this.$session.get("callsArrivalInfo");
      }
    }
    setInterval(this.showClock, 1000);
    this.windowWidth = window.innerWidth;
    if (this.windowWidth < 900) {
      this.ver = "pad ver";
    } else {
      this.ver = "pad hor";
    }
  },
  watch: {
    tasioStatus: function () {
      var msg = {
        who: "safeGuard",
        what: "EVENT",
        how: {
          type: "ondemand",
          vehicle_id: this.selectedCar.id,
          function: "go",
          uid: this.tasioInfo.uid,
          passenger: '명수'
        },
      };
      if (this.tasioStatus == "go") {
        this.$session.set("tasioStatus", "go");
        this.socket.send(JSON.stringify(msg));
        console.log("여기!!!go!!", msg);
      } else if (this.tasioStatus == "toEnd") {
        msg.how.function = "arrived";
        this.socket.send(JSON.stringify(msg));
        console.log(msg);
      } else if (this.tasioStatus == false) {
        this.tasioInfo = false;
      } else if (this.tasioStatus == "noRide") {
        msg.how.function = "cancel_call";
        this.socket.send(JSON.stringify(msg));
        this.isTasioToast = true;
        setTimeout(() => (this.isTasioToast = false), 2000);
        this.tasioStatus = "sentCancel";
        console.log("미탑승", msg);
      }
    },
    socketMsg: function () {
      console.log(this.socketMsg);
      if (
        this.socketMsg.how.type == "passenger" &&
        this.socketMsg.how.vehicle_id == this.selectedCar.id
      ) {
        var tpsng = this.socketMsg.how.current_passenger
        if(tpsng < 0 )tpsng = 0
        this.psng = tpsng;
        this.psngTemp = tpsng;
        this.isStation = false;
      }

      // 배차 받기 (200923 신규)
      if (
        this.isOn &&
        this.socketMsg.what == "EVENT" &&
        this.socketMsg.how.type == "ondemand" &&
        this.socketMsg.how.site_id == this.site.id
      ) {
        if (this.socketMsg.how.vehicle_id == this.selectedCar.id && this.socketMsg.how.function == "call") {
          this.convertCallInfo(this.socketMsg.how);
        } else if (this.socketMsg.how.function == "cancel_call") {
            this.calls.splice(this.callUidChain[this.socketMsg.how.uid], 1)
            this.$session.set("calls", this.calls);	
        }
      } else if (this.socketMsg.how.vehicle_id == this.selectedCar.id) {
        if (this.socketMsg.how.type == "passenger") {
          tpsng = this.socketMsg.how.current_passenger;
          if(tpsng < 0) tpsng = 0;
          this.psng = tpsng;
          this.psngTemp = tpsng;
          this.isStation = false;
        } else if (this.socketMsg.how.type == "drive")
          this.isAuto = this.socketMsg.how.value == "auto" ? 1 : 2;
        else if (this.socketMsg.how.type == "parking")
          this.isPark = this.socketMsg.how.value == "true" ? true : false;
        else if (this.socketMsg.how.type == "power"){
          if(this.socketMsg.how.value == "true"){
            this.isOn = true;
            this.lastOn = new Date()
            // this.calcDrivetime(new Date());
          }
          else this.isOn = false;
        }
      } else if (this.socketMsg.how.type == "door" && this.socketMsg.how.value == "false") {
        this.getNewSt()
      } else if (this.socketMsg.what == "PING") {
        console.log(
          new Date(this.socketMsg.when * 1000).getTime() -
          new Date(this.lastPing).getTime()
        );
        this.lastPing = new Date(this.socketMsg.when * 1000);
        console.log("ping!", new Date(this.lastPing));
      }
    },
    stopReason: function () {
      var L = this.stopReason.length;
      if (L != this.stopReasonL) {
        this.stopReason = this.calcbyte(100, this.stopReason);
        this.stopReasonL = this.stopReason.length;
      }
    },
    clock: function () {
      if (this.drivetime != " ") {
        this.calcDrivetime(this.lastOn);
      }
    },
    selectedCar: function () {
      this.getStation(this.selectedCar.station)	
      if (this.selectedCar && !this.dashboard) {	
      this.isDash = true;	
     }	
      if (!this.selectedCar.station) this.selectedCar.station = false;	
      
    },
    windowWidth: function () {
      if (this.windowWidth < 900) {
        this.ver = "pad verti";
      } else {
        this.ver = "pad hori";
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.onResize);
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
    clearInterval(this.showClock);
    if (this.socket) {
      this.socket.close();
      this.socket = false;
      console.log("socket close");
    }
    this.status = false;
  },
  computed: {
    nextStOrd: function() {
      if(!this.nowStation || this.nowStation.sta_Order==7) return 1;
      else return this.nowStation.sta_Order+1
    },
    blockStopSubmit: function () {
      if (
        (this.stopOpt == "오류" || this.stopOpt == "기타") &&
        !this.stopReason
      )
        return "disabled-stopBtn";
      else if (!this.stopOpt) return "disabled-stopBtn";
      else return "";
    },
  },
  methods: {
    getLatnLon(){	
      this.$http	
        .get(this.$api + "vehicles/" + this.selectedCar.id, {	
          headers: this.$headers,	
        })	
        .then((res) => {	
          this.lat = res.data.lat;	
          this.lon = res.data.lon	
        })	
        .catch((err) => {	
          console.log(err);	
        });	
    },	
    getNewSt() {		
      console.log("getNewSt실행")		
      this.$http.get(this.$api + "vehicles/" + this.selectedCar.id + "/", {		
          headers: this.$headers,		
        })		
        .then((res) => {		
          console.log("getNewSt 받아오기", res.data)		
          console.log(this.nowSt);		
          this.selectedCar.station = res.data.passed_station;		

          //콜 도착 알림
          if(this.callsArrivalInfo[res.data.passed_station]){
            for(var uid of this.callsArrivalInfo[res.data.passed_station]) {
              this.sendCalltoSocket(uid, "end")
            }
          }
        this.getStation(res.data.passed_station)	
          this.$session.set("selectedCar", this.selectedCar)		
          console.log("station이"+res.data.passed_station+"으로 변경됩니다.")		
        }).catch((err) => {		
          console.log(err)		
          // alert("station 정보 api 오류입니다. 새로고침 해주세요.")		
        })		
    },
    convertCallInfo(msg) {
      console.log("convertCallInfo", msg)
      this.$http.get(this.$api + "stations/"+msg.current_station_id,{headers:this.$headers})	
      .then((res) => {
        console.log(this.callUidChain)
        this.callUidChain[msg.uid]=this.calls.length;
        console.log(this.callUidChain)
        this.calls.push({
          uid:msg.uid,
          passenger:msg.passenger,
          passenger_name:msg.passenger_name,
          departName: res.data.name,
          arrivalId:msg.target_station_id,
          status:"go"
        })
        this.socket.send(JSON.stringify({
          who: "safeGuard",
          what: "EVENT",
          how: {
            type: "ondemand",
            vehicle_id: this.selectedCar.id,
            function: "go",
            uid: msg.uid,
            passenger: msg.passenger,
          }
        }));
        if(this.callsArrivalInfo[msg.target_station_id]) this.callsArrivalInfo[msg.target_station_id].push(msg.uid);
        else this.callsArrivalInfo[msg.target_station_id] = [msg.uid];
        this.$session.set("callsArrivalInfo", this.callsArrivalInfo);	
        this.$session.set("callUidChain", this.callUidChain);	
        this.$session.set("calls", this.calls);	
      }).catch(err=>{
        alert('신규 배차 받기 실패');
        console.log(err);
      })
    },

    sendCalltoSocket(uid,status){
      console.log("uid : ", uid, status);
      this.socket.send(JSON.stringify({
        who: "safeGuard",
        what: "EVENT",
        how: {
          type: "ondemand",
          vehicle_id: this.selectedCar.id,
          function: status,
          uid: uid,
          passenger: this.calls[this.callUidChain[uid]].passenger
        }
      }));
      //출발지 도착 + 탑승
      if(status=="arrived"){
        this.calls[this.callUidChain[uid]].status = "arrived"
        this.$session.set("calls", this.calls);	
      }
      //미탑승 or 도착
      else if(status!="go"){
        this.calls.splice(this.callUidChain[uid], 1)
        this.$session.set("calls", this.calls);	
      }
    },

    // convertTasioInfo(msg, timestamp) {
    //   this.$http.get(this.$api + "stations/"+msg.current_station_id,{headers:this.$headers})	
    //   .then((res1) => {	
    //     this.$http.get(this.$api + "stations/"+msg.target_station_id,{headers:this.$headers})	
    //     .then((res2) => {	
    //       var info = {	
    //           psngCnt: msg.passenger + "명",	
    //           psngName: msg.passenger_name,	
    //           currentETA: this.getTasioCurrentETA(msg.current_station_eta),	
    //           uid: msg.uid,	
    //           targetETA: parseInt(msg.target_station_eta),	
    //           callTime: this.timeFormatting(new Date(timestamp * 1000)),	
    //           depart: res1.data.name,	
    //           arrival: res2.data.name,	
    //       };	
    //       this.tasioStatus = "call";	
    //       this.tasioInfo = info;	
    //       this.$session.set("tasioStatus", "call");	
    //       this.$session.set("tasioInfo", info);	
    //     }).catch((err2)=> console.log(err2))	
    //   }).catch((err1)=> console.log(err1))
    // },
    // getTasioCurrentETA(eta) {
    //   eta = JSON.parse(eta);
    //   return eta[this.selectedCar.id];
    // },

    timeFormatting(date) {
      var h = date.getHours();
      var m = date.getMinutes();
      var s = date.getSeconds();
      var tasioEndH = h;
      var tasioEndM = m;
      var tasioEndS = s;
      if (m + 2 >= 60) {
        tasioEndM = m - 60;
        tasioEndH = h + 1;
      }
      console.log(tasioEndH, tasioEndM, tasioEndS);
      if (h >= 12) {
        if (h > 12) h -= 12;
        h = "오후 " + h;
      } else h = "오전 " + h;
      return h + "시 " + m + "분" + s + "초";
    },
    getStationListGunsan() {
      this.isLoading = true;
      this.stationList = {};
      this.$http
        .get(this.$api + "stations/", {
          headers: this.$headers,
        })
        .then((res) => {
          // this.stationList = res.data;
          for(var station of res.data){
            if(station.site==1){
              this.stationList[station.sta_Order] = station;
            }
          }
          console.log("gunsanst",this.stationList)
          console.log(Object.keys(this.stationList).length)
        }).then(()=>this.isLoading = false)
        .catch((err) => console.log(err));
    },
    // getNewSt() {
    //   console.log("getNewSt실행")
    //   this.$http.get(this.$api + "vehicles/" + this.selectedCar.id + "/", {
    //       headers: this.$headers,
    //     })
    //     .then((res) => {
    //       console.log("getNewSt 받아오기", res.data)
    //       console.log(this.nowSt);
    //       this.selectedCar.station = res.data.passed_station;
    //       this.$session.set("selectedCar", this.selectedCar)
    //       console.log("station이"+res.data.passed_station+"으로 변경됩니다.")
    //     }).catch((err) => {
    //       console.log(err)
    //       // alert("station 정보 api 오류입니다. 새로고침 해주세요.")
    //     })
    // },
    changeSt() {
      this.$http
        .patch(
          this.$api + "vehicles/" + this.selectedCar.id + "/", {
            passed_station: this.nowSt.id,
          }, {
            headers: this.$headers,
          }
        )
        .then((res) => {
          console.log("station 변경", res);
          if (res.data.passed_station == this.nowSt.id) {
            this.selectedCar.station = this.nowSt.id;
            this.$session.set("selectedCar", this.selectedCar);
            this.getStation(this.nowSt.id)
            this.nowSt = false;
            this.stModal = false;
          } else alert("다시 시도해주세요.");
        })
        .catch((err) => {
          console.log(err);
          alert("서비스 에러입니다. 다시 시도해주세요.");
          this.stModal = false;
        });
    },
    updateTasio(status) {
      this.tasioStatus = status;
    },
    getbyte() {
      var str = document.getElementById("msgtxt").value;
      document.getElementById("msgtxt").value = this.calcbyte(200, str);
      this.msgtxt = document.getElementById("msgtxt").value;
    },
    connectSocket() {
      this.socket = new WebSocket("wss://ws.tasio.io:11511", []);
      this.socket.onopen = () => {
        this.status = true;
        this.lastPing = new Date();
      };
      this.socket.onmessage = ({
        data
      }) => {
        this.socketMsg = JSON.parse(data);
      };
      this.socket.onerror = (err) => {
        alert("소켓 에러. 새로고침해주세요.");
        console.log(err);
      };
    },
    onResize() {
      this.windowWidth = window.innerWidth;
    },
    resetCar() {
      this.selectedCar = "";
      this.isDash = false;
      // this.socket.close();
      // console.log("socket close");
      this.status = false;
    },
    getStation(id) {	
      if(!id) return;
      this.$http.get(this.$api + "stations/"+id,{headers:this.$headers})	
      .then((res) => {	
        console.log("d",res.data)	
        this.nowStation.name = res.data.name;	
        this.nowStation.mid = res.data.mid;	
        this.nowStation.lat = res.data.lat;	
        this.nowStation.lon = res.data.lon;	
        this.nowStation.site = res.data.site;	
        this.nowStation.sta_Order = res.data.sta_Order;	
      }).catch((err)=> console.log(err))	
    },
    submitCar() {	
      this.$http	
        .get(this.$api + "vehicles/" + this.selectedCar.id, {	
          headers: this.$headers,	
        })	
        .then((res) => {	
          this.$session.set("selectedCar", this.selectedCar);	
          console.log("해당 차량 데이터 API로 불러오기", res.data);	
          this.selectedCar.station = res.data.passed_station;	
          this.getStation(res.data.passed_station);	
          var tpsng = res.data.passenger;		
          if ( !tpsng || tpsng<0 ) tpsng = 0;		
          this.psng = tpsng;		
          this.psngTemp = tpsng;	
          this.isOn = res.data.drive;	
          this.isAuto = res.data.drive_mode;	
          this.isPark = res.data.isparked;	
          this.lat = res.data.lat;	
          this.lon = res.data.lon	
          // 마지막 OFF **********************************		
          var time = new Date(res.data.latest_power_off);		
          this.lastOff = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " "		
          + this.addZeros(time.getHours(), 2) + ":"		
      + this.addZeros(time.getMinutes(), 2) +":"		
      + this.addZeros(time.getSeconds(), 2)		
      // 최근 켜짐으로부터 운행 시간 계산 함수		
          if(res.data.drive){		
            this.lastOn = res.data.latest_power_on;		
            this.calcDrivetime(res.data.latest_power_on);		
          } 	
          if (res.data.site) {	
            this.site.id = res.data.site;	
            this.$http	
              .get(this.$api + "sites/" + res.data.site, {	
                headers: this.$headers,	
              })	
              .then((res) => {	
                this.site.name = res.data.name;	
                this.site.mid = res.data.mid;	
                if (this.siteDict[res.data.mid])	
                  this.site.alias = this.siteDict[res.data.mid];	
                else this.site.alias = this.siteDict.none;	
                console.log(this.site);	
              })	
              .catch((err) => {	
                console.log(err);	
                this.site.name = "서비스 에러";	
              });	
          }	
        })	
        .catch((err) => {	
          console.log(err);	
        });	
      this.$http	
        .get(this.$api + "oplogs/vehicle/" + this.selectedCar.id, {	
          headers: this.$headers,	
        })	
        .then((res) => {	
          var i = res.data.length;	
          if (i) {	
            var time = res.data[i - 1].time_start;	
            console.log(time);	
            time = time.split("-").join("/");	
            time = time.replace("T", " ");	
            time = time.replace("Z", "");	
            time = time.replace("+09:00", "");	
            this.lastOn = time;	
            this.calcDrivetime(time);	
          } else {	
            this.lastOn = " ";	
            this.drivetime = " ";	
          }	
        })	
        .catch((err) => {	
          console.log(err);	
        });	
      this.isDash = false;	
      this.dashboard = true;	
    },
    addZeros(num, digit) {
      var zero = "";
      num = num.toString();
      if (num.length < digit) {
        for (var i = 0; i < digit - num.length; i++) {
          zero += "0";
        }
      }
      return zero + num;
    },
    showClock() {
      var now = new Date();

      //socket 재 연결
      // if (this.socket && now.getTime() - new Date(this.lastPing).getTime() > 70000)
        // this.connectSocket();
        // alert("웹소켓 연결이 끊어졌습니다. 새로고침해주세요.")

      var day = now.getDay();
      var week = ["일", "월", "화", "수", "목", "금", "토"];
      this.today =
        now.getFullYear() +
        "/" +
        (now.getMonth() + 1) +
        "/" +
        now.getDate() +
        " " +
        week[day] +
        "요일";
      var nowH = this.addZeros(now.getHours(), 2);
      var nowMin = this.addZeros(now.getMinutes(), 2);
      var nowSec = this.addZeros(now.getSeconds(), 2);
      this.clock = nowH + ":" + nowMin + ":" + nowSec;
    },
    calcDrivetime(onTime) {
        var timediff = new Date() - new Date(onTime);
        var diffD = parseInt(timediff / 86400000);
        timediff %= 86400000;
        var diffH = parseInt(timediff / 3600000);
        timediff %= 3600000;
        var diffM = parseInt(timediff / 60000);
        this.drivetime = `${diffH}시간 ${diffM}분`;
        if (diffD) this.drivetime = `${diffD}일 ` + this.drivetime;
    },
    calcbyte(maxByte, str) {
      var str_len = str.length;
      var rbyte = 0;
      var rlen = 0;
      var one_char = "";

      for (var i = 0; i < str_len; i++) {
        one_char = str.charAt(i);
        if (escape(one_char).length > 4) {
          rbyte += 2;
        } else {
          rbyte++;
        }
        if (rbyte <= maxByte) {
          rlen = i + 1;
        }
      }

      if (rbyte > maxByte) {
        if (maxByte == 200)
          alert("메세지는 최대 " + maxByte + "byte를 초과할 수 없습니다.");
        this.msgbyte = 200;
        return str.substr(0, rlen);
      } else {
        this.msgbyte = rbyte;
        return str;
      }
    },

    getTime() {
      var date = new Date();
      var timeString =
        date.getHours() +
        "시 " +
        date.getMinutes() +
        "분 " +
        date.getSeconds() +
        "초";
      var dateString =
        date.getFullYear() +
        "년 " +
        date.getMonth() +
        "월 " +
        date.getDate() +
        "일 ";
      return timeString + dateString;
    },

    openSubmit(v) {
      this.modalTitle = v;
      this.isSubmit = true;
    },
    submitModal_socket() {
      this.getLatnLon();
      var msg = {
        what: "EVENT",
        who: "safeGuard",
        how: {
          type: "",
          vehicle_id: this.selectedCar.id,
          site_id: this.site.id,
          value: "",
          lat:this.lat,	
          lon:this.lon
        },
      };
      if (this.modalTitle == "차량") {
        this.selectedCar = "";
        this.$session.set("selectedCar", false);
        this.dashboard = false;
        this.isSubmit = false;
        return;
      } else if (this.modalTitle == "전원") {
        msg.how.type = "power";
        msg.how.value = this.isOn ? "false" : "true";
      } else if (this.modalTitle == "주행모드") {
        msg.how.type = "drive";
        msg.how.value = this.isAuto == 1 ? "normal" : "auto";
      } else {
        msg.how.type = "parking";
        msg.how.value = this.isPark ? "false" : "true";
      }
      this.socket.send(JSON.stringify(msg));
      this.isSubmit = false;
    },
    powerOn() {
      if (this.isOn) return;
      else {
        this.isSubmit = true;
        this.modalTitle = "전원";
        this.modalValue = "ON";
      }
    },

    powerOff() {
      if (!this.isOn) return;
      else {
        // this.isOplog = true;
        this.isSubmit = true;
        this.modalTitle = "전원";
        this.modalValue = "OFF";
      }
    },
    submitOplog() {
      var msg = {
        what: "EVENT",
        who: "safeGuard",
        how: {
          type: "power",
          vehicle_id: this.selectedCar.id,
          site_id: this.site.id,
          value: "off",
          
        },
      };
      this.socket.send(JSON.stringify(msg));
      this.isOplog = false;
    },
    savePsng() {
      if (this.psngTemp >= 16) {
        alert("탑승객 수를 확인해주세요.");
        this.psngTemp = this.psng;
        return;
      }
      this.getLatnLon();
      var msg = {
        what: "EVENT",
        who: "safeGuard",
        how: {
          type: "passenger",
          vehicle_id: this.selectedCar.id,
          site_id: this.site.id,
          current_passenger: this.psngTemp,
          accumulated_passenger: this.psng + this.psngTemp,
          lat:this.lat,	
          lon:this.lon
        },
      };
      this.socket.send(JSON.stringify(msg));
    },

    autoOn() {
      if (this.isAuto == 2) {
        this.isSubmit = true;
        this.modalTitle = "주행모드";
        this.modalValue = "자동주행";
      }
    },

    autoOff() {
      if (this.isAuto == 1) {
        this.isSubmit = true;
        this.modalTitle = "주행모드";
        this.modalValue = "수동주행";
      }
    },

    parkOn() {
      if (this.isPark) return;
      else {
        this.isSubmit = true;
        this.modalTitle = "주차여부";
        this.modalValue = "예";
      }
    },

    parkOff() {
      if (!this.isPark) return;
      else {
        this.isSubmit = true;
        this.modalTitle = "주차여부";
        this.modalValue = "아니오";
      }
    },

    decrease() {
      this.psngTemp = parseInt(this.psngTemp);
      if (this.psngTemp > 0) {
        this.psngTemp -= 1;
      }
    },
    increase() {
      this.psngTemp = parseInt(this.psngTemp);
      if (this.psngTemp < 15) {
        this.psngTemp += 1;
      } else alert("입력값이 초과되었습니다.");
    },

    sendMsg() {
      if (!this.msgtxt) {
        alert("메세지를 입력해주세요.");
        return;
      }
      // socket ver.
      var msg = {
        what: "EVENT",
        who: "safeGuard",
        how: {
          type: "message",
          vehicle_id: this.selectedCar.id,
          site_id: this.site.id,
          value: this.msgtxt,
        },
      };
      this.socket.send(JSON.stringify(msg));
      this.isMsgToast = true;
      setTimeout(() => (this.isMsgToast = false), 2000);
      this.closeMsg();
    },
    closeMsg() {
      this.isMsg = false;
      this.msgbyte = 0;
      this.msgtxt = "";
    },
    pickOpt(opt) {
      if (this.stopOpt == opt) return;
      this.stopOpt = opt;
      this.stopReason = "";
    },
    clearStopMsg() {
      this.stopSMsg = "";
      this.stopEMsg = "";
    },

    submitStop() {
      this.getLatnLon();
      this.stopSMsg = "이벤트가 전송됐습니다.";
      var msg = {
        where: "sejong_datahub",
        who: "safeGuard",
        what: "EVENT",
        how: {
          type: "reason_stop",
          site_id: this.site.id,
          vehicle_id: this.selectedCar.id,
          reason_type: "",
          lat:this.lat,	
          lon:this.lon
        },
      };
      if (this.stopOpt == "차") {
        msg.how.reason_type = "car";
        this.socket.send(JSON.stringify(msg));
        this.stopOpt = "";
        this.stopReason = "";
      } else if (this.stopOpt == "사람") {
        msg.how.reason_type = "people";
        this.socket.send(JSON.stringify(msg));
        this.stopOpt = "";
        this.stopReason = "";
      } else if (this.stopOpt == "환경요소") {
        msg.how.reason_type = "environmental factor";
        this.socket.send(JSON.stringify(msg));
        this.stopOpt = "";
        this.stopReason = "";
      } else if (this.stopOpt == "오류") {
        msg.how.reason_type = "error";
        msg.how["reason"] = this.stopReason;
        this.socket.send(JSON.stringify(msg));
        this.stopOpt = "";
        this.stopReason = "";
      } else if (this.stopOpt == "기타") {
        msg.how.reason_type = "etc";
        msg.how["reason"] = this.stopReason;
        this.socket.send(JSON.stringify(msg));
        this.stopOpt = "";
        this.stopReason = "";
      }
    },
    beforeSubmitStop() {
      this.clearStopMsg();
      if (
        (this.stopOpt == "오류" || this.stopOpt == "기타") &&
        !this.stopReason
      ) {
        this.stopEMsg = "정지사유를 입력해주세요.";
      } else if (!this.stopOpt) {
        this.stopEMsg = "전송할 상태를 선택해주세요.";
      } else {
        this.submitStop();
      }
      setTimeout(this.clearStopMsg, 5000);
    },
   
  },
};

export default operateMixin;