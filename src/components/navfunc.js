let navbarMixin = {
    props: ["user"],

    data: () => ({
        newpw: "",
        repw: "",
        isSetting: false,
        loginInfo: false,
        errmsg: "",
        successmsg: "",
    }),
    methods: {
        openSetting() {
            if (!this.user.profile) {
                this.$http
                    .get(this.$api + "users/" + this.user.info.pk, {
                        headers: this.$headers
                    })
                    .then(res => {
                        this.user.profile = res.data.profile;
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
                    this.$api + "auth/password/change/", {
                        new_password1: this.newpw,
                        new_password2: this.repw
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
                    this.newpw = "";
                    this.repw = "";
                })
                .catch(error => {
                    console.log(error.response.data);
                    var err = error.response.data.new_password2;
                    if (
                        err.includes("This password is too short. It must contain at least 8 characters.")

                    ) {
                        this.errmsg = "8글자 이상의 비밀번호를 입력하세요.";
                    } else if (err.includes("The two password fields didn't match.")) {
                        this.errmsg = "두 개의 비밀번호가 일치하지 않습니다.";
                    } else if (err.includes("This field may not be blank.")) {
                        this.errmsg = "비밀번호를 입력해주세요.";
                    } else if (err.includes("This password is entirely numeric.")) {
                        this.errmsg = "비밀번호에 숫자 외의 문자를 포함하세요.";
                    } else if (
                        err.includes("The password is too similar to the email address.")) {
                        this.errmsg = "비밀번호가 이메일ID와 너무 유사합니다.";
                    } else if (err.includes("The password is too similar to the username.")) {
                        this.errmsg = "비밀번호가 사용자 이름과 너무 유사합니다.";
                    } else if (err.includes("This password is too common.")) {
                        this.errmsg = "평범하지 않은 비밀번호를 입력하세요.";
                    } else {
                        console.log(this.errmsg);
                    }
                });
        }
    }
}
export default navbarMixin