let operateMixin = {

    data: () => ({
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
        modalTitle: "",
        modalValue: "",
        msgTo: "사이트 통합관제",
        centers: [{
            name: "사이트 통합관제"
        }],
        drivetime: " ",
        byte: 0,
        today: "",
        clock: "",
        windowWidth: 0,
        psngTemp: 0,
        stopSMsg: "",
        stopEMsg: "",
        stopOpt: "",
        stopReason: "",
        stopOptList: ["차", "사람", "환경요소", "오류", "기타"]
    }),
    beforeCreate() {
        if (!this.$session.exists()) {
            this.$router.push({
                name: "Login"
            });
        }
    },
    created() {
        if (this.$session.exists()) {
            this.user = this.$session.get("user");
            this.$headers.authorization = "Basic " + this.$session.get("user").basic;
            this.$http
                .get(this.$api + "vehicles/", {
                    headers: this.$headers
                })
                .then(res => {
                    var infos = res.data;
                    for (let i = 0; i < infos.length; i++) {
                        this.cars.push({
                            id: infos[i].id,
                            name: infos[i].name
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                });
            this.selectedCar = this.$session.get("selectedCar");
            if (this.selectedCar) {
                this.dashboard = true;
                this.submitCar();
            }
        }
        setInterval(this.showClock, 1000);
        this.windowWidth = window.innerWidth;
    },
    watch: {
        clock: function () {
            if (this.drivetime != " ") {
                this.calcDrivetime(this.lastOn);
            }
        },
        selectedCar: function () {
            if (this.selectedCar && !this.dashboard) {
                this.isDash = true;
            }
        },
        windowWidth: function () {
            if (this.windowWidth < 601) {
                if (this.isSetting) {
                    if (this.loginInfo) {
                        this.sloginInfo = true;
                    } else {
                        this.schangePw = true;
                    }
                }
                this.isSetting = false;
            } else {
                this.openHam = false;
                if (this.schangePw) {
                    this.schangePw = false;
                    this.isSetting = true;
                    this.loginInfo = false;
                }
                if (this.sloginInfo) {
                    this.sloginInfo = false;
                    this.isSetting = true;
                    this.loginInfo = true;
                }
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            window.addEventListener("resize", this.onResize);
        });
    },
    beforeDestroy() {
        window.removeEventListener("resize", this.onResize);
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
        }
    },
    methods: {
        closeMobileSetting() {
            if (this.sloginInfo) {
                this.sloginInfo = false;
                return;
            } else if (this.schangePw) {
                this.schangePw = false;
                return;
            } else {
                this.openHam = !this.openHam;
            }
        },
        onResize() {
            this.windowWidth = window.innerWidth;
        },
        openmobilepw() {
            this.errmsg = "";
            this.successmsg = "";
            this.schangePw = true;
            this.openHam = false;
            this.isModal = true;
        },
        resetCar() {
            this.selectedCar = "";
            this.isDash = false;
        },
        submitCar() {
            this.$http
                .get(this.$api + "vehicles/" + this.selectedCar.id, {
                    headers: this.$headers
                })
                .then(res => {
                    this.$session.set("selectedCar", this.selectedCar);
                    // console.log("초기값", res.data);
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
                                        Authorization: "KakaoAK 13d764d3755ffa0f1ee21f204fd52fe1"
                                    }
                                }
                            )
                            .then(res => {
                                this.location = res.data.documents[0].address.address_name;
                            })
                            .catch(err => {
                                console.log(err);
                                this.location = "서비스 에러";
                            });
                    } else {
                        this.location = "위치정보 없음";
                    }
                })
                .catch(err => {
                    console.log(err);
                });

            this.$http
                .get(this.$api + "oplogs/vehicle/" + this.selectedCar.id, {
                    headers: this.$headers
                })
                .then(res => {
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
                .catch(err => {
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
        calcbyte() {
            var b, i, c;
            var s = this.msgtxt;
            var l = s.length;
            for (b = i = 0; i < l; i++) {
                c = s.charCodeAt(i);
                b += c >> 11 ? 3 : c >> 7 ? 2 : 1;
                if (b > 200) {
                    this.msgtxt = s.substr(0, i);
                    this.byte = b - (c >> 11 ? 3 : c >> 7 ? 2 : 1);
                    alert("메세지는 200byte까지 입력 가능합니다.");
                    return;
                }
                this.byte = b;
            }
            this.byte = b;
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
        submitModal() {
            if (this.modalTitle == "차량") {
                this.selectedCar = "";
                this.$session.set("selectedCar", false);

                this.dashboard = false;
                this.isSubmit = false;
            } else if (this.modalTitle == "전원") {
                this.$http
                    .patch(
                        this.$api + "vehicles/" + this.selectedCar.id + "/", {
                            drive: !this.isOn
                        }, {
                            headers: this.$headers
                        }
                    )
                    .then(res => {
                        this.isOn = res.data.drive;
                    })
                    .catch(err => {
                        console.log(err);
                        alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
                    });
                this.isSubmit = false;
            } else if (this.modalTitle == "주행모드") {
                if (this.isAuto == 1) {
                    this.$http
                        .patch(
                            this.$api + "vehicles/" + this.selectedCar.id + "/", {
                                drive_mode: 2
                            }, {
                                headers: this.$headers
                            }
                        )
                        .then(res => {
                            this.isAuto = res.data.drive_mode;
                        })
                        .catch(err => {
                            console.log(err);
                            alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
                        });
                } else if (this.isAuto == 2) {
                    this.$http
                        .patch(
                            this.$api + "vehicles/" + this.selectedCar.id + "/", {
                                drive_mode: 1
                            }, {
                                headers: this.$headers
                            }
                        )
                        .then(res => {
                            this.isAuto = res.data.drive_mode;
                        })
                        .catch(err => {
                            console.log(err);
                            alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
                        });
                }
                this.isSubmit = false;
            } else {
                this.$http
                    .patch(
                        this.$api + "vehicles/" + this.selectedCar.id + "/", {
                            isparked: !this.isPark
                        }, {
                            headers: this.$headers
                        }
                    )
                    .then(res => {
                        this.isPark = res.data.isparked;
                    })
                    .catch(err => {
                        console.log(err);
                        alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
                    });
                this.isSubmit = false;
            }
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
                this.isSubmit = true;
                this.modalTitle = "전원";
                this.modalValue = "OFF";
            }
        },

        savePsng() {
            if (this.psngTemp >= 2147483847) {
                alert("탑승객 수를 확인해주세요.");
                this.psngTemp = this.psng;
                return;
            }
            this.$http
                .patch(
                    this.$api + "vehicles/" + this.selectedCar.id + "/", {
                        passenger: this.psngTemp
                    }, {
                        headers: this.$headers
                    }
                )
                .then(res => {
                    this.psng = res.data.passenger;
                })
                .catch(err => {
                    console.log(err);
                    alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
                });
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
            this.$http
                .post(
                    this.$api + "event/message/", {
                        vehicle_id: this.selectedCar.id,
                        message: this.msgtxt
                    }, {
                        headers: this.$headers
                    }
                )
                .then(res => {
                    alert("메세지가 전송되었습니다.");
                    console.log(res);
                })
                .catch(err => {
                    console.log(err);
                    alert(err + "\n문제가 발생하였습니다. 다시 시도해주세요.");
                });
            this.isMsg = false;
            this.byte = 0;
            this.msgtxt = "";
        },
        closeMsg() {
            this.isMsg = false;
            this.byte = 0;
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
        }
    }
};

export default operateMixin