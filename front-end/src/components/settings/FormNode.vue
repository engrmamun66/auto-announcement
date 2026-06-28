<script setup>
import { computed } from 'vue';

const props = defineProps({
    obj:      { required: true },
    propKey:  { required: true },
    label:    { type: String,  default: '' },
    depth:    { type: Number,  default: 0  },
});

const val = computed(() => props.obj[props.propKey]);

const type = computed(() => {
    const v = val.value;
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'boolean') return 'boolean';
    if (typeof v === 'number')  return 'number';
    if (Array.isArray(v)) {
        if (v.length === 0) return 'array-primitive';
        return (typeof v[0] === 'object' && v[0] !== null) ? 'array-object' : 'array-primitive';
    }
    if (typeof v === 'object') return 'object';
    if (typeof v === 'string') {
        const isMessageTemplate = /message_template/i.test(props.propKey);
        return (isMessageTemplate || v.includes('\n') || v.length > 120) ? 'textarea' : 'string';
    }
    return 'string';
});

function set(v)           { props.obj[props.propKey] = v; }
function setIdx(i, v)     { props.obj[props.propKey][i] = v; }
function removeIdx(i)     { props.obj[props.propKey].splice(i, 1); }
function deleteKey()      { delete props.obj[props.propKey]; }
function addPrimitive()   { props.obj[props.propKey].push(''); }
function addObject()      { const t = props.obj[props.propKey][0]; props.obj[props.propKey].push(t ? JSON.parse(JSON.stringify(t)) : {}); }

function keyToLabel(k) {
    return String(k)
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}
</script>

<template>
    <div class="fn" :class="`fn--d${Math.min(depth, 3)}`">

        <!-- boolean -->
        <label v-if="type === 'boolean'" class="fn__toggle">
            <div class="fn__toggle-track" :class="{ active: val }" @click="set(!val)">
                <div class="fn__toggle-thumb"></div>
            </div>
            <span class="fn__lbl">{{ keyToLabel(label || propKey) }}</span>
        </label>

        <!-- number -->
        <div v-else-if="type === 'number'" class="fn__row">
            <label class="fn__lbl">{{ keyToLabel(label || propKey) }}</label>
            <input class="fn__input fn__input--num" type="number" :value="val"
                @input="set(Number($event.target.value))" />
        </div>

        <!-- string -->
        <div v-else-if="type === 'string'" class="fn__row">
            <label class="fn__lbl">{{ keyToLabel(label || propKey) }}</label>
            <input class="fn__input" type="text" :value="val"
                @input="set($event.target.value)" />
        </div>

        <!-- textarea -->
        <div v-else-if="type === 'textarea'" class="fn__col">
            <label class="fn__lbl">{{ keyToLabel(label || propKey) }}</label>
            <textarea class="fn__textarea" :value="val" rows="8"
                @input="set($event.target.value)"></textarea>
        </div>

        <!-- nested object -->
        <div v-else-if="type === 'object'" class="fn__group">
            <div v-if="depth > 0" class="fn__group-label-row">
                <span class="fn__group-label">{{ keyToLabel(label || propKey) }}</span>
                <button class="fn__arr-rm" @click="deleteKey()">×</button>
            </div>
            <div class="fn__group-body">
                <FormNode v-for="(v, k) in val" :key="k"
                    :obj="val" :propKey="k" :label="String(k)" :depth="depth + 1" />
            </div>
        </div>

        <!-- array of primitives (strings/numbers) -->
        <div v-else-if="type === 'array-primitive'" class="fn__col">
            <label class="fn__lbl">{{ keyToLabel(label || propKey) }}</label>
            <div class="fn__arr-prim">
                <div v-for="(item, i) in val" :key="i" class="fn__arr-item">
                    <input class="fn__input" type="text" :value="item"
                        @input="setIdx(i, $event.target.value)" />
                    <button class="fn__arr-rm" @click="removeIdx(i)">×</button>
                </div>
                <button class="fn__arr-add" @click="addPrimitive()">+ Add</button>
            </div>
        </div>

        <!-- array of objects -->
        <div v-else-if="type === 'array-object'" class="fn__col">
            <label class="fn__lbl">{{ keyToLabel(label || propKey) }}</label>
            <div v-for="(item, i) in val" :key="i" class="fn__obj-item">
                <div class="fn__obj-item-head">
                    <span class="fn__obj-item-num">#{{ i + 1 }}</span>
                    <button class="fn__arr-rm" @click="removeIdx(i)">×</button>
                </div>
                <div class="fn__obj-item-body">
                    <FormNode v-for="(v, k) in item" :key="k"
                        :obj="item" :propKey="k" :label="String(k)" :depth="depth + 1" />
                </div>
            </div>
            <button class="fn__arr-add" @click="addObject()">+ Add Item</button>
        </div>

    </div>
</template>

<style scoped>
.fn { width: 100%; }

.fn__lbl {
    font-size: 11px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 4px;
    display: block;
}

.fn__row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
}
.fn__row .fn__lbl { margin: 0; flex-shrink: 0; width: 160px; }
.fn__row .fn__input { flex: 1; }

.fn__col { display: flex; flex-direction: column; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }

.fn__input {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 13px;
    color: #222;
    background: #fff;
    outline: none;
    width: 100%;
    box-sizing: border-box;
}
.fn__input:focus { border-color: #4caf50; }
.fn__input--num { max-width: 100px; }

.fn__textarea {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 8px;
    font-size: 12px;
    font-family: monospace;
    color: #222;
    background: #fff;
    outline: none;
    resize: vertical;
    width: 100%;
    box-sizing: border-box;
    line-height: 1.5;
}
.fn__textarea:focus { border-color: #4caf50; }

/* Toggle */
.fn__toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
}
.fn__toggle .fn__lbl { margin: 0; cursor: pointer; }
.fn__toggle-track {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: #ccc;
    position: relative;
    flex-shrink: 0;
    transition: background 0.2s;
}
.fn__toggle-track.active { background: #4caf50; }
.fn__toggle-thumb {
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.fn__toggle-track.active .fn__toggle-thumb { left: 18px; }

/* Nested object group */
.fn__group { padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
.fn__group-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}
.fn__group-label {
    font-size: 11px;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}
.fn__group-body {
    padding-left: 12px;
    border-left: 2px solid #e8e8e8;
}
.fn--d1 .fn__group-body { border-left-color: #d0d0d0; }
.fn--d2 .fn__group-body { border-left-color: #b8b8b8; }

/* Array primitives */
.fn__arr-prim { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
.fn__arr-item { display: flex; gap: 6px; align-items: center; }
.fn__arr-item .fn__input { flex: 1; }

/* Array of objects */
.fn__obj-item {
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    margin-top: 6px;
    overflow: hidden;
}
.fn__obj-item-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f5f5f5;
    padding: 4px 10px;
}
.fn__obj-item-num { font-size: 11px; font-weight: 700; color: #888; }
.fn__obj-item-body { padding: 8px 12px; }

/* Add/remove buttons */
.fn__arr-rm {
    background: #fee;
    border: 1px solid #fcc;
    color: #e53;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 14px;
    cursor: pointer;
    flex-shrink: 0;
    line-height: 1;
}
.fn__arr-rm:hover { background: #fdd; }
.fn__arr-add {
    background: #f0faf0;
    border: 1px dashed #4caf50;
    color: #4caf50;
    border-radius: 6px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 6px;
    width: 100%;
}
.fn__arr-add:hover { background: #e8f5e9; }
</style>
