<template>
  <div>
    <myTable >
      <template #thead>
        <thead>
          <tr> 
            <th>ID</th>
            <th>Name</th>
            <th>Class</th> 
            <th>Shift</th> 
            <th>Remark</th> 
          </tr>
        </thead>
      </template>
      <template #rows>
        <template v-if="tab==1 ? punch_schedules?.length  : call_schedules?.length">
          <template v-for="(item, i) in tab==1 ? punch_schedules  : call_schedules">
            <tr @click="helper.log(item)">
                
              <td> {{ item.title }} </td> 
              <td> {{ helper.formatTime(item.start_time) }} </td>                   
              <td> {{ helper.formatTime(item.end_time) }} </td>                   
              <td>
                <ul v-if="item.classes">
                  <template v-if="item.showClasses">
                    <li> <a @click.stop.prevent="item.showClasses = false" href="#">Less...</a> </li>
                    <li v-for="cls in item.classes">
                      {{ cls.class_name }}
                    </li>
                  </template>
                  <template v-else>
                    <li> 
                      <a @click.stop.prevent="item.showClasses = true" class="ms-1" href=""> More...</a>   
                    </li>
                    <li>  
                      <a > {{ item.classes.length == 16 ? 'All' :  item.classes.length }} Classes</a>  
                    </li>
                  </template>
                </ul>
              </td>                   
        
              <td> 
                <div class="d-flex justify-content-center">
                

                  <span tooltip="Update Schedule" class="me-2">
                    <i @click.stop="prepareEdit(item)" class='bx bx-pencil text-danger cp' ></i>
                  </span>
                  <span tooltip="Delete Schedule">
                    <i @click.stop="deleteSchedule(item.id, i, item.type)" class='bx bx-trash text-danger cp' ></i>
                  </span>
      
                </div>
              </td> 
          </tr> 

          
          
          </template>
        </template>
        <template v-else>
          <tr>
              <td colspan="88" class="text-center">No student found</td>                 
          </tr>
        </template>
      </template>
    </myTable> 
  </div>
</template>

<script setup>
import { inject, ref, onMounted, onBeforeUnmount } from "vue";
import Ahelper from "./attendacnceHelper";

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const all_students = inject("all_students");
const callbacks = inject("callbacks");
const attendenceList = inject("attendenceList");
const attendenceParams = inject("attendenceParams", ref({
  "page_no": 1,
  "total": 3,
  "totalPages": 1,
  "limit": 50,
  }
));
const liveAttendenceList = inject("liveAttendenceList");
import myTable from '../../components/myTable.vue'

let log = console.log

const LateConsider = CONFIG.value?.settings?.attendance?.not_late_consider || [ 0, 'minutes']
let isMounted = ref(false)

const getStudent = ({ student_id }) =>
  all_students.value.find((std) => std.dakhela == student_id);

onMounted(()=>{

  callbacks.getAttendeceList()
  
  setTimeout(() => {
    isMounted.value = true
  }, 500);
})

</script>

<style scoped>
.attendance-card {
  background: #fff;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  border: 1px solid #e2e2e2;
  transition: all 0.25s ease;
  color: #333;
  padding-top: 40px;
}

.attendance-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.student-name{
  margin-bottom: 10px;
  font-weight: 700;
  border: 1px solid;
  border-bottom: 2px double;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  width: 100%;
  text-align: center;
}

.status-present {
  background-color: #198754; /* Bootstrap success green */
  color: #fff !important;
}

.status-absent {
  background-color: #dc3545; /* Bootstrap danger red */
  color: #fff !important;
}

.status-outtime {
  background-color: #0095b7; /* Bootstrap danger red */
  color: #fff !important;
}

.status-present .badge,
.status-absent .badge {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
}

.remarks {
  border-top: 1px dashed rgba(255, 255, 255, 0.4);
  padding-top: 6px;
  font-style: italic;
}

.no-data-card {
  min-height: 250px;
  background-color: #f8f9fa;
  border: 1px dashed #ccc;
}
span[status]{
  background-color: rgba(255, 255, 255, 0.161);
    padding: 1px 8px 3px 6px;
    border-radius: 6px;
    color: #ffffff;
    transform: translateY(-2px);
    border: 1px solid white;
}
.popup{
    position: absolute;
    padding: 5px 15px;
    text-align: center;
    background-color: rgb(255, 255, 255);
    border-radius: 0px 0px 5px 5px;
    top: 1px;
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.489), inset 1px 1px 0px rgba(0, 0, 0, 0.175);
    z-index: 1;
  } 
.popup.in-out{  
    left: 50%;
    top: 1px;
    transform: translateX(-50%);
    border-radius: 0px 0px 5px 5px;
} 
li{
  margin-bottom: 6px;
}
</style>
