<script setup>
import { ref } from 'vue'

let props = defineProps({
    message: { type: String, default: '' },
    checking: { type: Boolean, default: false },
})
let emits = defineEmits(['tryToUnlock'])

function delay(callback, time = 0, ...args) {
    setTimeout(() => { callback(...args); }, time);
}

let wrapper = ref(null)
let shutterSvgRef = ref(null)
let apertureRef = ref(null)

function toggleLock(emitR = true) {
    var lock = document.getElementById("lockSVG");
    var isLocked = lock.getAttribute("data-locked") === "true";
    var lockPin = lock.querySelector(".lockPinGroup");
    if (isLocked) {
        lockPin.classList.add("unlocking");
        lockPin.classList.remove("locking");
    } else {
        lockPin.classList.add("locking");
        lockPin.classList.remove("unlocking");
    }
    lock.setAttribute("data-locked", !isLocked);
    if (emitR) emits('tryToUnlock', true);
}

function closeShutter() {
    const svg = shutterSvgRef.value;
    const hole = apertureRef.value;
    if (!svg || !hole) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = vw / 2;
    const cy = vh / 2;
    const size = Math.max(vw, vh) * 0.7;

    const openPts = Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60 - 90) * Math.PI / 180;
        return [cx + size * Math.cos(a), cy + size * Math.sin(a)];
    });

    hole.setAttribute('points', openPts.map(([x, y]) => `${x},${y}`).join(' '));
    svg.style.opacity = '1';

    const duration = 680;
    const start = performance.now();

    function animate(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const rot = ease * 28 * Math.PI / 180;

        const pts = openPts.map(([x, y]) => {
            const dx = (x - cx) * (1 - ease);
            const dy = (y - cy) * (1 - ease);
            const rx = cx + dx * Math.cos(rot) - dy * Math.sin(rot);
            const ry = cy + dx * Math.sin(rot) + dy * Math.cos(rot);
            return `${rx.toFixed(1)},${ry.toFixed(1)}`;
        });

        hole.setAttribute('points', pts.join(' '));
        if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

defineExpose({
    unlock: function () {
        if (wrapper.value) {
            wrapper.value.style.setProperty('--unlock-percent', '-15%');
        }
        toggleLock(false);
        closeShutter();
    },
})
</script>

<template>
    <div class="lockscreen" ref="wrapper">

        <!-- Camera iris shutter overlay (plays on unlock) -->
        <svg ref="shutterSvgRef" class="shutter-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <mask id="iris-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <polygon ref="apertureRef" fill="black" points="0,0" />
                </mask>
            </defs>
            <rect width="100%" height="100%" fill="#0c0c0c" mask="url(#iris-mask)" />
        </svg>

        <!-- Background texture strips -->
        <div class="ls-bg-strips"></div>

        <!-- Card -->
        <div class="ls-body">
            <div class="ls-card">

                <div class="ls-lock-wrap">
                    <div class="ls-glow"></div>
                    <svg version="1.1" id="lockSVG" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 -60 166.7 308.6"
                        style="max-width:100%;height:auto;display:block;"
                        xml:space="preserve"
                        data-locked="true"
                        @click="toggleLock(); delay(toggleLock, 0)">
                        <g class="lockPinGroup">
                            <path class="lockPin"
                                d="M93.4,4H71.8C42.1,4,17.9,28.1,17.9,57.9v117.5H37V57.9C37,38.7,52.6,23,71.8,23h21.6
                                c19.2,0,34.9,15.6,34.9,34.9v50h4.3v7.4h-4.3v6.2h19.1v-6.2H143v-7.4h4.3v-50C147.4,28.1,123.2,4,93.4,4z" />
                        </g>
                        <g class="lockBodyGroup">
                            <path class="lockBody"
                                d="M157.6,99.3H9.1c-4,0-7.2,3.1-7.2,6.8v131.7c0,3.8,3.2,6.8,7.2,6.8h148.5c4,0,7.2-3.1,7.2-6.8V106.1
                                C164.8,102.4,161.6,99.3,157.6,99.3z" />
                            <path class="lockBody" d="M5,243.4l-2-1.9C3.5,242.2,4.2,242.8,5,243.4z" />
                            <path class="lockKeyHole"
                                d="M83.4,147.6c-8.3,0-14.9,6.7-14.9,14.9c0,6,3.6,11.2,8.7,13.6v14c0,3.5,2.8,6.3,6.3,6.3
                                s6.3-2.8,6.3-6.3v-14c5.1-2.4,8.7-7.5,8.7-13.6C98.3,154.3,91.6,147.6,83.4,147.6z" />
                            <path class="lockSoftShadow"
                                d="M157.6,99.3H9.1c-3.1,0-5.7,1.8-6.8,4.4c24,4.9,51.6,7.7,81,7.7s56.9-2.8,81-7.7
                                C163.3,101.2,160.7,99.3,157.6,99.3z" />
                            <path class="lockShadow"
                                d="M2.4,240.2c1,2.6,3.7,4.4,6.8,4.4h148.5c3.1,0,5.7-1.9,6.8-4.4c-24-4.9-51.6-7.7-81-7.7
                                S26.4,235.2,2.4,240.2z" />
                        </g>
                    </svg>
                </div>

                <h2 class="ls-title">Access Restricted</h2>

                <p v-if="props.message" class="ls-message" v-html="props.message"></p>

                <div v-if="props.checking" class="ls-checking">
                    <span class="ls-dot"></span>
                    <span class="ls-dot"></span>
                    <span class="ls-dot"></span>
                </div>
                <p v-else class="ls-hint">Click the lock to authenticate</p>

            </div>
        </div>
    </div>
</template>

<style scoped>

/* ------------------------------------------------------------------ */
/*  Full-screen container                                               */
/* ------------------------------------------------------------------ */
.lockscreen {
    position: fixed;
    inset: 0;
    background: #16130d;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    overflow: hidden;
}

/* ------------------------------------------------------------------ */
/*  Diagonal-stripe texture (same concept as before)                   */
/* ------------------------------------------------------------------ */
.ls-bg-strips {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}
.ls-bg-strips::before,
.ls-bg-strips::after {
    content: "";
    position: absolute;
    background:
        linear-gradient(90deg,  transparent 50%, #000 50%, #111),
        linear-gradient(82deg,  transparent 50%, #3e3704 50%),
        linear-gradient(67deg,  transparent 50%, #111 50%),
        linear-gradient(52deg,  transparent 50%, #3e3704 50%),
        linear-gradient(37deg,  transparent 50%, #111 50%),
        linear-gradient(22deg,  transparent 50%, #3e3704 50%),
        linear-gradient(7deg,   transparent 50%, #111 50%),
        linear-gradient(-8deg,  transparent 50%, #3e3704 50%),
        linear-gradient(-23deg, transparent 50%, #111 50%),
        linear-gradient(-38deg, transparent 50%, #3e3704 50%),
        linear-gradient(-53deg, transparent 50%, #111 50%),
        linear-gradient(-68deg, transparent 50%, #3e3704 50%),
        linear-gradient(-83deg, transparent 50%, #111 50%),
        linear-gradient(-90deg, transparent 50%, #3e3704 50%);
    background-size: 200% 100%;
    padding-top: 80%;
    width: 50%;
    top: 0;
    left: 0;
    opacity: 0.55;
}
.ls-bg-strips::after {
    left: 50%;
    transform: rotate(180deg);
}

/* ------------------------------------------------------------------ */
/*  Card                                                                */
/* ------------------------------------------------------------------ */
.ls-body {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
}

.ls-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border: 1px solid rgba(255, 215, 0, 0.18);
    border-radius: 28px;
    padding: 44px 52px 36px;
    text-align: center;
    max-width: 340px;
    width: calc(100vw - 48px);
    box-shadow:
        0 24px 80px rgba(0, 0, 0, 0.65),
        0 0 0 1px rgba(255, 255, 255, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

/* ------------------------------------------------------------------ */
/*  Lock icon + glow                                                    */
/* ------------------------------------------------------------------ */
.ls-lock-wrap {
    position: relative;
    display: inline-block;
    width: min(34vh, 38vw);
    max-width: 160px;
    margin-bottom: 24px;
    cursor: pointer;
}

.ls-glow {
    position: absolute;
    inset: -45%;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.28) 0%, transparent 65%);
    border-radius: 50%;
    animation: glow-pulse 2.6s ease-in-out infinite;
    pointer-events: none;
}

@keyframes glow-pulse {
    0%, 100% { transform: scale(0.88); opacity: 0.55; }
    50%       { transform: scale(1.12); opacity: 1; }
}

#lockSVG { cursor: pointer; }
#lockSVG:hover .lockBody { fill: #ffe44d; }

/* ------------------------------------------------------------------ */
/*  Text                                                                */
/* ------------------------------------------------------------------ */
.ls-title {
    color: #f0e6c0;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin: 0 0 8px;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.ls-message {
    color: rgba(255, 230, 160, 0.85);
    font-size: 0.88rem;
    line-height: 1.6;
    margin: 0 0 12px;
    padding: 10px 14px;
    background: rgba(255, 180, 0, 0.08);
    border: 1px solid rgba(255, 180, 0, 0.2);
    border-radius: 10px;
    text-align: center;
    direction: auto;
}

.ls-hint {
    color: rgba(255, 255, 255, 0.38);
    font-size: 0.78rem;
    margin: 0;
    letter-spacing: 0.03em;
}

.ls-checking {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 4px;
}
.ls-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255, 215, 0, 0.6);
    animation: dot-pulse 1.2s ease-in-out infinite;
}
.ls-dot:nth-child(2) { animation-delay: 0.2s; }
.ls-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-pulse {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
    40%            { transform: scale(1.1); opacity: 1; }
}

/* ------------------------------------------------------------------ */
/*  Lock SVG colours                                                    */
/* ------------------------------------------------------------------ */
.lockPin        { fill: #e6e6e6; }
.lockShadow     { opacity: 0.15; fill: #000; }
.lockBody       { fill: #ffd700; transition: fill 0.2s; }
.lockKeyHole    { opacity: 0.75; fill: #000; }
.lockSoftShadow { opacity: 0.1;  fill: #000; }

/* ------------------------------------------------------------------ */
/*  Lock pin animation keyframes                                        */
/* ------------------------------------------------------------------ */
@keyframes lockUnlockBounce {
    0%, 50% { transform: translateY(0); }
    25%      { transform: translateY(2%); }
    100%     { transform: translateY(var(--unlock-percent, -2%)); }
}
@keyframes lockLockBounce {
    0%        { transform: translateY(var(--unlock-percent, -2%)); }
    50%, 100% { transform: translateY(0); }
    75%       { transform: translateY(2%); }
}

.lockPinGroup.unlocking { animation: lockUnlockBounce 0.25s ease-out forwards; }
.lockPinGroup.locking   { animation: lockLockBounce   0.25s ease-in  forwards; }

/* ------------------------------------------------------------------ */
/*  Camera iris shutter SVG overlay                                     */
/* ------------------------------------------------------------------ */
.shutter-svg {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 9;
    opacity: 0;
    pointer-events: none;
}

</style>
