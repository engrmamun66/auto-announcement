<template>
    <div class="topnav bg3" id="myTopnav">
        <a class="madrasha-title" href="#">
            <img ref="logoEl" id="LOGO" src="" style="width: 200px;">
        </a>
        <RouterLink :to="{name: 'home'}" :class="{'active': route.name === 'home'}"><i class='bx bxs-home'></i> Dashboard</RouterLink>
        <RouterLink :to="{name: 'students'}" :class="{'active': route.name === 'students'}"><i class='bx bxs-user'></i> Students</RouterLink>
        <RouterLink :to="{name: 'shedules'}" :class="{'active': route.name === 'shedules'}"><i class='bx bxs-calendar' ></i> Shedules</RouterLink>
        <RouterLink :to="{name: 'import'}" :class="{'active': route.name === 'import'}"><i class='bx bxs-file-import' ></i> Import</RouterLink>
        
        <!-- <div class="right-lnk">
            <a v-if="loggedIn" href="#">
              Logout <i class='bx bxs-log-in' ></i>
            </a>
            <a v-else href="#">
              <i class='bx bxs-user' ></i> Admin
            </a>
        </div>
        --> 
    </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';


let logoEl = ref(null)
let route = useRoute()
let loggedIn = ref(false)

const emitter = inject('emitter');
const is_started_schedule = inject('is_started_schedule');
const isResponsive = ref(false);

const toggleMenu = () => {
  isResponsive.value = !isResponsive.value;
};

onMounted(()=>{
  if(typeof GLOBAL_DATA !== 'undefined'){
    if(GLOBAL_DATA?.logo){
      logoEl.value.src = GLOBAL_DATA.logo
    }
  }
})


</script>

<style scoped>
.madrasha-title {
  background: #f8f9fa;
  color: #ff0;
  font-size: 17px;
  text-shadow: 1px 2px 2px rgb(0,0,0);
  margin-right: 10px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.topnav {
  padding-left: 20px;
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

.topnav a:not(.madrasha-title):active {
  background-color: #ffffffa7 !important;
  color: rgb(240, 237, 84);
}

.topnav a:not(.madrasha-title):hover {
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
