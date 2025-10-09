<template>
    <div class="devices-prelaoder-area">
        <div class="containered devices">
          <div class="screen monitor">
            <div class="content">
              <div class="pg">
                <ul class="btns">
                  <li></li>
                  <li></li>
                  <li></li>
                </ul>
                <div class="screen-content">
                  <ul class="txt">
                    <li></li>
                    <li class="big"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li></li>
                    <li></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li></li>
                    <li class="big"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                    <li class="third"></li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="base">
              <div class="grey-shadow"></div>
              <div class="foot top"></div>
              <div class="foot bottom"></div>
            </div>
          </div>
          <div class="laptop">
            <div class="content">
              <ul class="txt">
                <li></li>
                <li class="big"></li>
                <li class="third"></li>
                <li class="third"></li>
                <li class="third"></li>
                <li></li>
                <li></li>
                <li class="third"></li>
                <li class="third"></li>
                <li class="third"></li>
                <li class="third"></li>
                <li class="third"></li>
                <li class="third"></li>
                <li></li>
                <li class="big"></li>
                <li class="third"></li>
                <li class="third"></li>
                <li class="third"></li>
                <li class="third"></li>
                <li class="third"></li>
                <li class="third"></li>
              </ul>
            </div>
            <div class="btm"></div>
          </div>
          <div class="phone">
            <div class="screen">
              <div class="content">
                <ul class="txt">
                  <li></li>
                  <li></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li></li>
                  <li></li>
                </ul>
              </div>
            </div>
            <div class="shadow"></div>
          </div>
      
          <div class="ipad">
            <div class="screen">
              <div class="content screen-content">
                <ul class="txt">
                  <li></li>
                  <li class="big"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li></li>
                  <li></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li class="half"></li>
                  <li></li>
                </ul>
              </div>
            </div>
          </div>

        </div>
    </div>
</template>

<style scoped>
.devices-prelaoder-area{
    position: fixed;
    width: 100%;
    height: 100vh;
    background-color: #3333338c;
    top: 0;
    left: 0;
    padding-top: 200px;
    backdrop-filter: blur(4px);
    z-index: 999999;
}
 
.containered {
  opacity: 0.8;
  max-width: 680px;
  margin: 2em auto;
  position: relative; 
}
.devices {
  font-size: 10px;
  padding: 1em;
}
@media screen and (min-width: 38em) {
  .devices {
    font-size: 16px;
  }
}
.devices > .screen {
  width: 28.75em;
  height: 17.5em;
  position: relative;
  background: #f8f8f8;
  border: 10px solid #1f1f1f;
  border-radius: 10px;
  margin: 0 auto;
}
@media screen and (min-width: 38em) {
  .devices > .screen {
    border: 20px solid #1f1f1f;
  }
}
.monitor > div {
  position: absolute;
}
.monitor:before,
.monitor:after,
.laptop:before {
  content: "";
  position: absolute;
  left: 50%;
}
.monitor:before,
.laptop:before {
  top: -0.25em;
  margin: -0.188em 0 0 -0.188em;
  width: 0.25em;
  height: 0.25em;
  border-radius: 0.25em;
  background: #d8dbe1;
}
@media screen and (min-width: 38em) {
  .monitor:before,
  .laptop:before {
    top: -10px;
  }
}
.screen:after {
  width: 8px;
  height: 8px;
  border-radius: 8px;
  bottom: -5px;
  margin: 0 0 -0.25em -0.25em;
  background: #e8ebf0;
}
@media screen and (min-width: 38em) {
  .screen:after {
    bottom: -10px;
  }
}
.content {
  width: 26.25em;
  height: 15em;
  left: 50%;
  margin-left: -13.125em;
  overflow: hidden;
}
.content:before {
  content: "";
  position: absolute;
  right: -90px;
  width: 200px;
  height: 300px;
  transform: rotate(45deg);
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  z-index: 5;
}
.pg {
  width: 240px;
  height: 180px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin: -90px 0 0 -120px;
  background: #ffffff;
  border: 1px solid #e8ebf0;
  border-top: 20px solid #d8dbe1;
  border-radius: 5px;
}
.screen-content {
  overflow: hidden;
  height: 159px;
}
.btns {
  position: absolute;
  top: -20px;
  left: 7px;
}
.btns:before {
  content: "";
  position: absolute;
  left: 35px;
  top: 5px;
  height: 10px;
  width: 185px;
  background: #fff;
  border-radius: 3px;
}
.btns > li {
  display: inline-block;
  list-style: none;
  width: 5px;
  height: 5px;
  border-radius: 5px;
  background: #fc5254;
  margin-right: 4px;
}
.btns li:nth-child(2) {
  background: #fcae52;
}
.btns li:nth-child(3) {
  background: #66b34e;
}
.txt {
  margin: 10px auto;
  width: 85%;
  text-align: center;
  font-size: 0;
}
.txt > li {
  background: #e8ebf0;
  width: 100%;
  height: 15px;
  margin-bottom: 9px;
  font-size: 10px;
}
@media screen and (min-width: 38em) {
  .txt > li {
    font-size: 16px;
  }
}
.txt > li.big {
  height: 60px;
}
.screen .txt > li:nth-child(1) {
  animation: pop 4s 0 linear infinite;
}
.screen .txt > li:nth-child(2) {
  animation: pop 4s 0.2s linear infinite;
}
.screen .txt > li:nth-child(3) {
  animation: pop 4s 0.4s linear infinite;
}
.screen .txt > li:nth-child(4) {
  animation: pop 4s 0.6s linear infinite;
}
.screen .txt > li:nth-child(5) {
  animation: pop 4s 0.8s linear infinite;
}
@keyframes pop {
}
.screen .txt,
.laptop .txt {
  animation: scroll 4s 1s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
}
@keyframes scroll {
  20%,
  60% {
    transform: translateY(-62%);
  }
  80% {
    margin-top: -50px;
  }
}
.txt > .third {
  height: 43px;
  width: 30%;
  margin-right: 5%;
  display: inline-block;
}
.txt > li:nth-child(5),
.txt > li:nth-child(10),
.txt > li:nth-child(13),
.txt > li:nth-child(18),
.txt > li:nth-child(21) {
  margin-right: 0;
}
.base {
  width: 5.625em;
  height: 3.1em;
  bottom: -3.9em;
  left: 50%;
  margin-left: -2.8125em;
  background: #e8ebf0;
}
@media screen and (min-width: 38em) {
  .base {
    bottom: -4.375em;
  }
}
.base:before,
.base:after,
.grey-shadow:before,
.grey-shadow:after {
  content: "";
  position: absolute;
  top: 0;
}
.base:before {
  border-left: 0.813em solid transparent;
  border-right: 0px solid transparent;
  border-bottom: 3.125em solid #e8ebf0;
  left: -0.77em;
}
.base:after {
  border-right: 0.813em solid transparent;
  border-left: 0px solid transparent;
  border-bottom: 3.125em solid #e8ebf0;
  right: -0.77em;
}
.base > div {
  position: absolute;
}
.grey-shadow {
  width: 5.625em;
  height: 0.75em;
  background: #d8dbe1;
  top: 0;
}
.grey-shadow:before {
  border-left: 3px solid transparent;
  border-right: 0px solid transparent;
  border-bottom: 0.75em solid #d8dbe1;
  left: -3px;
}
.grey-shadow:after {
  border-right: 3px solid transparent;
  border-left: 0px solid transparent;
  border-bottom: 0.75em solid #d8dbe1;
  right: -2px;
  z-index: 1;
}
.foot {
  background: #e8ebf0;
}
.foot.top {
  width: 7.25em;
  height: 0.313em;
  bottom: -0.313em;
  left: 50%;
  margin-left: -3.625em;
}
.foot.top:before,
.foot.top:after,
.foot.bottom:before {
  content: "";
  position: absolute;
  top: 0px;
}
.foot.top:before {
  border-left: 16px solid transparent;
  border-right: 0px solid transparent;
  border-bottom: 5px solid #e8ebf0;
  left: -16px;
}
.foot.top:after {
  border-right: 1em solid transparent;
  border-left: 0px solid transparent;
  border-bottom: 5px solid #e8ebf0;
  right: -1em;
}
.foot.bottom {
  width: 9.375em;
  height: 0.313em;
  bottom: -0.625em;
  left: 50%;
  margin-left: -4.688em;
}
.laptop {
  width: 14.688em;
  height: 9.688em;
  background: #f8f8f8;
  border: 0.75em solid #1f1f1f;
  border-radius: 10px 10px 0 0;
  position: absolute;
  bottom: -5em;
  right: 1.875em;
  z-index: 2;
}
.laptop:before {
  top: -6px;
}
.laptop > div {
  position: absolute;
}
.laptop > .content {
  width: 13.188em;
  height: 8.188em;
  left: 0;
  margin-left: 0;
  background: #fff;
}
.txt-laptop {
  width: 11.813em;
}
.txt-laptop > li {
  background: #e8ebf0;
}
.txt-laptop > li:nth-child(2) {
  height: 2.563em;
}
.btm {
  width: 18.5em;
  height: 0.625em;
  bottom: -1.188em;
  left: 50%;
  margin-left: -9.25em;
  border-radius: 0 0 20px 20px;
  background: #e8ebf0;
  z-index: 1;
}
.btm:before {
  content: "";
  position: absolute;
  width: 42px;
  height: 4px;
  left: 50%;
  top: 0;
  margin-left: -21px;
  border-radius: 0 0 5px 5px;
  background: #d8dbe1;
}
.btm:after {
  display: none;
  content: "";
  position: absolute;
  width: 100%;
  height: 0.25rem;
  background: #bababa;
  top: 0.5rem;
  border-bottom-right-radius: 7.5rem 2.5rem;
  border-bottom-left-radius: 7.5rem 2.5rem;
}
.phone {
  width: 4.125em;
  height: 8.75em;
  position: absolute;
  bottom: -5em;
  left: 1em;
  border-radius: 8px;
  background: #1f1f1f;
  border: 1.563em solid #1f1f1f;
  border-left: 0.313em solid #1f1f1f;
  border-right: 0.313em solid #1f1f1f;
}
.phone:before,
.phone:after {
  content: "";
  position: absolute;
  left: 50%;
  background: #474e5d;
}
.phone:before {
  background: #474e5d;
  width: 1.25em;
  height: 0.25em;
  margin-left: -0.625em;
  top: -0.75em;
  border-radius: 2px;
}
.phone:after {
  width: 0.625em;
  height: 0.625em;
  border-radius: 0.625em;
  bottom: -1.125em;
  margin-left: -0.313em;
}
.phone .screen {
  width: 3.5em;
  height: 5.625em;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
.phone .content {
  background: #fff;
  width: 100%;
  height: 21em;
  left: 0%;
  margin-left: 0px;
}
.phone .txt > li {
  height: 1.25em;
}
.txt > li.half {
  width: 44%;
  margin-right: 6%;
  display: inline-block;
}
.txt > li.half:nth-of-type(even) {
  margin-right: 0;
}
.ipad {
  width: 8.75em;
  height: 12.75em;
  position: absolute;
  bottom: -5em;
  left: 6em;
  border-radius: 8px;
  background: #1f1f1f;
  border: 1.563em solid #1f1f1f;
  border-left: 0.313em solid #1f1f1f;
  border-right: 0.313em solid #1f1f1f;
}
.ipad:before,
.ipad:after {
  content: "";
  position: absolute;
  left: 50%;
  background: #474e5d;
}
.ipad:before {
  background: #474e5d;
  width: 1.25em;
  height: 0.25em;
  margin-left: -0.625em;
  top: -0.75em;
  border-radius: 2px;
}
.ipad:after {
  width: 0.625em;
  height: 0.625em;
  border-radius: 0.625em;
  bottom: -1.125em;
  margin-left: -0.313em;
}
.ipad .screen {
  width: 8em;
  height: 9.7em;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
.ipad .content {
  background: #fff;
  width: 100%;
  left: 0%;
  margin-left: 0px;
}
.ipad .half {
  height: 35px;
}
.shadow {
  position: absolute;
  width: 350px;
  height: 15px;
  left: 50%;
  margin-left: -175px;
  z-index: -1;
  bottom: -20px;
}
.laptop .shadow {
  width: 450px;
  margin-left: -225px;
  bottom: -26px;
}
.phone .shadow {
  bottom: -30px;
  margin-left: -50px;
  height: 10px;
  width: 100px;
}
.phone .txt {
  animation: scroll 4s 1s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
}
</style>
