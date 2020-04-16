<template>
    <div id="resetpw" class="login">
        <button class="btn-back" @click="goback()">
            <!-- <img src="back.png" alt="back button"> -->
        </button>
        <div>
            <div class="text-blue resetpw-title1">SpringGo</div>
            <div class="text-blue resetpw-title2">비밀번호 재설정</div>
        </div>
        <div class="mobile-justify" v-if="resetpage">
            <div class="resetpw-txt">
                이메일로 임시 비밀번호를 발송합니다.<br>
                본인 확인을 위해 이름과 이메일 아이디를 입력해 주세요.
            </div>
            <div class="login-form">
                <form @submit.prevent="resetpw">
                    <label for="name">이름</label>
                    <input v-model="username" type="text" id="username" name="username" placeholder="이름을 입력해주세요.">
                    <label for="emailID">이메일 아이디</label>
                    <input v-model="email" id="emailID" type="text" name="emailID" placeholder="이메일 아이디를 입력해주세요.">
                    <button type="submit" class="login-btn resetpw-btn-pos">임시 비밀번호 받기</button>
                </form>
            </div>
            <div class="errmsg resetpw-errmsg">{{errmsg1}}<br>{{errmsg2}}</div>
            </div>
        <div v-if="!resetpage">
            <div class="resetpw2-txt">
                <span>{{email}}</span> 으로<br>
                임시 비밀번호를 발송하였습니다. 
            </div>
            <button @click="goLogin()" class="login-btn resetpw2-btn-pos">로그인 하기</button>
        </div>
        <div class="copyright">COPYRIGHT@SPRINGCLOUD INC. ALL RIHTS RESERVED.</div>
    </div>
</template>
<script>
import axios from 'axios'
import router from "../router"
export default {
    name: 'respetpw',
    data() {
        return {
            username:'',
            email:'',
            errmsg1:'',
            errmsg2:'',
            resetpage: true
        }
    },
    methods: {
        resetpw () {
            var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
            if(!this.email) {
                this.errmsg1 = '이메일 아이디를 입력해주세요.';
                this.errmsg2 = '';
                return;
            } else if(!this.email.match(regExp)){
                this.errmsg1 = '이메일 아이디를 올바르게 입력해주세요.';
                this.errmsg2 = '';
                return;
            } else if(!this.username) {
                this.errmsg1 = '이름을 입력해주세요.';
                this.errmsg2 = '';
                return;
            } else if(this.username=="admin1@aspringcloud.com") {
                this.errmsg1 = '해당 계정은 개발자에게 문의해주세요.'
                this.errmsg2 = ''
            } else {
                alert('API(이름,이메일 검증, 메일발송) 확인 필요')
                axios.post("http://115.93.143.2:9103/api/users/resetpassword/",
                {email:this.email},
                {headers: 
                    { authorization: 'Basic YWRtaW4xQGFzcHJpbmdjbG91ZC5jb206c3ByaW5nIzAwNw==' }
                }
                ).then(res => {
                    console.log(res.data);
                }).catch(err => {
                    console.log(err)
                })
                this.resetpage = false;
            }
        },
        goback() {
            if(this.resetpage) {
                router.push({name: 'Login'});
            } else if(!this.resetpage) {
                this.username= '';
                this.email = '';
                this.errmsg1 = '';
                this.errmsg2 = '';
                this.resetpage = true;
            }
        },
        goLogin() {
            router.push({name:'Login'});
        }
    }
}
</script>
<style>
    .btn-back {
        background-color: transparent;
        border: none;
        position: absolute;
        top: 11px;
        left: 37px;
        width: 27px;
        height: 27px;
        background-image: url('../../public/back.png');
    }
    .resetpw-title1 {
        font-weight: 800;
        font-size: 24px;
        font-family: 'NanumSquareRound',sans-serif;
        margin-top: 72px;
        text-align: center;
    } 
    .resetpw-title2 {
        font-weight: bold;
        margin-top: 20px;
        font-size: 30px;
        line-height: 30px;
        margin-bottom: 73px;
    }
    .resetpw-txt {
        font-size: 16px;
        font-weight: 500;
        color: #4F4F4F;
        width: 464px;
        margin-bottom: 30px;
    }
    .resetpw-btn-pos {
        margin-top: 34px;
    }
    .resetpw-errmsg {
        margin-top: 20px;
    }
    .resetpw2-txt {
        margin-top: 80px;
        font-weight: 500;
        font-size: 16px;
        text-align: center;
    }
    .resetpw2-txt span {
        color: #EB5757;
    }
    .resetpw2-btn-pos {
        margin-top: 144px;
    }
    @media (max-width: 979px) {
        .btn-back {
            top: 21px;
            left: 24px;
            background-image: url('../../public/back_mobile.png');
            width: 18px;
            height: 14px;
        }
        .btn-back img {
            width: 18px;
            height: 14px;
        }
        .resetpw-title1 {
            margin-top: 46px;
        }
        .resetpw-title2 {
            font-size: 24px;
            margin-top: 12px;
            margin-bottom: 67px;
        }
        .resetpw-txt {
            width: 240px;
            text-align: center;
            font-weight: normal;
            font-size: 14px;
        }
        .mobile-justify {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .resetpw-errmsg {
            width: 311px;
            margin-top: 14px;
        }
        .resetpw-btn-pos {
            margin-top: 20px;
        }
        .resetpw2-txt {
            margin-top: 126px;
            font-weight: normal;
            font-size: 14px;
        }
        .resetpw2-btn-pos {
            margin-top: 224px;
        }
    }
    
    
    
</style>