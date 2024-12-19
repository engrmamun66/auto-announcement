<script setup>
import { ref, inject } from 'vue';
let defaults = inject('defaults');
let FORMATS = inject('defaults');
import { options, allProps, allCustomRangePattern } from './docjs.js';
import { moment } from '../helper.js';

let {
    body_bg: color_body_bg,
    primary_bg: color_primary_bg,
    bg_grey: color_bg_grey,
    font_dark: color_font_dark,
    font_dark_low: color_font_dark_low,
    font_light: color_font_light,
    date_disable: color_date_disable,
    soft_border: color_soft_border,
} = defaults.colors
const color_transparent_1 = (color_primary_bg + '3d');
const color_transparent_2 = (color_primary_bg + '1c');

let propsList = ref(allProps);
let params = ref(options);

function toggleLoopItem(data, index, key = "isExpand") {
    if (!data) return;
    data?.forEach((item, i) => {
        if (i == index) {
            item[key] = !(item[key] ?? false);
        } else {
            item[key] = false;
        }
    });
}

const allPositions = { 
    modal : `left: 118px; top: 62px`,
    top_left : `top: 7px; left: 100px;`,
    top_right : `top: 7px; left: 120px;`,
    top_center : `top: 7px; left: 110px;`,
    bottom_left : `top: 113px; left: 100px;`,
    bottom_right : `top: 113px; left: 120px;`,
    bottom_center : `top: 113px; left: 110px;`,
    left_top : `top: 8px; left: 40px;`,
    left_bottom : `top: 87px; left: 40px;`,
    left_center : `top: 60px; left: 40px;`,
    right_top : `top: 8px; left: 180px;`,
    right_bottom : `top: 87px; left: 180px;`,
    right_center : `top: 57px; left: 180px;`,
    inline_left : `top: 86px; left: 99px;`,
    inline_right : `top: 86px; left: 121px;`,
    inline_center : `top: 86px; left: 110px;`,
    center : `top: 60px; left: 110px;`,
}

function copy(event, data='') {
    if(!data) return;
    if(typeof data == 'object') data = JSON.stringify(data);

    
    let inputEl = document.createElement('input');
    inputEl.type = 'text';    
    inputEl.value = data;    
    document.body.appendChild(inputEl);    
    inputEl.select();    
    document.execCommand('copy');    
    document.body.removeChild(inputEl);    
    
    event.target.innerHTML = 'copied';
    setTimeout(() => {
        event.target.innerHTML = 'copy';        
    }, 2000);
}


</script>

<template>
    <div class="doc fadeUp" >
        <div class="contents">

            <!-- Props -->
            <!-- Props -->
            <!-- Props -->
            <h5 class="mb-3" >Props</h5>

            <ul v-for="(param, i) in propsList" :key="i">                
                <li class="expandalbe-area" >
                    <div class="flex-between">
                        <label for=""> {{ param.name }} <span class="copy" @click.stop="copy($event, param.name)">copy</span> </label>
                        <div @click.stop="toggleLoopItem(propsList, i)" class="expand-btn" >Details</div>
                    </div>
                </li>
                <template v-if="param.isExpand"> 
                    <li class="in-details">
                        <table class="ms-4 my-3" >
                            <thead>
                                <th style="width: 100px;" >Default</th>
                                <th style="width: 100px;" >Type</th>
                                <th>Description</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td> 
                                        <template v-if="param.defaultValue.type == 'object'">
                                            <pre>  {{ param.defaultValue }} <span v-if="param.defaultValue_forCopy" class="copy" @click.stop="copy($event, param.defaultValue_forCopy)">copy</span> </pre> 
                                        </template>    
                                        <template v-else>
                                            {{ param.defaultValue }} 
                                            <span v-if="param.defaultValue_forCopy" class="copy" @click.stop="copy($event, param.defaultValue_forCopy)">copy</span>
                                        </template>
                                    </td>
                                    <td> {{ param.type }} </td>
                                    <td>                                         
                                        <div class="mt-3" v-html="param.description"></div> 
                                    </td>
                                </tr>
                                <template v-if="param.availableValue">
                                    <tr>
                                        <td colspan="3">                                             
                                            Available Parameters :: <span v-if="param.availableValue.type == 'string'" > {{ param.availableValue.value }} <span class="copy" @click.stop="copy($event, param.availableValue.value)">copy</span>  </span>
                                        </td>                                    
                                    </tr>                                   
                                    <tr v-if="param.availableValue.type != 'string'">
                                        <td colspan="3"> 
                                            <span class="copy" @click.stop="copy($event, param.availableValue.value)">copy</span>
                                            <pre v-if="param.availableValue.type == 'array'" > {{ param.availableValue.value }} </pre>    
                                        </td>
                                    </tr>                                   
                                </template>
                                
                            </tbody>
                        </table>
                    </li>
                </template>  
            </ul>



            <!-- Options -->
            <!-- Options -->
            <!-- Options -->
            <h5 class="mb-3 mt-4" >Options</h5>

            <ul v-for="(param, i) in params" :key="i">                
                <li class="expandalbe-area" >
                    <div class="flex-between">
                        <label for=""> {{ param.name }} <span class="copy" @click.stop="copy($event, param.name)">copy</span> </label>
                        <div @click.stop="toggleLoopItem(params, i)" class="expand-btn" >Details</div>
                    </div>
                </li>
                <template v-if="param.isExpand"> 
                    <li class="in-details">
                        <table class="ms-4 my-3" >
                            <thead>
                                <th style="width: 100px;" >Default</th>
                                <th style="width: 100px;" >Type</th>
                                <th>Description</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td> 
                                        <template v-if="param.defaultValue.type == 'object'">
                                            <pre>  {{ param.defaultValue }} <span v-if="param.defaultValue_forCopy" class="copy" @click.stop="copy($event, param.defaultValue_forCopy)">copy</span></pre> 
                                        </template>    
                                        <template v-else>
                                            {{ param.defaultValue }} 
                                            <span v-if="param.defaultValue_forCopy" class="copy" @click.stop="copy($event, param.defaultValue_forCopy)">copy</span>
                                        </template>
                                    </td>
                                    <td> {{ param.type }} </td>
                                    <td> <div class="mt-3" v-html="param.description"></div> </td>
                                </tr>
                                <template v-if="param.availableValue">
                                    <tr>
                                        <td colspan="3"> 
                                            <template v-if="param.name == 'useCustomRange'">
                                                Available Parameters.  
                                                <p>You can pass just 'true' or Array, Array example is below</p>
                                                <span class="copy" @click.stop="copy($event, allCustomRangePattern)">copy</span>
                                            </template>
                                            <template v-else>
                                                Available Parameters :: <span v-if="param.availableValue.type == 'string'" > {{ param.availableValue.value }} </span>
                                            </template>
                                        </td>                                    
                                    </tr>                                   
                                    <tr v-if="param.availableValue.type != 'string'">
                                        <td colspan="3"> 
                                            <template v-if="param.name == 'displayIn'">
                                                <table class="ms-2 my-2" >
                                                    <thead>
                                                        <th style="width: 100px;" >postion</th>
                                                        <th class="text-center" style="width: 100%">View</th>
                                                    </thead>
                                                    <tbody>
                                                        <template v-for="(position, di) in param.availableValue.value" :key="di">
                                                            <tr>
                                                                <td>{{position}} <span class="copy" @click.stop="copy($event, position)">copy</span></td>
                                                                <td> 
                                                                    
                                                                    <div class="display-area" :class="[`position-${position}`]">
                                                                        <input type="text" :placeholder="moment().format(FORMATS.date)" />
                                                                        <div class="picker-sample" :style="allPositions[position]"> </div>
                                                                    </div>
                                                                    
                                                                </td>
                                                            </tr>
                                                        </template>
                                                    </tbody>
                                                </table>
                                            </template>
                                            <template v-else>
                                                <span v-if="param.foCopy" class="copy" @click.stop="copy($event, param.foCopy)">copy</span>
                                                <pre v-if="param.availableValue.type == 'array'" >  {{ param.availableValue.value }} </pre>    
                                            </template>
                                        </td>
                                    </tr>                                   
                                </template>
                                
                            </tbody>
                        </table>
                    </li>
                </template>  
            </ul>
        </div>
    </div>
</template>

<style scoped>
h1,h2,h3,h4,h5,h6,p,span,div,a,small, td, li{
    color: v-bind(color_font_dark);
}
h6{
    font-size: 14px !important;
}
thead{
    border-bottom: 1px solid v-bind(color_font_dark);
}
.flex-between{
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.expandalbe-area{
    padding: 5px;
}
.expand-btn{
    padding: 5px;
    border-radius: 6px;
    border: 1px solid v-bind(color_primary_bg);
    background-color: v-bind(color_transparent_1);
    cursor: pointer;
}
.in-details{
    padding: 15px;
    border-radius: 2px;
    border: 1px solid v-bind(color_primary_bg);
    max-height: 315px;
    overflow-y: scroll;
}

.doc{
    background-color: v-bind(color_body_bg);
    position: absolute;
    width: 500px;
    height: 500px;
    z-index: 10;
    padding: 10px;
    left: 0;
    bottom: 0;
    margin-left: 50%;
    transform: translateX(-50%);
    border-radius: 6px;
}
.doc > .contents{
    width: 100%;
    height: 100%;
    max-height: 100%;   
    overflow-y: scroll;
    padding: 10px;
}
pre {
    display: block;
    margin-top: 0;
    margin-bottom: 1rem;
    overflow: auto;
    font-size: .875em;
    max-height: 250px;
    overflow-y: auto;
}
.display-area{
    width: 280px;
    height: 200px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}


.display-area input[type="text"] {
    color: v-bind(color_font_dark);
    border: 1px solid v-bind(color_font_dark);
    background-color: transparent;
    width: 82px;
    height: 28px;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
    background-clip: padding-box;
    display: block;
    border-radius: 3px;
    box-shadow: none;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    outline: 0;
}
.display-area .picker-sample {
    padding: 8px 4px;
    border-radius: 3px;
    border: 1px solid v-bind(color_font_dark);
    background-color: v-bind(color_transparent_2);
    position: absolute;
    width: 60px;
    height: 80px;
}
.display-area.position-modal {
    background-color: #0000006b;    
}
.display-area.position-modal input {
    display: none;
}
@keyframes fadeUp {
    from {
        opacity: var(--opa, 0);
    }

    to {
        opacity: 1;
    }
}

/* Example usage on an element */
.fadeUp {
    animation: fadeUp .5s ease-in-out;
}
</style>

<style>

.higlight44{
    padding: 0px 4px 1px 4px;
    border-radius: 3px;
    height: 17px;
    color: v-bind(color_primary_bg);
    border: 1px solid v-bind(color_transparent_1);
    background-color: v-bind(color_transparent_2);
}
.doc h6{
    font-size: 14px !important;
}
.doc .copy{
    font-size: 12px;
    padding: 1px 2px;
    border-radius: 3px;
    cursor: pointer;
    color: v-bind(color_font_dark_low);
    border: 1px solid v-bind(color_bg_grey);
    background-color: v-bind(color_transparent_2);
}
.doc .copy:hover{
    color: v-bind(color_font_dark);
    border: 1px solid v-bind(primary_bg);
    background-color: v-bind(color_primary_bg);
}
</style>