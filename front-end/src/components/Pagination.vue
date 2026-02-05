<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue' 
import { useRoute, useRouter } from 'vue-router' 

let route = useRoute()
let router = useRouter()
let emitter = inject('emitter')
let liElements = ref([])

let helper = {
    setQuery: function(params, url = globalThis.location.href, _return=false){
            if(!url) url = globalThis.location.href               
      
            const currentUrl = new URL(url);
            Object.entries(params)?.forEach(param => {
                currentUrl.searchParams.set(param[0], param[1]);
            })
            if(_return){
                return currentUrl.href // fullurl with query params
            }else{
                globalThis.history.pushState({}, '', currentUrl);
            }
    },        
    getQuery: function(param='', url = globalThis.location.href){        
        const currentUrl = new URL(url);            
        if(param){
            return currentUrl.searchParams.get(param);
        } else {
            const urlParams = new URLSearchParams(globalThis.location.search);
            const paramObj = {};
            for(var value of urlParams.keys()) {
                paramObj[value] = urlParams.get(value);
            }
            return paramObj;
        }
    },
}

let props = defineProps({
    modelValue: {
        type: [Array, Object, Boolean],
        required: false,
        default: { 
            page_no: 1,
            limit: 10,
            total: 23 // Total row in DB
        }
    },
    limit: {
        default: 5,
        type: [String, Number],
        required: false,
    },
    pageKey: {
        default: 'page', //e.g >> page | page_no
        type: String,
        required: false,
    },
    prevent: {
        default: true,
        type: Boolean,
    },
})
globalThis.helper = helper

let myEmits = defineEmits(['jumpToPage']);
const totalPage = computed(() => {
    const totalPages = props.modelValue?.totalPages
    if (totalPages !== undefined && totalPages !== null && totalPages !== '') {
        const parsed = Number(totalPages)
        return Number.isFinite(parsed) && parsed > 0 ? Math.ceil(parsed) : 0
    }
    const total = Number(props.modelValue?.total || 0)
    const perPage = Number(props.modelValue?.limit || 0)
    if (Number.isFinite(total) && Number.isFinite(perPage) && perPage > 0) {
        return Math.ceil(total / perPage)
    }
    return 0
})
let current_page = ref(1)
const start = ref(1);
const pageWindow = computed(() => {
    const parsed = Number(props.limit)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
})
const end = computed(() => start.value + pageWindow.value - 1);
const rangeArray = computed(() => {
    const length = Math.max(0, end.value - start.value + 1)
    return Array.from({ length }, (_, index) => start.value + index)
});
 
function set_start(page_no){
    const page = Number(page_no) || 1
    const windowSize = pageWindow.value
    const half = Math.floor(windowSize / 2)
    let nextStart = page - half
    if (nextStart < 1) nextStart = 1
    const maxStart = Math.max(1, totalPage.value - windowSize + 1)
    if (nextStart > maxStart) nextStart = maxStart
    start.value = nextStart
}

function goToPage(page_no){
    const safeTotal = totalPage.value || 1
    const page = Math.max(1, Math.min(Number(page_no) || 1, safeTotal))
    current_page.value = page
    set_start(page)
    myEmits('jumpToPage', page);
}

function getLink(page_no){
    if(props.pageKey){
        return helper.setQuery({[props.pageKey]: page_no}, null, true);
    } else {
        return false
    }
}

onMounted(()=>{
    if(props.pageKey){
        let currentPage = helper.getQuery(props.pageKey) || 1
        const page = Number(currentPage) || 1
        current_page.value = page;
        set_start(page);
    }
    emitter.on('reset_pagination', ()=>{
        current_page.value = 1
        set_start(1)
    })
})

watch(
    () => props.modelValue?.page_no,
    (page_no) => {
        const page = Number(page_no) || 1
        current_page.value = page
        set_start(page)
    },
    { immediate: true }
)

watch(
    () => [totalPage.value, pageWindow.value],
    () => {
        set_start(current_page.value)
    }
)
</script>

<template>
    <div v-if="totalPage > 1" class="d-flex justify-content-center" v-bind="$attrs">
        <nav aria-label="Page navigation">
            <ul class="pagination">
                <li id="GoFirstPage" class="page-item cp" :class="{'disabled': current_page <= 1}" @click="current_page <= 1 ? false : goToPage(1)" :disabled="current_page <= 1">
                    <a class="page-link cp" aria-label="First">
                        <i class='bx bx-arrow-to-left transformY-2px'></i>
                    </a>
                </li>
                <li class="page-item cp" :class="{'disabled': current_page <= 1}" @click="current_page <= 1 ? false : goToPage(current_page - 1)" :disabled="current_page <= 1">
                    <a class="page-link cp" aria-label="Previous">
                        <span>&laquo;</span>
                    </a>
                </li>
                <template v-if="totalPage">
                    <template v-for="(page_no, index) in rangeArray" :key="index">
                        <slot name="pageNumbers">
                            <template v-if="page_no <= totalPage">
                                <li ref="liElements" class="page-item cp" :class="{'active': page_no === current_page}" @click.prevent="goToPage(page_no)"><a class="page-link cp" :href="pageKey ? getLink(page_no) : false"> {{ page_no }} </a></li>
                            </template>
                        </slot>
                    </template>                        
                </template>                        

                <li class="page-item cp" :class="{'disabled': current_page >= totalPage}" @click="current_page < totalPage ? goToPage(current_page + 1) : false">
                    <a class="page-link cp" aria-label="Next">
                        <span>&raquo;</span>
                    </a>
                </li>
                <li id="GoLastPage" class="page-item cp" :class="{'disabled': current_page >= totalPage}" @click="current_page < totalPage ? goToPage(totalPage) : false">
                    <a class="page-link cp" aria-label="Last">
                        <i class='bx bx-arrow-to-right transformY-2px'></i>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<style scoped>
.page-link {
    color: var(--textcolor-white);
    background-color: var(--bg-dark, #ffffff3a);
}
.page-item.active .page-link{  
    background: var(--grad3);
    /* border-radius: 50%; */
    margin: 0px 0px;
    color: white;
    border: 1px solid rgb(229, 229, 229);
    box-shadow: 0px 2px 3px 1px rgba(232, 225, 152, 0.281); 
}
.page-link:focus {
    box-shadow: 0 0 0 0.25rem #21851400;;
}
.page-item a{
    line-height: 18px;
}
</style>
