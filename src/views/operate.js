let operateMixin = {
    data: () => ({
        tasioInfo: false,
        callTime: false,
        isOplog: false,
        reqStation: false,
        stationList: false,
        isStation: false,
        stModal: false,
        nowSt: false,
        site: {
            id: "",
            name: "",
            alias: ""
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
        cars: [],
        selectedCar: "",
        date: "",
        isOn: 1,
        isSubmit: false,
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
        tasioStatus: false,
        socket: false,
        status: false,
        socketMsg: "",
        isMsgToast: false
    }),
    beforeCreate() {
        if (!this.$session.exists()) {
            this.$router.push({
                name: "Login",
            });
        }
    },
    created() {
        if (this.$session.exists()) {
            this.user = this.$session.get("user");
            this.$headers.authorization = "Basic " + this.$session.get("user").basic;
            this.getStationList();
            this.$http
                .get(this.$api + "vehicles/", {
                    headers: this.$headers,
                })
                .then((res) => {
                    var infos = res.data;
                    for (let i = 0; i < infos.length; i++) {
                        this.cars.push({
                            id: infos[i].id,
                            name: infos[i].name,
                            station: infos[i].passed_station
                        });
                    }
                    console.log('created', this.cars)
                })
                .catch((err) => {
                    console.log(err);
                });
            if (this.$session.get("selectedCar")) {
                this.selectedCar = this.$session.get("selectedCar");
                this.nowSt = this.stationList[this.selectedCar.station];
                this.dashboard = true;
                this.submitCar();
                this.connectSocket();
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
                who: ["safeGuard"],
                what: "EVENT",
                how: {
                    type: "ondemand",
                    vehicle_id: this.selectedCar.id,
                    function: "start",
                },
            };
            if (this.tasioStatus == "start") {
                this.socket.send(JSON.stringify(msg));
                console.log("여기!!!start!!", msg);
            } else if (this.tasioStatus == "toEnd") {
                msg.how.function = "complete";
                this.socket.send(JSON.stringify(msg));
                console.log(msg);
            }
        },
        socketMsg: function () {
            console.log(this.socketMsg);
            if (
                this.socketMsg.what == "EVENT" &&
                this.socketMsg.how.type == "ondemand" &&
                this.socketMsg.how.vehicle_id == this.selectedCar.id &&
                this.socketMsg.how.function == "call"
            ) {
                this.convertTasioInfo(this.socketMsg.how, this.socketMsg.when);

            } else if (this.socketMsg.what == "RESP") {
                if (this.socketMsg.how.type == "passenger") {
                    this.psng = this.socketMsg.how.current_passenger;
                    this.isStation = false;
                } else if (this.socketMsg.how.type == "power")
                    this.isOn = this.socketMsg.how.value == "on" ? true : false;
                else if (this.socketMsg.how.type == "drive")
                    this.isAuto = this.socketMsg.how.value == "auto" ? 1 : 2;
                else if (this.socketMsg.how.type == "parking")
                    this.isPark = this.socketMsg.how.value == "true" ? true : false;
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
            if (this.selectedCar && !this.dashboard) {
                this.isDash = true;
                if (!this.selectedCar.station) this.selectedCar.station = false;
            }
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
        convertTasioInfo(msg, timestamp) {
            var info = {
                'psngCnt': msg.passenger + "명",
                'psngName': msg.passenger_name,
                'callTime': new Date(timestamp * 1000),
                'depart': this.stationList[Number(msg.current_station_id) - 1].name,
                'arrival': this.stationList[Number(msg.target_station_id) - 1].name,
            }
            this.tasioInfo = info;
            this.tasioStatus = 'call';
        },
        getStationList() {
            this.$http
                .get(this.$api + "stations/", {
                    headers: this.$headers
                })
                .then((res) => {
                    console.log("st1", res.data);
                    this.stationList = res.data;
                })
                .catch((err) => console.log(err));
        },
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
                        this.nowSt = false;
                        if (this.stModal != 1) this.isStation = true;
                    } else alert("다시 시도해주세요.");
                })
                .catch((err) => {
                    console.log(err);
                    alert("서비스 에러입니다. 다시 시도해주세요.");
                });
            if (this.stModal == 1) this.savePsng(1);
            this.stModal = false;
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
            this.socket = new WebSocket("ws://222.114.39.8:11411");
            this.socket.onopen = () => {
                this.status = true;
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
            this.selectedCar = false;
            this.isDash = false;
            this.socket.close();
            console.log("socket close");
            this.status = false;
        },
        submitCar() {
            this.$http
                .get(this.$api + "vehicles/" + this.selectedCar.id, {
                    headers: this.$headers,
                })
                .then((res) => {
                    this.$session.set("selectedCar", this.selectedCar);
                    console.log("초기값", res.data);

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
                    this.psng = res.data.passenger;
                    this.isOn = res.data.drive;
                    this.isAuto = res.data.drive_mode;
                    if (!this.psng) this.psng = 0;
                    this.psngTemp = this.psng;
                    this.isPark = res.data.isparked;
                    if (res.data.lon && res.data.lat) {
                        this.$http
                            .get(
                                `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${res.data.lon}&y=${res.data.lat}&input_coord=WGS84`, {
                                    headers: {
                                        Authorization: "KakaoAK 13d764d3755ffa0f1ee21f204fd52fe1",
                                    },
                                }
                            )
                            .then((res) => {
                                this.location = res.data.documents[0].address.address_name;
                            })
                            .catch((err) => {
                                console.log(err);
                                this.location = "서비스 에러";
                            });
                    } else {
                        this.location = "위치정보 없음";
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
        calcDrivetime(time) {
            if (!this.isOn || !this.lastOn) return;
            else {
                var timediff = new Date() - new Date(time);
                var diffD = parseInt(timediff / 86400000);
                timediff %= 86400000;
                var diffH = parseInt(timediff / 3600000);
                timediff %= 3600000;
                var diffM = parseInt(timediff / 60000);
                this.drivetime = `${diffH}시간 ${diffM}분`;
                if (diffD) this.drivetime = `${diffD}일 ` + this.drivetime;
            }
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
        // submitModal() {
        //     if (this.modalTitle == "차량") {
        //         this.selectedCar = "";
        //         this.$session.set("selectedCar", false);

        //         this.dashboard = false;
        //         this.isSubmit = false;
        //     } else if (this.modalTitle == "전원") {
        //         this.$http
        //             .patch(
        //                 this.$api + "vehicles/" + this.selectedCar.id + "/", {
        //                     drive: !this.isOn,
        //                 }, {
        //                     headers: this.$headers,
        //                 }
        //             )
        //             .then((res) => {
        //                 this.isOn = res.data.drive;
        //             })
        //             .catch((err) => {
        //                 console.log(err);
        //                 alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
        //             });
        //         this.isSubmit = false;
        //     } else if (this.modalTitle == "주행모드") {
        //         if (this.isAuto == 1) {
        //             this.$http
        //                 .patch(
        //                     this.$api + "vehicles/" + this.selectedCar.id + "/", {
        //                         drive_mode: 2,
        //                     }, {
        //                         headers: this.$headers,
        //                     }
        //                 )
        //                 .then((res) => {
        //                     this.isAuto = res.data.drive_mode;
        //                 })
        //                 .catch((err) => {
        //                     console.log(err);
        //                     alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
        //                 });
        //         } else if (this.isAuto == 2) {
        //             this.$http
        //                 .patch(
        //                     this.$api + "vehicles/" + this.selectedCar.id + "/", {
        //                         drive_mode: 1,
        //                     }, {
        //                         headers: this.$headers,
        //                     }
        //                 )
        //                 .then((res) => {
        //                     this.isAuto = res.data.drive_mode;
        //                 })
        //                 .catch((err) => {
        //                     console.log(err);
        //                     alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
        //                 });
        //         }
        //         this.isSubmit = false;
        //     } else {
        //         this.$http
        //             .patch(
        //                 this.$api + "vehicles/" + this.selectedCar.id + "/", {
        //                     isparked: !this.isPark,
        //                 }, {
        //                     headers: this.$headers,
        //                 }
        //             )
        //             .then((res) => {
        //                 this.isPark = res.data.isparked;
        //             })
        //             .catch((err) => {
        //                 console.log(err);
        //                 alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
        //             });
        //         this.isSubmit = false;
        //     }
        // },
        submitModal_socket() {
            var msg = {
                what: "EVENT",
                who: "safeGuard",
                how: {
                    type: "",
                    vehicle_id: this.selectedCar.id,
                    site_id: this.site.id,
                    value: "",
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
                msg.how.value = this.isOn ? "off" : "on";
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
                this.isOplog = true;
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
            }
            this.socket.send(JSON.stringify(msg));
            this.isOplog = false;
        },
        sameStPsng() {
            this.isStation = true;
            this.reqStation = false;
            this.savePsng();
        },
        savePsng(tag) {
            if (this.psngTemp >= 16) {
                alert("탑승객 수를 확인해주세요.");
                this.psngTemp = this.psng;
                return;
            }
            if (!this.isStation && !tag) {
                this.reqStation = true;
                return;
            }
            var msg = {
                what: "EVENT",
                who: "safeGuard",
                how: {
                    type: "passenger",
                    vehicle_id: this.selectedCar.id,
                    site_id: this.site.id,
                    current_passenger: this.psngTemp,
                    accumulated_passenger: this.psng + this.psngTemp,
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
            setTimeout(() => this.isMsgToast = false, 2000);
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
            this.stopOpt = "";
            this.stopReason = "";
            this.stopSMsg = "이벤트가 전송됐습니다.";
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
        getTasioCall() {
            var msg = {
                "who": "tasio_id",
                "what": "EVENT",
                "how": {
                    "type": "ondemand",
                    "vehicle_id": 6,
                    "function": "call",
                    "current_station_id": 2,
                    "target_station_id": 3,
                    "passenger": 3,
                    "passenger_name": "혜리"
                }
            }
            var temp = {
                "how": {
                    "function": "call",
                    "passenger": 3,
                    "vehicle_id": 6,
                    "passenger_name": "\ud61c\ub9ac",
                    "site_id": 2,
                    "current_station_id": 2,
                    "vehicle_mid": "SCN999",
                    "target_station_id": 3,
                    "type": "ondemand"
                },
                "what": "EVENT",
                "who": "springgos_sejong_1",
                "when": 1594614867.507743,
                "where": "sejong_datahub"
            }
            console.log(temp)
            this.socket.send(JSON.stringify(msg));
        }
    },
};

export default operateMixin;