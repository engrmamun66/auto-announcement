<template>
    <div class="topnav bg3" id="myTopnav">
        <a class="madrasha-title" href="#">
            রাশাদ মহিলা মাদ্রাসা
        </a>
        <a href="#" class="active">Home <i class="fa fa-home" aria-hidden="true"></i></a>
        <a href="#">Blog <i class="fa fa-book"></i></a>
        <a href="#">Contact <i class="fa fa-envelope"></i></a>
        <a href="#">About <i class="fa fa-user"></i></a>
        <div class="right-lnk">
            <a href="#">Login</a>
        </div>
        <a href="javascript:void(0);" class="icon" @click="toggleMenu">
            <i class="fa fa-bars"></i>
        </a>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const isResponsive = ref(false);

const toggleMenu = () => {
  isResponsive.value = !isResponsive.value;
};
</script>

<style scoped>
.madrasha-title {
    background: linear-gradient(180deg, #002767b2 0%, #002767 9%, #316cd9d6 50%, #16188fd6 100%);
    color: yellow;
    font-size: 17px;
    text-shadow: 1px 2px 2px rgb(0, 0, 0);
    margin-right: 10px;
}

.topnav {
  overflow: hidden;
  background-color: #333; /* Add background color */
}

.topnav a {
  float: left;
  display: block;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 33px;
  text-decoration: none;
  font-size: 17px;
  font-weight: bold;
  position: relative;
}

.topnav a:active {
  background-color: #ffffffa7 !important;
  color: rgb(240, 237, 84);
}

.topnav a:hover {
  background-color: #ffffff21;
  color: rgb(240, 237, 84);
}

.topnav a.active:not(.madrasha-title)::after,
.topnav a:not(.madrasha-title):hover::after {
  position: absolute;
  content: '';
  bottom: 0px;
  left: 0px;
  height: 2px;
  width: 100%;
  background-color: rgb(255, 255, 255);
}

.topnav .icon {
  display: none;
}

.topnav.responsive {
  position: relative;
}

.topnav.responsive .icon {
  display: block;
  float: right;
  position: absolute;
  top: 0;
  right: 0;
}

.topnav.responsive a {
  float: none;
  display: block;
  text-align: left;
}

.right-lnk {
  float: right;
}

@media screen and (max-width: 600px) {
  .topnav a:not(:first-child) {
    display: none;
  }

  .topnav.responsive a {
    display: block;
    text-align: left;
  }

  .topnav.responsive .icon {
    display: block;
  }

  .topnav.responsive a.active {
    display: block;
  }
}
</style>
