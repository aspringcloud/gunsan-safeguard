let navbarMixin = {
    props: ["user"],

    data: () => ({
        newpw: "",
        repw: "",
        currentpw: "",
        isSetting: false,
        loginInfo: false,
        errmsg: "",
        successmsg: "",
    }),
    computed: {
        calcUserName() {
            var str_len = this.user.info.username.length;
            var rbyte = 0;
            var rlen = 0;
            var one_char = "";

            for (var i = 0; i < str_len; i++) {
                one_char = this.user.info.username.charAt(i);
                if (escape(one_char).length > 4) {
                    rbyte += 2;
                } else {
                    rbyte++;
                }
                if (rbyte <= 12) {
                    rlen = i + 1;
                }
            }

            if (rbyte > 12) {
                return this.user.info.username.substr(0, rlen) + "...";
            } else {
                return this.user.info.username;
            }
        },
    },
    methods: {
        openSetting() {
            if (!this.user.profile) {
                this.$http
                    .get(this.$api + "users/" + this.user.info.pk, {
                        headers: this.$headers
                    })
                    .then(res => {
                        this.user.profile = res.data.profile;
                        this.$session.set("user", this.user);
                        this.isSetting = true;
                        this.loginInfo = true;
                        this.errmsg = "";
                        this.successmsg = "";
                    })
                    .catch(err => {
                        alert(
                            err,
                            "사용자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
                        );
                    });
            } else {
                this.loginInfo = true;
                this.isSetting = true;
                this.errmsg = "";
                this.successmsg = "";
                this.currentpw = "";
                this.newpw = "";
                this.repw = "";
            }
        },
        logout() {
            this.$http
                .post(this.$api + "auth/logout/")
                .then(res => {
                    console.log(res.data.detail);
                    this.$session.destroy();
                    this.$router.push({
                        name: "Login"
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        },
        resetPw() {
            this.$http
                .post(
                    this.$api + "users/change_password/", {
                        e_mail_id: this.user.info.email,
                        old_password: this.currentpw,
                        new_password: this.newpw,
                        confirm_new_password: this.repw
                    }, {
                        headers: this.$headers
                    }
                )
                .then(res => {
                    console.log(res.data.detail);
                    this.errmsg = "";
                    this.successmsg = "새로운 비밀번호로 변경되었습니다.";
                    var temp = this.$session.get("user");
                    temp.basic = btoa(this.user.info.email + ":" + this.newpw);
                    this.$session.set("user", temp);
                    this.$headers.authorization =
                        "Basic " + this.$session.get("user").basic;
                    this.currentpw = "";
                    this.newpw = "";
                    this.repw = "";
                })
                .catch(error => {
                    console.log(error.response.data[0]);
                    this.successmsg = ""
                    this.errmsg = error.response.data[0]
                });
        }
    }
}
export default navbarMixin