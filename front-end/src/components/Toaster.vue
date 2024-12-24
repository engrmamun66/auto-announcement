<template>
  <div></div>
</template>

<script setup>
// Codepen Documentation: https://codepen.io/fmazelier/pen/oNwjzpQ
import { onMounted, inject, ref } from 'vue'
let emitter = inject('emitter')
"use strict";
class SwipeHandler {
  getSwipeDirection({ touchstartX, touchstartY, touchendX, touchendY }) {
    const delx = touchendX - touchstartX;
    const dely = touchendY - touchstartY;
    if (Math.abs(delx) > Math.abs(dely)) {
      return delx > 0 ? "right" : "left";
    }
    if (Math.abs(delx) < Math.abs(dely)) {
      return dely > 0 ? "down" : "up";
    }
    return "tap";
  }
}
const svgIcons = [
  {
    name: "icon-success",
    svg: `
      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
        <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z'/>
      </svg>
    `
  },
  {
    name: "icon-system",
    svg: `
      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
        <path d='M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z'/>
      </svg>
    `
  },
  {
    name: "icon-error",
    svg: `
      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
        <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z'/>
      </svg>
    `
  },
  {
    name: "icon-warning",
    svg: `
      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
        <path d='M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'/>
      </svg>
    `
  },
  {
    name: "x-lg",
    svg: `
      <svg xmlns='http://www.w3.org/2000/svg' class='t-close' width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
        <path d='M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z'/>
      </svg>
    `
  }
];
class ToastsFactory {
  
  constructor(swipeHandler) {
    this.swipeHandler = swipeHandler;
    this.createToastsContainer();
    this.createToastsFromButtons();
  }
  createToastsContainer() {
    const toastsContainer = document.createElement("div");
    toastsContainer.classList.add("toasts-container");
    this.toastsContainer = toastsContainer;
    document.body.appendChild(toastsContainer);
  }
  createToastsFromButtons() {
    document.addEventListener("click", (e) => {
      // check is the right element clicked
      if (!e.target.matches(".btn-toast"))
        return;
      const dataset = e.target.dataset;
      const config = {
        type: dataset.type,
        icon: dataset.icon,
        message: dataset.message,
        duration: dataset.duration
          ? parseInt(dataset.duration, 10)
          : undefined
      };
      this.createToast(config);
    }, false);
  }
  createToast({ type, icon, message, duration }) {
    const toast = this.createToastContainer(type);
    this.addToastElement(toast, "t-icon", svgIcons.find((item) => item.name === icon).svg);
    this.addToastElement(toast, "t-message", message);
    this.addCloseButton(toast);
    const progressBar = this.getProgressBar(duration);
    progressBar && toast.appendChild(progressBar);
    // toasts can be closed on right swipe, comment this line if it's useless in your case
    this.observeSwipe(toast, "right");
    this.toastsContainer.appendChild(toast);
    // if duration is 0, toast message will not be closed automatically
    if (!progressBar)
      return;
    progressBar.onanimationend = () => this.removeToast(toast);
  }
  createToastContainer(type) {
    const toast = document.createElement("div");
    toast.classList.add("toast", type, "active");
    return toast;
  }
  addToastElement(toast, className, content) {
    const element = document.createElement("div");
    element.classList.add(className);
    element.innerHTML = content;
    toast.appendChild(element);
    return element;
  }
  addCloseButton(toast) {
    const closeButton = this.addToastElement(toast, "t-close", svgIcons.find((icon) => icon.name === "x-lg").svg);
    closeButton.onclick = () => this.removeToast(toast);
  }
  getProgressBar(duration) {
    // duration is infinite => no progress bar
    if (duration === 0)
      return;
    const progressBar = document.createElement("div");
    progressBar.classList.add("t-progress-bar");
    duration &&
      progressBar.style.setProperty("--toast-duration", `${duration}ms`);
    return progressBar;
  }
  removeToast(toast) {
    toast.classList.remove("active");
    // we wait for the end of the animation to remove the element from the DOM
    toast.onanimationend = (evt) => {
      // needed to filter progressBar animation
      evt.target === toast && toast.remove();
    };
  }
  observeSwipe(toast, direction) {
    let touchstartX = 0, touchstartY = 0, touchendX = 0, touchendY = 0;
    toast.addEventListener("touchstart", (event) => {
      // needed to avoid weird behavior on swipe
      globalThis.document.body.style.overflow = "hidden";
      touchstartX = event.changedTouches[0].screenX;
      touchstartY = event.changedTouches[0].screenY;
    }, { passive: true });
    toast.addEventListener("touchend", (event) => {
      globalThis.document.body.style.overflow = "unset";
      touchendX = event.changedTouches[0].screenX;
      touchendY = event.changedTouches[0].screenY;
      const swipeConfig = {
        touchstartX,
        touchstartY,
        touchendX,
        touchendY
      };
      this.swipeHandler.getSwipeDirection(swipeConfig) === direction &&
        this.removeToast(toast);
    }, { passive: true });
  }
}
onMounted(() => {
  
    const swipeHandler = new SwipeHandler();
    const toastsFactory = new ToastsFactory(swipeHandler);
    // manual creation from method


    /**
     * == Icon names ==
     * icon-success
     * icon-system
     * icon-warning
     * icon-error
     */ 

     function clearAll(){
      let els = document.querySelectorAll('.toasts-container');
      els.forEach(function(el){
        el.innerHTML = '';
      });
     }

    ['success', 'error', 'warning', 'system'].forEach(type => {   
      emitter.on(`toaster-${type}`, ({ message='', duration=3000 })=>{
        clearAll()
        toastsFactory.createToast({
          type: type,
          icon: `icon-${type}`,
          message,
          duration: duration, // default 5000
        });
      })
    })
 
})


</script>

<style>
:root {
  --snakbar-white: #fff;
  --snakbar-green: #015af0;
  --snakbar-blue: #2896f3;
  --snakbar-yellow: #bf9303;
  --snakbar-red: #f55153;
  --snakbar-duration: 0.25s;
  --snakbar-radius: 4px;
}

*,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

h1 {
  text-align: center;
  font-size: clamp(20px, 3vw, 4rem);
}

.buttons-container {
  display: flex;
  align-items: center;
  height: calc(100vh - 10.4rem);
  flex-wrap: wrap;
  justify-content: center;
  padding: 1.1rem;
}

.buttons-container .btn-toast {
  padding: 0.8rem 1.6rem;
  font-size: 1.6rem;
  transition: filter var(--snakbar-duration);
  cursor: pointer;
  color: #fff;
}

.buttons-container .btn-toast:not(:last-child) {
  margin-right: 0.8rem;
}

.buttons-container .btn-toast[data-type=success] {
  background-color: var(--snakbar-green);
}

.buttons-container .btn-toast[data-type=system] {
  background-color: var(--snakbar-blue);
}

.buttons-container .btn-toast[data-type=warning] {
  background-color: var(--snakbar-yellow);
}

.buttons-container .btn-toast[data-type=error] {
  background-color: var(--snakbar-red);
}

.buttons-container .btn-toast:hover {
  filter: opacity(0.9);
}

/* -------------------------------------------------------------------------- */
/*                              Main Toaster CSS                              */
/* -------------------------------------------------------------------------- */

/* .toasts-container {
  position: fixed;
  top: 0;
  right: 0;
  padding: 1.1rem;
  z-index: 1000000000;
} */
.toasts-container {
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 0px 1.1rem;
  z-index: 1000000000;
}

:has(.rightbar) .toasts-container{
  top: 50px;
}

.toasts-container .toast {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 50rem;
  min-width: 28rem;
  min-width: 24rem;
  background-color: #121212;
  border-radius: var(--snakbar-radius);
  padding: 1.1rem;
  margin-bottom: 1.1rem;
  opacity: 0;
  transform: translateX(100%);
  animation: toast-opening var(--snakbar-duration) ease-in-out forwards;
  overflow-x: hidden;
}

@media screen and (max-width: 600px){
  .toasts-container .toast {
    min-width: 18rem;
  }

}

.toasts-container .toast:not(.active) {
  animation-name: toast-closing;
  animation-duration: 0.35s;
}

.toasts-container .toast .t-icon {
  margin-right: 1.1rem;
}

.toasts-container .toast .t-icon svg {
  fill: var(--snakbar-white);
  width: 1.1rem;
  height: 1.1rem;
}

.toasts-container .toast .t-message {
  margin-right: 1.1rem;
  color: var(--snakbar-white);
  line-height: 22px;
  font-size: 16px;
  line-break: auto;
}

.toasts-container .toast .t-close svg {
  fill: var(--snakbar-white);
  opacity: 1;
  width: 1.01rem;
  height: 1.01rem;
  transition: opacity var(--snakbar-duration);
  cursor: pointer;
}

@media (hover: hover) {
  .toasts-container .toast .t-close svg {
    opacity: 0.5;
  }
}

.toasts-container .toast .t-close:hover svg {
  opacity: 1;
}

.t-message{
  width: 100%;
}

.toasts-container .toast .t-progress-bar {
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 6px;
  width: 100%;
  border-radius: 0 0 0 0.5rem;
  background-color: rgba(255, 255, 255, 0.5);
  animation: progress-bar-animation linear forwards var(--toast-duration, 3000ms);
  transform-origin: left;
}

.toasts-container .toast.success {
  background-color: var(--snakbar-green);
}

.toasts-container .toast.system {
  background-color: var(--snakbar-blue);
}

.toasts-container .toast.warning {
  background-color: var(--snakbar-yellow);
}

.toasts-container .toast.error {
  background-color: var(--snakbar-red);
}

@keyframes toast-opening {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0%);
  }
}

@keyframes toast-closing {
  0% {
    opacity: 1;
    transform: translateX(0%);
  }

  75% {
    max-height: 15rem;
    padding: 1.1rem;
    opacity: 0;
    transform: translateX(100%);
  }

  100% {
    max-height: 0;
    padding: 0;
    transform: translateX(100%);
  }
}

@keyframes progress-bar-animation {
  to {
    transform: scaleX(0);
  }
}
</style>