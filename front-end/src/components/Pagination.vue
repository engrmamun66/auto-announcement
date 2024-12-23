<script setup>
import { ref, computed, onMounted, defineEmits } from 'vue' 
import { useRoute, useRouter } from 'vue-router' 

let route = useRoute()
let router = useRouter()

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
        default: 6,
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
let totalPage = computed(() => Math.ceil(props.modelValue?.totalPages || 3))
let current_page = ref(1)
const start = ref(1);
const end = computed(() => start.value + props.limit);
const rangeArray = computed(() => Array.from({ length: end.value - start.value + 1 }, (_, index) => start.value + index));
 
function set_start(page_no){
    let fraction = Math.ceil(page_no - Math.ceil(props.limit / 2));
    start.value = Math.abs(fraction < -1 ? 1 : fraction) || 1;
}

function goToPage(page_no){
    current_page.value = page_no
    myEmits('jumpToPage', page_no);
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
        current_page.value = currentPage;
        set_start(currentPage);
    }
})
</script>

<template>
    <div v-if="totalPage > 1" class="d-flex justify-content-center" v-bind="$attrs">
        <nav aria-label="Page navigation">
            <ul class="pagination retnmy-pagination">
                <li class="page-item cp" :class="{'disabled': current_page == 1}" @click="current_page == 1 ? false : goToPage(parseInt(current_page) - 1)" :disabled="current_page == 1">
                    <a class="page-link cp" aria-label="Previous">
                        <span>&laquo;</span>
                    </a>
                </li>
                <template v-if="totalPage">
                    <template v-for="(page_no, index) in rangeArray" :key="index">
                        <slot name="pageNumbers">
                            <template v-if="page_no <= totalPage">
                                <li class="page-item cp" :class="{'active': page_no == current_page}" @click.prevent="goToPage(page_no)"><a class="page-link cp" :href="pageKey ? getLink(page_no) : false"> {{ page_no }} </a></li>
                            </template>
                        </slot>
                    </template>                        
                </template>                        

                <li class="page-item cp" :class="{'disabled': current_page == 1}" @click="current_page < totalPage ? goToPage(parseInt(current_page) + 1) : false">
                    <a class="page-link cp" aria-label="Next">
                        <span>&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<style scoped>
.page-link {
    color: var(--textcolor-white);
    background-color: var(--bg-dark);
}
.page-item.active .page-link{  
    background: var(--grad1);
    border-radius: 50%;
    margin: 0px 3px;
    box-shadow: 0px 2px 3px 1px rgba(232, 225, 152, 0.281); 
}
.page-link:focus {
    box-shadow: 0 0 0 0.25rem #21851400;;
}
</style>