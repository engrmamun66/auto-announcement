<script setup>
import { values } from 'lodash';
import { ref, watch, inject, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router'


let route = useRoute()
let router = useRouter()

let expand = ref(true);
let activeMenu = ref('Home'); 

let helper = inject('helper')
let version = inject('version'); 

if(expand.value) document.body.classList.add('expander')
watch(expand, (nVal, oVal)=>{
    if(nVal) document.body.classList.add('expander')
    else document.body.classList.remove('expander')
})


let menuItems = ref([
    {
        group: true,
        name: 'General',
    },
    {
        name: 'Initialize',
        path: { name: 'home', params: { version }},
        iconClass: 'bx bx-grid-alt nav-icon',
        badge: { clasName: 'warning', text: '3' },
        childs: [
            {
                name: 'Child -1',
                path: '/',
            },
            {
                name: 'Child -2',
                path: '/',
            },
        ]
    },
    {
        name: 'Options',
        path: { name: 'contact', params: { version }},
        iconClass: 'bx bx-grid-alt nav-icon',
        badge: { clasName: 'warning', text: '3' },
        childs: [
            {
                name: 'Child -1',
                path: '/',
            },
            {
                name: 'Child -2',
                path: '/',
            },
        ]
    },
     
    
])

let VERSIONS = inject('VERSIONS');

function onChangeVersion({target: {value: version}}){ 
  helper.localStorage('version').value = version;
  router.replace({path: `/${version}`})
  console.log({version});
  setTimeout(() => {
    window.location.reload()
  }, 0);
}

function toggleLoopItem (data, index, key = "expand") {
  if (!data) return;
  data?.forEach((item, i) => {
    if (i == index) {
      item[key] = !(item[key] ?? false);
    } else {
      item[key] = false;
    }
  });
}


</script>

<template>

 
<div class="page-wrapper emdoc-theme" :class="{'toggled': expand}">
  <a id="show-sidebar" @click="expand = true" class="btn btn-sm btn-dark" href="#">
    <i class="bx bx-menu"></i>
  </a>
  <nav id="sidebar" class="sidebar-wrapper">
    <div class="sidebar-content">
      <div class="sidebar-brand">
        <a href="#">EM Date Time Picker</a>
        <div id="close-sidebar" @click="expand = false">
          <i class='bx bx-left-arrow-circle' ></i>
        </div>
      </div>
      <div class="sidebar-header d-flex align-items-center">
        <div class="user-pic">
          <img class="img-responsive img-rounded" src="../assets/img/calendar.png"
            alt="User picture">
        </div>
        <div class="version-display-area">
          <span class="user-name">Documentaion </span> 
          <strong>{{ version }} 
            <span v-if="VERSIONS.at(-1) === version" class="badge badge-success">Latest</span> 
            <span v-else class="badge badge-warning">Older</span> 
          </strong>
        </div>
      </div>
      <!-- sidebar-header  -->
      <div class="sidebar-search">
        <div>
          <div class="input-group">
            <select class="form-control" :value="version" @change="onChangeVersion" >
                <option v-for="ver in VERSIONS" :values="ver">{{ ver }}</option>
              </select>
          </div>
        </div>
      </div>
      
      <div class="sidebar-menu">
        <ul>
            <template v-for="(item, i) in menuItems" :key="i">
                <template v-if="item?.group">
                    <li class="header-menu">
                        <span>{{ item.name }}</span>
                    </li>
                </template>
                <template v-else>
                    <li class="sidebar-dropdown" :class="{'active': item?.expand}" >
                        <router-link :to="item.path" @click.stop="toggleLoopItem(menuItems, i); ">
                            <i :class="[item.iconClass]"></i>
                            <span>{{ item.name }}  </span>
                            <span v-if="item?.badge" class="badge badge-pill" :class="[`badge-${item.badge?.clasName}`]" >
                                {{ item.badge?.title }}
                            </span>
                        </router-link>
                        <template v-if="item?.childs?.length">
                            <div class="sidebar-submenu" :class="{'show-childs': item?.expand}" >
                                <ul>
                                    <template v-for="cItem in item.childs">
                                        <li>
                                            <a href="#"> {{ cItem.name }}
                                                <span class="badge badge-pill badge-success">Pro</span>
                                            </a>
                                        </li>
                                    </template>
                                </ul>
                            </div>
                        </template>
                    </li>
                </template>
            </template>
        </ul>
      </div> 
    </div>
    <!-- sidebar-Footer  -->
    <div class="sidebar-footer">
      <a href="#">
        <i class='bx bxs-bell' ></i>
        <span class="badge badge-pill badge-warning notification">3</span>
      </a>
      <a href="#">
        <i class='bx bxs-envelope' ></i>
        <span class="badge badge-pill badge-success notification">7</span>
      </a>
      <a href="#">
        <i class='bx bxs-cog' ></i>
        <span class="badge-sonar"></span>
      </a>
      <a href="#">
        <i class="bx bx-power-off"></i>
      </a>
    </div>
  </nav> 
  <main class="page-content">
    <div class="container-fluid">
      <slot>
        <h1>BODY CONTENTS</h1>
      </slot>
    </div>
  </main> 
</div> 

</template>

<style>
@keyframes swing {
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(10deg);
  }
  30% {
    transform: rotate(0deg);
  }
  40% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(0deg);
  }
  60% {
    transform: rotate(5deg);
  }
  70% {
    transform: rotate(0deg);
  }
  80% {
    transform: rotate(-5deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes sonar {
  0% {
    transform: scale(0.9);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
 
.page-wrapper .sidebar-wrapper,
.sidebar-wrapper .sidebar-brand > a,
.sidebar-wrapper .sidebar-dropdown > a:after,
.sidebar-wrapper .sidebar-menu .sidebar-dropdown .sidebar-submenu li a:before,
.sidebar-wrapper ul li a i,
.page-wrapper .page-content,
.sidebar-wrapper .sidebar-search .input-group-text,
.sidebar-wrapper .sidebar-menu ul li a,
#show-sidebar,
#close-sidebar {
  -webkit-transition: all 0.3s ease;
  -moz-transition: all 0.3s ease;
  -ms-transition: all 0.3s ease;
  -o-transition: all 0.3s ease;
  transition: all 0.3s ease;
}

/*----------------page-wrapper----------------*/

.page-wrapper {
  height: 100vh;
}

.page-wrapper .theme {
  width: 40px;
  height: 40px;
  display: inline-block;
  border-radius: 4px;
  margin: 2px;
}

.page-wrapper .theme.emdoc-theme {
  background: #1e2229;
}

/*----------------toggeled sidebar----------------*/

.page-wrapper.toggled .sidebar-wrapper {
  left: 0px;
}

@media screen and (min-width: 768px) {
  .page-wrapper.toggled .page-content {
    padding-left: 300px;
  }
}
/*----------------show sidebar button----------------*/
#show-sidebar {
  position: fixed;
  left: 0;
  top: 10px;
  border-radius: 0 4px 4px 0px;
  width: 35px;
  transition-delay: 0.3s;
}
.page-wrapper.toggled #show-sidebar {
  left: -40px;
}
/*----------------sidebar-wrapper----------------*/

.sidebar-wrapper {
  width: 260px;
  height: 100%;
  max-height: 100%;
  position: fixed;
  top: 0;
  left: -300px;
  z-index: 999;
}

.sidebar-wrapper ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar-wrapper a {
  text-decoration: none;
}

/*----------------sidebar-content----------------*/

.sidebar-content {
  max-height: calc(100% - 30px);
  height: calc(100% - 30px);
  overflow-y: auto;
  position: relative;
}

.sidebar-content.desktop {
  overflow-y: hidden;
}

/*--------------------sidebar-brand----------------------*/

.sidebar-wrapper .sidebar-brand {
  padding: 10px 20px;
  display: flex;
  align-items: center;
}

.sidebar-wrapper .sidebar-brand > a {
  text-transform: uppercase;
  font-weight: bold;
  flex-grow: 1;
}

.sidebar-wrapper .sidebar-brand #close-sidebar {
  cursor: pointer;
  font-size: 20px;
}
/*--------------------sidebar-header----------------------*/

.sidebar-wrapper .sidebar-header {
  padding: 20px;
  overflow: hidden;
}

.sidebar-wrapper .sidebar-header .user-pic {
  float: left;
  width: 60px;
  padding: 2px;
  border-radius: 12px;
  margin-right: 15px;
  overflow: hidden;
}

.sidebar-wrapper .sidebar-header .user-pic img {
  object-fit: cover;
  height: 100%;
  width: 100%;
}

.sidebar-wrapper .sidebar-header .version-display-area {
  display: flex;
  align-items: start;
  flex-direction: column;
}

/*-----------------------sidebar-search------------------------*/

.sidebar-wrapper .sidebar-search > div {
  padding: 10px 20px;
}

/*----------------------sidebar-menu-------------------------*/

.sidebar-wrapper .sidebar-menu {
  padding-bottom: 10px;
}

.sidebar-wrapper .sidebar-menu .header-menu span {
  font-weight: bold;
  font-size: 14px;
  padding: 15px 20px 5px 20px;
  display: inline-block;
}

.sidebar-wrapper .sidebar-menu ul li a {
  display: inline-block;
  width: 100%;
  text-decoration: none;
  position: relative;
  padding: 8px 30px 8px 20px;
}

.sidebar-wrapper .sidebar-menu ul li a i {
  margin-right: 10px;
  font-size: 12px;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 4px;
}

.sidebar-wrapper .sidebar-menu ul li a:hover > i::before {
  display: inline-block;
  animation: swing ease-in-out 0.5s 1 alternate;
}

.sidebar-wrapper .sidebar-menu .sidebar-dropdown > a:after {
  font-family: "boxicons";
  font-weight: 900;
  content: "\ea50";
  font-style: normal;
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: 0 0;
  position: absolute;
  right: 15px;
  top: 14px;
}

.sidebar-wrapper .sidebar-menu .sidebar-dropdown.active > a:after {
    transform: rotate(90deg);
    right: 17px;
}

.sidebar-wrapper .sidebar-menu .sidebar-dropdown .sidebar-submenu {
    transition: all 0.4s;
    height: 0px;
    overflow: hidden;
}

.sidebar-wrapper .sidebar-menu .sidebar-dropdown .sidebar-submenu.show-childs {
    height: auto;
    pointer-events: all;
}

.sidebar-wrapper .sidebar-menu .sidebar-dropdown .sidebar-submenu ul {
  padding: 5px 0;
}

.sidebar-wrapper .sidebar-menu .sidebar-dropdown .sidebar-submenu li {
  padding-left: 25px;
  font-size: 13px;
}

.sidebar-wrapper .sidebar-menu .sidebar-dropdown .sidebar-submenu li a:before {
  content: "\ea5c";
  font-family: "boxicons";
  font-weight: 400;
  font-style: normal;
  display: inline-block;
  text-align: center;
  text-decoration: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-right: 10px;
  font-size: 8px;
}

.sidebar-wrapper .sidebar-menu ul li a span.label,
.sidebar-wrapper .sidebar-menu ul li a span.badge {
  float: right;
  margin-top: 8px;
  margin-left: 5px;
}

.sidebar-wrapper .sidebar-menu .sidebar-dropdown .sidebar-submenu li a .badge,
.sidebar-wrapper .sidebar-menu .sidebar-dropdown .sidebar-submenu li a .label {
  float: right;
  margin-top: 0px;
}


.sidebar-wrapper .sidebar-menu .sidebar-dropdown.active > a:after {
  transform: rotate(90deg);
  right: 17px;
}

/*--------------------------side-footer------------------------------*/

.sidebar-footer {
  position: absolute;
  width: 100%;
  bottom: 0;
  display: flex;
}

.sidebar-footer > a {
  flex-grow: 1;
  text-align: center;
  height: 30px;
  line-height: 30px;
  position: relative;
}

.sidebar-footer > a .notification {
  position: absolute;
  top: 0;
}

.badge-sonar {
  display: inline-block;
  background: #980303;
  border-radius: 50%;
  height: 8px;
  width: 8px;
  position: absolute;
  top: 0;
}

.badge-sonar:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  border: 2px solid #980303;
  opacity: 0;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  animation: sonar 1.5s infinite;
}

/*--------------------------page-content-----------------------------*/

.page-wrapper .page-content {
  display: inline-block;
  width: 100%;
  padding-left: 0px;
  padding-top: 20px;
}

 
.page-wrapper .page-content {
  overflow-x: hidden;
}

/*------scroll bar---------------------*/

::-webkit-scrollbar {
  width: 5px;
  height: 7px;
}
::-webkit-scrollbar-button {
  width: 0px;
  height: 0px;
}
::-webkit-scrollbar-thumb {
  background: #525965;
  border: 0px none #ffffff;
  border-radius: 0px;
}
::-webkit-scrollbar-thumb:hover {
  background: #525965;
}
::-webkit-scrollbar-thumb:active {
  background: #525965;
}
::-webkit-scrollbar-track {
  background: transparent;
  border: 0px none #ffffff;
  border-radius: 50px;
}
::-webkit-scrollbar-track:hover {
  background: transparent;
}
::-webkit-scrollbar-track:active {
  background: transparent;
}
::-webkit-scrollbar-corner {
  background: transparent;
}

/*-----------------------------emdoc-theme-------------------------------------------------*/

.emdoc-theme .sidebar-wrapper {
  background: #31353d;
}

.emdoc-theme .sidebar-wrapper .sidebar-header,
.emdoc-theme .sidebar-wrapper .sidebar-search,
.emdoc-theme .sidebar-wrapper .sidebar-menu {
  border-top: 1px solid #3a3f48;
}

.emdoc-theme .sidebar-wrapper .sidebar-search .input-group-text {
  border-color: transparent;
  box-shadow: none;
}

.emdoc-theme .sidebar-wrapper .sidebar-header .version-display-area .user-role,
.emdoc-theme .sidebar-wrapper .sidebar-header .version-display-area .user-status,
.emdoc-theme .sidebar-wrapper .sidebar-search .input-group-text,
.emdoc-theme .sidebar-wrapper .sidebar-brand > a,
.emdoc-theme .sidebar-wrapper .sidebar-menu ul li a,
.emdoc-theme .sidebar-footer > a {
  color: #818896;
}

.emdoc-theme .sidebar-wrapper .sidebar-menu ul li:hover > a,
.emdoc-theme .sidebar-wrapper .sidebar-menu .sidebar-dropdown.active > a,
.emdoc-theme .sidebar-wrapper .sidebar-header .version-display-area,
.emdoc-theme .sidebar-wrapper .sidebar-brand > a:hover,
.emdoc-theme .sidebar-footer > a:hover i {
  color: #b8bfce;
}

.page-wrapper.emdoc-theme.toggled #close-sidebar {
  color: #bdbdbd;
}

.page-wrapper.emdoc-theme.toggled #close-sidebar:hover {
  color: #ffffff;
}

.emdoc-theme .sidebar-wrapper ul li:hover a i,
.emdoc-theme
  .sidebar-wrapper
  .sidebar-dropdown
  .sidebar-submenu
  li
  a:hover:before,
.emdoc-theme .sidebar-wrapper .sidebar-search input.search-menu:focus + span,
.emdoc-theme .sidebar-wrapper .sidebar-menu .sidebar-dropdown.active a i {
  color: #16c7ff;
  text-shadow: 0px 0px 10px rgba(22, 199, 255, 0.5);
}

.emdoc-theme .sidebar-wrapper .sidebar-menu ul li a i,
.emdoc-theme .sidebar-wrapper .sidebar-menu .sidebar-dropdown div,
.emdoc-theme .sidebar-wrapper .sidebar-search .form-control {
  background: #3a3f48;
}
.emdoc-theme .sidebar-wrapper .sidebar-search .form-control {
  color: white;
  border: 1px solid #484848;
}

.emdoc-theme .sidebar-wrapper .sidebar-menu .header-menu span {
  color: #6c7b88;
}

.emdoc-theme .sidebar-footer {
  background: #3a3f48;
  box-shadow: 0px -1px 5px #282c33;
  border-top: 1px solid #464a52;
}

.emdoc-theme .sidebar-footer > a:first-child {
  border-left: none;
}

.emdoc-theme .sidebar-footer > a:last-child {
  border-right: none;
}


</style>