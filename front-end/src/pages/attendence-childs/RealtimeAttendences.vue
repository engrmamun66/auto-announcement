<template>
    <!-- {{ liveAttendenceList }} -->
    <div class="row">
        <template v-for="item in liveAttendenceList">
            <div class="col-lg-2 col-md-3 col-sm-6">
                <div class="w-100">
                    <label for="">{{ item?.student_id }}</label>
                </div>
            </div> 
        </template>
    </div>
</template>

<script setup>
import moment from 'moment/moment'
import { onMounted, inject, ref, watch, computed, onBeforeUnmount } from 'vue';
import Note from '../../components/note.vue'
import myTable from '../../components/myTable.vue'
import Modal from '../../components/modal.vue' 
import Btn from '../../components/Btn.vue'
import FileUpload from '../../components/FileUpload.vue'
import Switch from '../../components/Switch.vue'
import BtnLoader from '../../components/BtnLoader.vue'
import BarcodeScannigAnimation from '../../components/BarcodeScannigAnimation.vue'
import EmergencyMode from '../../components/EmergencyMode.vue'
import PlayingAnimation from '../../components/PlayingAnimation.vue'
import SwitchBoard from '../../components/SwitchBoard.vue'
import Confirm from '../../components/Confirm.vue'
import helper from '../../utilities/helper';

const log = console.log

const CONFIG = inject('CONFIG');
const classes = inject('classes');
const attendenceList = inject('attendenceList');
const liveAttendenceList = inject('liveAttendenceList');


</script>