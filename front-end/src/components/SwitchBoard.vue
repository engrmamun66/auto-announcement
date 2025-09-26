

<script setup>
import { provide, inject, ref, computed, watch, onMounted } from 'vue';
import RelaySwitch from './RelaySwitch.vue'
import Modal from './modal.vue'
import Switch2 from './switch2.vue'
const getConfig = inject('getConfig');
const controlSounds = inject('controlSounds');
const switches_PreviewInHomePage = inject('switches_PreviewInHomePage');
import helper from './../utilities/helper/index'

let props = defineProps({
	viewType: {
		type: String,
		default: 'modal' // or 'inline'
	}
 
})


let emits = defineEmits(['close'])
let emitter = inject('emitter');



let CONFIG = inject('CONFIG');

function arrayChunk(arr, size) {
    const chunkedArr = [];
    for (let i = 0; i < arr.length; i += size) {
		let port_chunk = arr.slice(i, i + size)
        chunkedArr.push(portObject(port_chunk));
    }
    return chunkedArr;
}
function portObject(port_chunk) {
    return port_chunk.map(port => ({ port, status: 1 }));
}

let allPorts = Array.from({ length: CONFIG.value?.settings?.with_speaker_controls?.switch_count || 16 }, (_, i) => i + 1)
let switch_board_chunk_size = CONFIG.value?.settings?.with_speaker_controls?.switch_board_chunk_size || 8
let portChunks = ref(arrayChunk(allPorts, switch_board_chunk_size))


// Checking for manually opened ports in localStorage
if(localStorage.getItem('manually_opened_ports')){
	let manually_opened_ports = JSON.parse(localStorage.getItem('manually_opened_ports'))
	portChunks.value.forEach(chunk => {
		chunk.forEach(item => {
			if(manually_opened_ports.includes(item.port)){
				item.status = 1
			}else{
				item.status = 0
			}
		})
	})
	controlSounds({ports: manually_opened_ports})
}


let showModal = ref(true)
 
const log = console.log

let switch_mode = ref(CONFIG.value?.settings?.with_speaker_controls?.switch_mode === 'auto')

watch(switch_mode, (newVal) => {
	getConfig({switch_mode: newVal ? 'auto' : 'manual'});
});

async function onChangeRelaySwitch(){
	let manually_opened_ports = portChunks.value.map(chunk => chunk.filter(item => item.status).map(item => item.port)).flat()
	localStorage.setItem('manually_opened_ports', JSON.stringify(manually_opened_ports))
	controlSounds({ports: manually_opened_ports})
}

async function openAll(){
	portChunks.value.forEach(chunk => {
		chunk.forEach(item => {
			item.status = 1
		})
	})
	onChangeRelaySwitch()
}
async function closeAll(){
	portChunks.value.forEach(chunk => {
		chunk.forEach(item => {
			item.status = 0
		})
	})
	onChangeRelaySwitch()
}


function onChange_switches_PreviewInHomePage(event){
	setTimeout(() => {
		switches_PreviewInHomePage.value = event.target.checked
	}, 5);
}


let tartgetItemOrStudent = ref(null)

emitter.on('palylist__currentItem', (currentItem) => {
	tartgetItemOrStudent.value = currentItem
})
 
let tab = ref(1)


</script>


<template>

	<template v-if="viewType === 'modal'">
		<Modal v-model="showModal" :closeIconInOutside="true" @close="$emit('close')">
			<template #title>
				<div class="d-flex justify-content-between">
					<h3>Sitches Control Box</h3>
					<Switch2 v-model="switch_mode" style="zoom: 0.7" yes="Auto" no="Manual" size="lg" @change="log('changed')" ></Switch2>
				</div>
			</template>
	
	
			<div class="d-flex justify-content-between align-items-center">
				<div class="d-flex">
					<button @click.stop="openAll" class="open-closer opener" :disabled="CONFIG?.settings?.with_speaker_controls?.switch_mode === 'auto'">Open All</button>
					<button @click.stop="closeAll" class="open-closer closer ms-2" :disabled="CONFIG?.settings?.with_speaker_controls?.switch_mode === 'auto'">Close All</button> 
				</div>
				<div class="d-flex mt-3">
					<div class="form-check">
						<input type="checkbox" value="" id="flexCheckDefault" @click="onChange_switches_PreviewInHomePage" :checked="onChange_switches_PreviewInHomePage">
						<label class="form-check-label ms-2" for="flexCheckDefault">
							Preview In Home Page
						</label>
						</div>
				</div>
			</div>
	
	
			<div class="switch-area">
				<div v-if="CONFIG?.settings?.with_speaker_controls?.switch_mode === 'auto'" class="overlay-area"> </div>
				<template v-for="chunk in portChunks">
					<div class="switch-row no-wrape">
						<template v-for="item in chunk">
							<RelaySwitch :port="item.port" v-model="item.status" @change="onChangeRelaySwitch" />
						</template> 
					</div>
				</template>
			</div>
	
		</Modal>
	</template>
	<template v-else-if="viewType === 'home'">
 
		<!-- <ul class="nav nav-tabs mb-3">
			<li class="nav-item">
				<a @click.stop="tab = 1" class="nav-link cp text-black" :class="{'active': tab==1}" >Switches</a>
			</li>
			<li class="nav-item">
				<a @click.stop="tab = 2" class="nav-link cp text-black" :class="{'active': tab==2}" >Classes</a>
			</li> 
			
		</ul>  -->
		<div class="d-flex justify-content-between align-items-center">
			<h4>SWITCHES ACTIVITY</h4>
			<!-- <button class="modeof-switch">{{ helper.ucfirst(CONFIG?.settings?.with_speaker_controls?.switch_mode) }}</button> -->
			<Switch2 v-model="switch_mode" style="zoom: 0.7" yes="Auto" no="Manual" size="lg" @change="log('changed')" ></Switch2>
		</div>
		<div class="switch-area">

			
			<div class="d-flex justify-content-between align-items-center gap-2">
				<div class="d-flex">
					<button @click.stop="openAll" class="open-closer opener" :disabled="CONFIG?.settings?.with_speaker_controls?.switch_mode === 'auto'">Open&nbsp;All</button>
					<button @click.stop="closeAll" class="open-closer closer ms-2" :disabled="CONFIG?.settings?.with_speaker_controls?.switch_mode === 'auto'">Close&nbsp;All</button> 
				</div>
				<div class="d-flex">
					
				</div>
			</div>

			<h4 class="mt-3" v-if="tartgetItemOrStudent">{{ tartgetItemOrStudent?.name }}</h4>


			<div v-if="CONFIG?.settings?.with_speaker_controls?.switch_mode === 'auto'" class="overlay-area"> </div>
			<template v-for="chunk in portChunks">
				<div class="switch-row">
					<template v-for="item in chunk">
						<RelaySwitch :port="item.port" v-model="item.status" @change="onChangeRelaySwitch" :disabled="false" />
					</template> 
				</div>
			</template>

			<h4 class="text-uppercase mb-3">Classes with Speakers ports</h4>

			<div class="classes-row" v-for="x in 1">
				<template v-for="eachClass in CONFIG.classes">
					<button class="each-class" @click.stop="controlSounds({ports: eachClass?.speaker_ports})">
						{{ eachClass.class_name }} <span class="class-ports">{{ eachClass?.speaker_ports }}</span>
					</button>
				</template> 
			</div>

		</div>  
	</template>
</template>



<style scoped>
.switch-area {
	position: relative;
}
.switch-area *{
	user-select: none;
}
.switch-area .overlay-area{
	position: absolute;
	width: 100%;
	height: 100%;
	/* background-color: rgba(0, 0, 0, 0.075); */
	backdrop-filter: blur(0px);
	top: 0px;
	left: 0px;
	z-index: 11;
	text-align: center;
	cursor: not-allowed;
}
 
.switch-area .switch-row,
.switch-area .classes-row{
	display: flex;
	justify-content: space-around;
	align-items: center;
	margin-bottom: 20px;
	flex-wrap: wrap;
}
.switch-area .switch-row.no-wrape,
.switch-area .classes-row.no-wrape
{ 
	flex-wrap: nowrap;
}
.switch-area .classes-row{
	justify-content: flex-start; 
	gap: 5px;
}
.switch-area .classes-row .each-class{
	justify-content: flex-start;
	border: 1px solid gray;
	padding: 10px;
	background-color: white;
	border-radius: 10px;
	cursor: pointer;
}

.switch-area .classes-row .each-class .class-ports{
	background-color: #dcf7fd;
	border-radius: 6px;
	padding: 4px 5px;
}
 
.open-closer{
	margin-top: 10px;
    padding: 4px 20px;
    background-color: #e1e1e1;
    background-color: #e9ecef;
    border-radius: 6px;
	border: none;
	box-shadow: 0px 0px 0px black;
	transition: all 0.2s ease;
}
.open-closer:not(:disabled):hover{
	cursor: pointer;
	box-shadow: 0px 5px 7px rgba(0, 0, 0, 0.281); 
}
.open-closer.opener{
    border-bottom: 2px solid green;
}
.open-closer.closer{
    border-bottom: 2px solid rgb(255, 0, 0);
}
.open-closer.opener:disabled{
    border-bottom: 2px solid rgba(0, 128, 0, 0.22);
}
.open-closer.closer:disabled{
    border-bottom: 2px solid rgba(255, 0, 0, 0.22);
}
.modeof-switch{
	border: none;
	border-radius: 20px;
	background-color: red;
	color: white;
	padding: 2px 15px;
}

</style>