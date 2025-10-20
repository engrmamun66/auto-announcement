<script setup>
import { onMounted, inject, ref, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
/**
 * How to call
 * ==========================================
 <Rightbar v-if="show" @close="show = false">
    <h1>Hello world</h1>
 </Rightbar>
 * 
 */

let props = defineProps({
    title: {
        default: 'Title Here',
        required: true,
        type: [String, Boolean],
    },
    closeIcon: {
        default: true,
        required: false,
        type: Boolean,
    },
    largestMode: {
        default: true,
        required: false,
        type: Boolean,
    },
    ignoreUI: {
        default: false,
        required: false,
        type: Boolean,
    },
    showCloseIcon: {
        default: true,
        required: false,
        type: Boolean,
    },
    injectkeyToSetFalseByEscKey: {
        default: '',
        required: false,
        type: String,
    },
})


let div = ref(null)
let emits = defineEmits(['unmount']);
let toggling = ref(false);

function unmount(){
    document.body.click() // to hide datePickers
    isMounted.value = false;
    setTimeout(()=> emits('unmount', null), 750);
}
function toggle(){
    isMounted.value = !isMounted.value;
    console.log('asdfasdf');
}

let isMounted = ref(false);
let footer = ref(null);
let footerBound = ref(null);

let escapedInjectedVar = ref(false)
let injectedVariable = inject(props.injectkeyToSetFalseByEscKey, undefined) 
let router = inject('router') 
let helper = inject('helper') 


function closeByEscapeKey(event){
    if(event.key == 'Escape'){
        if(injectedVariable?.value !== undefined && escapedInjectedVar.value == false){
            escapedInjectedVar.value = true
            injectedVariable.value = false
            return
        } else {
            unmount()
        } 
    }
}

onMounted(()=>{ 
    helper.delay(()=>{
        isMounted.value = true;
        if(!props.ignoreUI)
            footerBound.value = footer.value.getBoundingClientRect();
    }, 0);

    document.addEventListener('keyup', closeByEscapeKey)
})

onBeforeUnmount(() => {
    document.removeEventListener('keyup', closeByEscapeKey)
})


defineExpose({unmount})
</script>

<template>
    <template v-if="ignoreUI" >
        <slot></slot>
    </template>
    <template v-else >
        <div ref="div" class="rightbar" :class="{show: isMounted, toggling: toggling, 'using-close-icon': closeIcon, 'largestMode': largestMode}" >
            <div class="contents" >            
    
                <slot name="header">
                    <div class="header">
                            <h2>{{ title ? title : '&nbsp;'}}</h2>
                        
                        <div class="button-area">
                            <template v-if="useRoute().query?.dev === 'true'">
                                <div v-if="!toggling" class="toggle-button" :class="{ active: toggling}"  @click.stop="()=>{
                                    toggling = !toggling;
                                    if(toggling) toggle();
                                }" > 
                                    <i class='bx bx-transfer-alt size-2'></i>
                                </div>
                            </template>
        
                            <div v-if="showCloseIcon" class="close-button-header" @click.stop="toggling=false; unmount()" > 
                                <i class='bx bx-x size-2' ></i>
                            </div>
                        </div>
                    </div>
                </slot>
    
                <div class="inner-contents" :style="`max-height: calc(100% - ${(footerBound?.height || 0) + 56}px );`">
                    <slot>
                        <!-- HTML -->
                    </slot>
                </div>
    
                <div ref="footer" class="footer">
                    <slot name="footer"> </slot>
                </div>
    
    
                <template v-if="!toggling">
                    <div class="close-button" @click="unmount()" >
                        <i class='bx bx-chevron-right size-2' ></i>
                    </div>
                </template>
                <template v-else>
                    <div class="close-button" @click.stop="toggle()"> 
                        <i class='bx bx-transfer-alt size-2' ></i>
                    </div>
                </template>
    
            </div>
        </div>
    </template>
</template>

<style scoped>
.rightbar {
    --bg-light: #e1e1e1;
}
.rightbar {
    position: fixed;
    top: 0px;
    right: 0;
    height: calc(100vh);    
    padding: 20px 30px 20px 60px;
    border-left: 2px solid var(--primaryColor);
    background-color: var(--bg-light);
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    transition: transform 0.8s;
    border-top: 1px solid #252525;
    z-index: 99;
}
.rightbar:not(.show) {
    transform: translateX(calc(100% + 40px));
}
.rightbar.toggling:not(.show) {
    transform: translateX(100%);
}
.rightbar.show {
    transform: translateX(0);
    box-shadow: -15px 0px 20px 0px #00000047;
}

.rightbar .contents {
    height: 100%;
    position: relative;
}
.rightbar .contents .inner-contents {
    height: calc(100%);
    overflow-y: auto;
    padding-right: 5px;
}
.rightbar .contents > .close-button {
    position: absolute;
    top: calc(50% - 30px);
    width: 50px;
    height: 50px;
    z-index: 1000001;
    background-color: var(--bg-light);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 15px;
    border-left: 2px solid var(--primaryColor);
    border-right: 1px solid #000000;
    cursor: pointer;
    box-shadow: -15px 0px 20px 0px #00000047;
    overflow: hidden;
    transition: left 0.4s; 
}

.rightbar .contents > .close-button:hover {
    border-left: 2px solid #ebebeb;  
}
.rightbar .contents > .close-button > * {
    padding: 8px;
    background: var(--primaryColor);
    border-radius: 10px;
    color: #f0f0f0;
    text-shadow: 1px 1px 3px #0000008c;
    transition: all 0.2s;
}

.rightbar .contents > .close-button:hover > * {
    padding: 26px;
    animation: arromove 0.3s alternate 1s infinite;    
}

@keyframes arromove {
    0%{
        transform: translateX(-5px);
    }
    100%{
        transform: translateX(5px);
    }
}


/* -------------------------------------------------------------------------- */
/*                             with toggle button                             */
/* -------------------------------------------------------------------------- */
.rightbar .contents .header {   
    display: flex;   
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-right: 5px;
    position: relative;
}
.rightbar .contents .header .button-area {   
    width: 70px;
    display: flex;   
    justify-content: flex-end;
    align-items: center;
}
.rightbar .contents .header .toggle-button {   
    background-color: var(--bg-light);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    padding: 5px;
    border: 1px solid #747474;
    cursor: pointer;
    overflow: hidden;    
    margin-right: 5px;
}
.rightbar.using-close-icon .contents .header .toggle-button {
    right: 10px;  
}
.rightbar .contents .header .toggle-button.active,
.rightbar .contents .header .toggle-button:hover
 {
    background-color: var(--primaryColor);  
    border: 1px solid var(--primaryColor);
    color: white !important;
}
.rightbar .contents .footer{
    position: absolute;
    width: 100%;
    left:0px;
    bottom: 0px;
}
.rightbar .contents .footer:not(:empty){
    border-top: 1px solid grey;
    position: absolute;
    width: 100%;
    left:0px;
    bottom: 0px;
}


/* -------------------------------------------------------------------------- */
/*                             with Close button                             */
/* -------------------------------------------------------------------------- */
.rightbar .contents .header .close-button-header {
    background-color: var(--bg-light);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    padding: 5px;
    border: 1px solid #747474;
    cursor: pointer;
    overflow: hidden;    
}
.rightbar .contents .header .close-button-header.active,
.rightbar .contents .header .close-button-header:hover {
    background-color: #f708585e;  
    border: 1px solid #f70858;
}


/* -------------------------------------------------------------------------- */
/*                               With Responsive                              */
/* -------------------------------------------------------------------------- */
@media (max-width: 800px) {
    .rightbar {
        width: calc(100% - 5px);
    }
    .rightbar:not(.show) {
        transform: translateX(100%);
    }
    .rightbar .contents > .close-button {
        left: -86px;
    }
    .rightbar .contents > .close-button,
    .rightbar .contents .header .toggle-button
     {
        display: none;
    }
    .rightbar.toggling:not(.show) .contents > .close-button {
        left: -106px;
    }
}

@media (min-width:801px) {
    .rightbar {
        width: 70%;
    }
    .rightbar.largestMode {
        width: 90%;
    }
    .rightbar .contents > .close-button {
        left: -86px;
    }
    .rightbar.toggling:not(.show) .contents > .close-button {
        left: -106px;
    }
}

@media (min-width:1200px) {
    .rightbar {
        width: 60%;
    }
    .rightbar.largestMode {
        width: 80%;
    }
    .rightbar .contents > .close-button {
        left: -86px;
    }
    .rightbar.toggling:not(.show) .contents > .close-button {
        left: -106px;
    }
}

@media (min-width:1800px) {
    .rightbar {
        width: 50%;
    }
    .rightbar.largestMode {
        width: 65%;
    }
    .rightbar .contents > .close-button {
        width: 54px;
        height: 54px;
        left: -88px;
    }
    .rightbar.toggling:not(.show) .contents > .close-button {
        left: -108px;
    }
}


/* -------------------------------------------------------------------------- */
/*                           Save And Cancel Button                           */
/* -------------------------------------------------------------------------- */
:slotted(.buttons-area-in-rightbar){
    position: absolute;
    top: 1px;
    right: 77px;
    display: flex;
    justify-content: end;
    align-items: center;
}

@media (max-width: 800px) {
    :slotted(.buttons-area-in-rightbar){
        right: 42px;
    }
}
 
:slotted(.buttons-area-in-rightbar .save-button),
:slotted(.buttons-area-in-rightbar .clear-button){
    border: none;
    padding: 5px 12px;
    border-radius: 4px;
    color: white;
    background-color: #20a735;
    font-weight: 500;
    font-size: 13px;
    box-shadow: 0px 3px 4px #0000002a;
    transition: all 0s;
}
:slotted(.buttons-area-in-rightbar .clear-button){
    background-color: #f15510;
}

:slotted(.buttons-area-in-rightbar button:first-child){
    margin-right: 5px;
}
:slotted(.buttons-area-in-rightbar button:hover){
    box-shadow: 0px 6px 8px #00000086 !important;
}

 

</style>