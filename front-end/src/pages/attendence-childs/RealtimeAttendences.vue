<template>
  <!-- Attendance Cards -->
  <div class="px-2">
    <template v-if="liveAttendenceList?.length">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            <template v-for="(item, i) in liveAttendenceList" :key="i">
            <div class="col" :style="`order:${-i}`">
                <div class="attendance-card shadow-sm" :class="{
                    'status-present': item?.status?.toLowerCase() === 'present',
                    'status-absent': item?.status?.toLowerCase() !== 'present',
                }"
                >
                <div class="d-flex justify-content-between align-items-center mb-2" >
                    <h4 class="mb-0 fw-bold"> {{ getStudent(item)?.name || "Unknown" }} </h4>
                    <span class="badge bg-light text-dark">
                    ID: {{ item?.student_id }}
                    </span>
                </div>

                <ul class="list-unstyled mb-2">
                    <li><strong>Status:</strong> <span status>{{ item?.status || "N/A" }}</span></li>
                    <li>
                    <strong>Late:</strong> {{ item?.late_in_minute || 0 }} min
                    </li>
                    <li><strong>Shift:</strong> {{ item?.shift_duration }}</li>
                    <li><strong>Date:</strong> {{ Ahelper.printDate(item) }}</li>
                    <li>
                    <template v-if="item?.in_time">
                        <strong>In Time:</strong> {{ item?.in_time || "--" }}
                    </template>
                    <template v-else>
                        <strong>Out Time:</strong> {{ item?.out_time || "--" }}
                    </template>
                    </li>
                </ul>

                <div v-if="item?.remarks" class="remarks small"> “{{ item.remarks }}” </div>
                </div>
            </div>
            </template>
        </div>
    </template>
    <template v-else>
    <!-- No Attendance Found Message -->
    <div class="col-12">
        <div
        class="attendance-card text-center no-data-card d-flex flex-column justify-content-center align-items-center"
        >
        <h5 class="text-muted mb-2">No Attendance Records Found</h5>
        <p class="text-secondary mb-0">
            Live attendance list is currently empty.
        </p>
        </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { inject } from "vue";
import Ahelper from "./attendacnceHelper";

const CONFIG = inject("CONFIG");
const classes = inject("classes");
const attendenceList = inject("attendenceList");
const all_students = inject("all_students");
const liveAttendenceList = inject("liveAttendenceList");

const getStudent = ({ student_id }) =>
  all_students.value.find((std) => std.dakhela == student_id);
</script>

<style scoped>
.attendance-card {
  background: #fff;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  border: 1px solid #e2e2e2;
  transition: all 0.25s ease;
  color: #333;
}

.attendance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-present {
  background-color: #198754; /* Bootstrap success green */
  color: #fff !important;
}

.status-absent {
  background-color: #dc3545; /* Bootstrap danger red */
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
    background-color: white;
    padding: 1px 8px 3px 6px;
    border-radius: 6px;
    color: #222;
    transform: translateY(-2px);
}
</style>
