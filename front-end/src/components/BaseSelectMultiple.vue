<template>
    <div v-bind="$attrs" @mouseleave="showOptions = false">
        <div :class="{'form-group': useFormGroup}">
            <div class="btn-options-toggler" :style="(width ? ('width:' + width) : '')">
                <label v-if="label"> {{ label }} </label>
                <template v-if="showEffect" >
                    <!-- <ShimmerEffect 
                    :bg="effectAttrs?.bg || 'dark'" :width="effectAttrs?.width || '100%'" 
                    :height="effectAttrs?.height || (compact ? '40px' : '48px')" 
                    :radius="effectAttrs?.radius || (compact ? '10px' : '15px')" 
                    :class="[effectAttrs?.class || '']"
                    :style="effectAttrs?.style || input_styles"
                    ></ShimmerEffect> -->
                    </template>
                <template v-else >
                    <button :tooltip="(modelValue?.length ? tooltip : '') || (disabled ? 'Disabled' : '')" ref="ref_button" :disabled="disabled" @click="()=>{
                        if(!disabled) showOptions = !showOptions                    
                    }" class="form-control padding-as-input text-start">
                        <div v-if="(modelValue?.length && typeof modelValue[0] != 'number')" class="selected-items">
                            <template v-for="(item, index) in modelValue" :key="index">
                                <a v-if="item" :value="valueKey ? item[valueKey] : item" class="selected-item" :class="{'animation-showing': (!item?.removing), 'animation-removing': item?.removing}"
                                    @click="(higlight_ids?.length && higlight_ids?.includes(item[valueKey])) ? clickedOnItem(item) : false">
                                    <!-- Highlighting with grren circle -->
                                    <template v-if="higlight_ids?.length">
                                        <span v-if="higlight_ids?.includes(item[valueKey] || '-1')" class="bg-success rounded-5 mx-1" style="width:10px;height:10px;"></span>
                                    </template>
                                    {{ (displayKey ? item[displayKey] : '') }} {{ (displayKey2 ? item[displayKey2] : '') }}  
                                    <i @click.stop="$emit('removeItem', item);item.removing=true;H.delay(()=>removeValue(index, item), 390)" class="bx bx-x close ms-1" /> 
                                </a>
                            </template>
                        </div>
                        <p v-else class="fw-500 text-white-50" > {{ placeholder }} </p>
                        <i class="bx bxs-chevron-down" style="position:absolute;right:8px;top:15px;font-size: 12px" />
                    </button>
                </template>

                <!-- This is only for validate with v-validation directive -->
                <input v-show="false" ref="ref_input_element" :id__="id" :value="modelValue?.map(i => 1)?.join('')" />

                <!-- <ul v-if="true" class="option-box py-2"  -->
                <ul v-if="!disabled && (data?.length || search) && showOptions" class="option-box py-2" 
                :class="{'--animate-show': (showOptions || search), '--animate-hide': (!showOptions && !search)}">
                    <input v-if="search" :placeholder="placeholder2" type="search" class="form-control mb-2" v-model="searchText" @keyup="handleSearching" style="border-radius: 20px;height: 30px;" />
                    <template v-if="data?.length" >
                        <template v-for="(item, index) in (data || [])" :key="index" >                            
                            <li class="ps-2"
                             :value="valueKey ? item[valueKey] : item" 
                            @click="item?.isDisabled ? false : updateValue($event, item[valueKey], item, index)" 
                            :class="{selected: modelValue?.map(i => i[valueKey])?.includes(item[valueKey]), 'grayscale pointer-events-none': item?.isDisabled}"> 
                                <div class="px-1 d-flex justify-content-between">
                                    <a> {{ (displayKey ? item[displayKey] : '') }} {{ (displayKey2 ? item[displayKey2] : '') }} </a>
                                    <div class="px-1 d-flex justify-content-between">
                                        <slot name="loopItem" :item="item" :data="data"></slot>
                                    </div>
                                </div>
                            </li>
                        </template>
                    </template>
                    <template v-else-if="showCreateNew && inputValue">
                        <a class="add-new-item" @click.stop="onClickShowCreateNew" >Add New "{{ inputValue }}"</a>
                    </template>
                </ul>
            </div>
        </div>
    </div>
    <!-- <Modal-Confirm 
        v-if="showCreateNewConfirmation"
        v-model="showCreateNewConfirmation"
        :skipAutoClose="false"
        @yes="$emit('onClickCreateNew', inputValue)"
        @no="inputValue=''"
        >
        Are you confirm to create "{{ inputValue }}" ?
    </Modal-Confirm> -->
</template>

<script setup>
/**
 * ======= USE EXAMPLE ============
  <el-BaseSelectMultiple class="col-md-6 col-12" label="Select Variant Option For This Product" col="id" :showEffect="showEffect" option1="-Select tags-" 
    v-model="payload.varient_set" :data="allVariantValues.filter(i => (!variant_text || H.lowerCase(i.name).indexOf(variant_text) > 1))" displayKey="name"
    :search="true" @searching="(text) => variant_text = H.lowerCase(text)" :searchDelayTime="0" 
    :showCreateNew="!filteredTagList?.length && variant_text"
    @onClickCreateNew="async (name) => {
        log({name})
    }"
        > </el-BaseSelectMultiple>
 */

import { ref, computed, watch, watchEffect, inject } from 'vue'


let props = defineProps({
    modelValue: {
        type: [Array],
        default: []
    },
    useFormGroup:{
        type: Boolean, 
        default:true,
        required: false,
    },
    label:{
        type: [Boolean, String], 
        default:'',
        required: false,
    },
    disabled: {
        type: Boolean,
        default: undefined,
        required: false,
    },
    placeholder:{
        default:'',
        required: false,
    },
    placeholder2:{
        default:'Search...',
        required: false,
    },
    data:{
        required: true,
    },
    valueKey:{
        type: String, 
        default:'id',
        required: false,
    },
    displayKey:{
        type: String, 
        default:'name',
        required: false,
    },
    displayKey2:{
        type: [Boolean, String], 
        default:'',
        required: false,
    },
    charLimit:{
        type: Number, 
        default: 999,
        required: false,
    },
    higlight_ids:{ //Specially higlight_ids using for Dispatcher Page
        default: [],
        type: [Array], 
        required: false,
    },
    id:{
        type: String, 
        default: '',
        required: false,
    },
    tooltip:{
        default: '',
        required: false,
    },
    /* ------------------------ */
    /* =========Search========= */
    /* ------------------------ */
    search:{
        type: Boolean, 
        default: false,
        required: false,
    },
    searchDelayTime:{
        type: Number, 
        default: 400,
        required: false,
    }, 
    showCreateNew:{
        default: false,
        required: false,
    },
    width:{
        type: String, 
        default: '',
        required: false,
    }, 
    compact: {
        default: false,
        required: false,
    },
    input_styles: {
        default: "",
        required: false,
        type: String,
    },
    showEffect: {
        default: false,
        required: false,
    },
    effectAttrs: {
        default: {
        /**
         * you can pass
         * -------------------
         * bg: 'dark' | 'light'
         * width: 10px (as you need)
         * height: 40px (as you need)
         * radius: 10 (as you need)
         * class: ...
         * style: ...
         * 
         */
        },
    },
    limit: {
        default: 999,
        required: false,
    },
})
const searchText = ref(null);
const showOptions = ref(false);

const H = inject('helper')

watch(showOptions, (a, b) => {
    if(a === false){
        searchText.value = '';
        myEmit('searching', '')
    }
})

const myEmit = defineEmits(['update:modelValue', 'changed-item', 'clicked', 'clicked-added-item', 'searching', 'onClickCreateNew', 'removeItem'])
const updateValue = (event, id, item) => {
    let {valueKey, modelValue} = props
    try {
        event.stopPropagation();
        if(item){
            if(!modelValue?.map(i => i[valueKey]).includes(id)){
                var new_data = H.clone(modelValue)
                if(new_data?.length >= props.limit){
                    new_data.length = props.limit - 1;
                }
                new_data.push(item)
            }
            else{
                var new_data = H.clone(modelValue)?.filter(item => item[valueKey] != id)
            }
        }
        myEmit('update:modelValue', new_data)
        myEmit('changed-item', new_data)
        update_v_validation()
    } catch (error) {
        log(error)
    }
}

let _timeout = ref(null);
let inputValue = ref('');
let showCreateNewConfirmation = ref(false)
function handleSearching(event){
    if(_timeout.value) clearTimeout(_timeout.value)
    _timeout.value = setTimeout(() => {
        inputValue.value = event.target.value;
        myEmit('searching', event.target.value)
    }, props.searchDelayTime);
}


function onClickShowCreateNew(){
    // showCreateNewConfirmation.value = true;
    if(confirm(`Are you confirm to create "${inputValue.value}" ?`)){
        $emit('onClickCreateNew', inputValue)
    }
}

let ref_button = ref()
let ref_input_element = ref()
const removeValue = (i, loopItem) => {
    loopItem.removing = false
    let {valueKey, modelValue} = props
    let new_data = H.clone(modelValue)?.filter(item => item[valueKey] != loopItem[valueKey])
    myEmit('update:modelValue', new_data)
    myEmit('changed-item', new_data?.map(i => i[valueKey]))
    update_v_validation()
}
let update_model_value = () => {
    try {
        let { valueKey, data, modelValue } = props       
        if(modelValue?.length){                      
            let store = []
            modelValue?.forEach(_ID_ => {
                if(typeof _ID_ == 'number'){
                    let newData = H.clone(data)?.filter(i => i[valueKey] == _ID_)[0] || null
                    if(newData) store.push(newData)
                }
            })
            if(store?.length){
                myEmit('update:modelValue', store)
            }
        }
    } catch (error) {}
}
let update_v_validation = () => {
    let { value: el } = ref_input_element
    setTimeout(() => {
        // support to v-validation directive
        if(el?.getAttribute('v-validated')){
            if(el.value){
                ref_button.value.style.borderLeft = '2px solid transparent'
                let field_name = el.getAttribute('name')
                let errorBoundary = document.querySelector(`[error-boundary-${field_name}=true]`)
                errorBoundary?.remove()
            }
        }            
    }, 10);
}
watchEffect(()=>{
    if(props.modelValue == null) myEmit('update:modelValue', [])
    update_v_validation()
    H.delay(update_model_value, 0)
    H.delay(update_model_value, 500)
    H.delay(update_model_value, 1000)
    H.delay(update_model_value, 1500)
    H.delay(update_model_value, 2000)
    H.delay(update_model_value, 2500)
    H.delay(update_model_value, 3000)
    H.delay(update_model_value, 3500)
    H.delay(update_model_value, 4000)
    H.delay(update_model_value, 4500)
    H.delay(update_model_value, 5000)
})

function clickedOnItem(item){
    myEmit('clicked-added-item', item)
}



let random_id = computed(() => ('random_' + H.randomBetween(333, 294444)))
</script>
<style scoped>
.btn-options-toggler {
    position: relative;
}
.btn-options-toggler button {
    position: relative;
    min-height: 40px;
    height: auto;
    width: 100% !important;
    padding-right: 25px;
}
.btn-options-toggler button .selected-items {
    float: left;
}
.btn-options-toggler button .selected-items .selected-item {
    display: flex;
    float: left;
    align-items: center;
    border: none;
    background-color: var(--border-dark);
    background-color: #d5fdd7;
    padding: 0px 3px !important;
    position: relative;
    color: #414141;
    margin-right: 0.5rem;
    margin-bottom: 2px;
    border-radius: 3px;
    text-decoration: none;
}
.btn-options-toggler button .selected-items .selected-item > .close {
    padding-top: 3px;
}
.btn-options-toggler .option-box {
    position: absolute;
    right: 0;
    /**top: v-bind(top)px;*/
    max-width: 250px;
    min-width: 100%;
    border: 1px solid;
    border-radius: 10px;
    background: #1e1e2d; 
    background: var(--grad1); 
    z-index: 22;
    padding: 12px 15px !important;
    border: none;
    max-height: 250px;
    overflow-y: scroll;
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.3);
}
.btn-options-toggler .option-box::before {
    content: '';
    width: 0;
    height: 0;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-bottom: 12px solid #000000;
    position: absolute;
    top: -8px;
    border-radius: 17px;
    right: 12px;
    z-index: 21;
}
.btn-options-toggler .option-box li {
    width: 100%;
    margin: 0;
    border-radius: 0;
    padding: 4px 0;
    cursor: pointer;
}
.btn-options-toggler .option-box li:hover {
    width: 100%;
    margin: 0;
    border-radius: 0;
    background-color: #e4dbdb;
}
.btn-options-toggler .option-box li.selected {
    width: 100%;
    margin: 0;
    border-radius: 0;
    background-color: #cdcdcd;
    background: var(--borderColor);
}
.btn-options-toggler .option-box li a,
.btn-options-toggler .option-box li i,
.btn-options-toggler .option-box li .las,
.btn-options-toggler .option-box li a:hover {
    color: #333;
    border-radius: 0;
    background-color: transparent;
    cursor: pointer;
    font-size: 14px;
}
.animation-showing {
    animation-name: frame-showing;
    animation-duration: 0.4s;
    animation-iteration-count: 1;
    display: none;
}
@keyframes frame-showing {
    from {
        opacity: 1;
        transform: translateX(5rem);
        display: block;
    }

    to {
        opacity: 1;
        transform: translateX(0rem);
        display: none;
    }
}
.animation-removing {
    animation-name: frame-removing;
    animation-duration: 0.4s;
    animation-iteration-count: 1;
    display: none;
}
@keyframes frame-removing {
    from {
        opacity: 1;
        transform: translateY(0rem);
        display: block;
    }

    to {
        opacity: 0;
        transform: translateY(-2.5rem);
        display: none;
    }
}
a.add-new-item{
    text-decoration: none;
    color: var(--textcolor-white);
    text-align: center;
    display: block;
    width: 100%;
    border: 1px solid #4a4a4a;
    padding: 6px;
    border-radius: 26px;
    background-color: black;
    box-shadow: 0px 4px 8px #0000006e;
    cursor: pointer;
}
</style>