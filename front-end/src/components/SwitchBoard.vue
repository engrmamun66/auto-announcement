

<script setup>
import { provide, inject, ref, computed, watch, onMounted } from 'vue';
import RelaySwitch from './RelaySwitch.vue'
import Modal from './modal.vue'
import Switch from './switch.vue'



let CONFIG = inject('CONFIG');

function arrayChunk(arr, size) {
    const chunkedArr = [];
    for (let i = 0; i < arr.length; i += size) {
        chunkedArr.push(arr.slice(i, i + size));
    }
    return chunkedArr;
}

let allPorts = Array.from({ length: CONFIG.value?.settings?.with_speaker_controls?.switch_count || 16 }, (_, i) => i + 1)
let portChunks = computed(() => arrayChunk(allPorts, 4))

let showModal = ref(true)

</script>


<template>
	<Modal v-model="showModal">
		<template #title>
			<h3>Speaker Control Box</h3>
		</template>
		<div class="switch-area">
			<template v-for="chunk in portChunks">
				<div class="switch-row">
					<template v-for="port in chunk">
						<RelaySwitch :port="port" />
					</template> 
				</div>
			</template>

		</div>

	</Modal>
</template>



<style scoped>
.switch-area .switch-row{
	display: flex;
	justify-content: space-around;
	align-items: center;
	margin: 20px 0;
}
</style>