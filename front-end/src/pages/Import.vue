<script setup>
import { onMounted, inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Note from '../components/note.vue'
import myTable from '../components/myTable.vue'
import Modal from '../components/modal.vue'
import Barcode from '../components/createBarcode.vue'
import Btn from '../components/Btn.vue'
import FileUpload from '../components/FileUpload.vue'
import BtnLoader from '../components/BtnLoader.vue'


const emitter = inject('emitter');
let http = inject('http'); 
let moment = inject('moment'); 
const helper = inject('helper');
const getAllStudents = inject('getAllStudents');
let loading = ref(false);

const optionalCols = ['id', 'class_short', 'card_no', 'year', 'status', 'sound1', 'created', 'card_owner', 'options', 'note', 'device_index', 'profile_image', 'phone_number'];

async function eraseAll() {
     try {
          let confi = confirm(helper.t('Do you want to delete all students?'))
          if(!confi) return
          let passKey = prompt(helper.t('Type passcode to confirm'))
          if(!['DD', 'dd', 'delete'].includes(passKey)) {
               alert(helper.t('Wrong passcode!'))
               return
          }
          http.get('/students/erase-all').then(response => {
               if(response.status == 200){
                    emitter.emit('toaster-success', {message: helper.t('All students have been deleted')})
               }
               getAllStudents()
          })
     } catch (error) {
          
     }
}


async function exportAll(){
     loading.value = true;
     try {
          let response = await http.get('/students/export', {responseType: "blob"})
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;

          // Set the downloaded file name
          link.setAttribute("download", "students_export.xlsx");

          // Append the link to the document, trigger download, and clean up
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          setTimeout(() => {
               loading.value = false;
          }, 500);

     } catch (error) {
          loading.value = false;
     }
}
 
</script>

<template>
     <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>{{ helper.t('Import Students') }}</h1>
          <div class="right-align" >
               <!-- <Btn v-if="useRoute().query.dev == 'true'" @click="eraseAll" class="red me-1" ><i class='bx bxs-eraser' ></i> {{ helper.t('Delete All Students') }} <BtnLoader v-if="loading"></BtnLoader> </Btn> -->
               <Btn @click="eraseAll" v-if="true" class="red me-1" ><i class='bx bxs-eraser' ></i> {{ helper.t('Delete All Students') }} <BtnLoader v-if="loading"></BtnLoader> </Btn>
               <Btn @click="exportAll" ><i class='bx bxs-file-export' ></i> {{ helper.t('Export All') }} <BtnLoader v-if="loading"></BtnLoader> </Btn>

          </div>
     </div>
     <FileUpload></FileUpload>

     <div class="card mt-4 border-0 shadow-sm">
          <div class="card-header bg-light d-flex align-items-center gap-2">
               <i class='bx bxs-info-circle text-primary fs-5'></i>
               <strong>{{ helper.t('Excel Import Instructions') }}</strong>
          </div>
          <div class="card-body">
               <p class="text-muted small mb-3">
                    <i class='bx bx-check-circle text-success me-1'></i>{{ helper.t('First row must be the header row (column names)') }}<br>
                    <i class='bx bx-check-circle text-success me-1'></i>{{ helper.t('Columns can be in any order') }}
               </p>

               <div class="row g-3">
                    <div class="col-md-4">
                         <div class="p-3 rounded bg-danger bg-opacity-10 h-100">
                              <div class="fw-semibold text-danger mb-2">
                                   <i class='bx bxs-error me-1'></i>{{ helper.t('Required Columns') }}
                              </div>
                              <p class="small text-muted mb-2">{{ helper.t('These 3 columns must exist in the header row:') }}</p>
                              <div class="d-flex flex-wrap gap-1">
                                   <span class="badge bg-danger">name</span>
                                   <span class="badge bg-danger">dakhela</span>
                                   <span class="badge bg-danger">class</span>
                              </div>
                         </div>
                    </div>

                    <div class="col-md-4">
                         <div class="p-3 rounded bg-primary bg-opacity-10 h-100">
                              <div class="fw-semibold text-primary mb-2">
                                   <i class='bx bxs-tag me-1'></i>{{ helper.t('Optional Columns') }}
                              </div>
                              <p class="small text-muted mb-2">{{ helper.t('These columns are optional (include if available):') }}</p>
                              <div class="d-flex flex-wrap gap-1">
                                   <span v-for="col in optionalCols" :key="col" class="badge bg-primary bg-opacity-75">{{ col }}</span>
                              </div>
                         </div>
                    </div>

                    <div class="col-md-4">
                         <div class="p-3 rounded bg-success bg-opacity-10 h-100">
                              <div class="fw-semibold text-success mb-2">
                                   <i class='bx bxs-magic-wand me-1'></i>{{ helper.t('Auto-filled Rules') }}
                              </div>
                              <ul class="small text-muted mb-0 ps-3">
                                   <li>{{ helper.t('class_short — auto resolved from config if not provided') }}</li>
                                   <li>{{ helper.t('year — defaults to current year if empty') }}</li>
                                   <li>{{ helper.t('status — defaults to 1 (active) if empty') }}</li>
                              </ul>
                         </div>
                    </div>
               </div>
          </div>
     </div>

</template>

 
