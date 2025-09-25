

<script setup>
import { provide, inject, ref, computed, watch, onMounted } from 'vue';
import RelaySwitch from './RelaySwitch.vue'
import Modal from './modal.vue'
import Switch2 from './switch2.vue'
const getConfig = inject('getConfig');
const controlSounds = inject('controlSounds');


let emits = defineEmits(['close'])



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

 


</script>


<template>
	<Modal v-model="showModal" :closeIconInOutside="true" @close="$emit('close')">
		<template #title>
			<div class="d-flex justify-content-between">
				<h3>Speaker Control Box</h3>
				<Switch2 v-model="switch_mode" style="zoom: 0.7" yes="Auto" no="Manual" size="lg" @change="log('changed')" ></Switch2>
			</div>
		</template>


		<div class="d-flex">
			<button @click.stop="openAll" class="open-closer opener">Open All</button>
			<button @click.stop="closeAll" class="open-closer closer ms-2">Close All</button> 
		</div>


		<div class="switch-area">
			<div v-if="CONFIG?.settings?.with_speaker_controls?.switch_mode === 'auto'" class="overlay-area"> </div>
			<template v-for="chunk in portChunks">
				<div class="switch-row">
					<template v-for="item in chunk">
						<RelaySwitch :port="item.port" v-model="item.status" @change="onChangeRelaySwitch" />
					</template> 
				</div>
			</template>
		</div>

	</Modal>
</template>



<style scoped>
.switch-area {
	position: relative;
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
 
.switch-area .switch-row{
	display: flex;
	justify-content: space-around;
	align-items: center;
	margin-bottom: 20px;
}
.open-closer{
    cursor: pointer !important;
    margin-top: 10px;
    padding: 4px 20px;
    background-color: #e1e1e1;
    background-color: #e9ecef;
    border-radius: 6px;
	border: none;
	box-shadow: 0px 0px 0px black;
}
.open-closer:hover{
	box-shadow: 0px 5px 7px rgba(0, 0, 0, 0.281); 
}
.open-closer.opener{
    border-bottom: 2px solid green;
}
.open-closer.closer{
    border-bottom: 2px solid rgb(255, 0, 0);
}
</style>