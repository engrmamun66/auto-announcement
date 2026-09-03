<script setup>
import { inject, ref } from "vue";
import Btn from '../components/Btn.vue'
import helper from '../utilities/helper'

const emitter = inject('emitter');
const http = inject('http');
const all_students_non_copied = inject('all_students_non_copied');
const appAccessData = inject('appAccessData');

let CONFIG = inject('CONFIG');
const log = console.log

const ip = globalThis.GLOBAL_DATA?.env?.LOCAL_IP || 'localhost'
const mac = globalThis.GLOBAL_DATA?.env?.MAC_ADDRESS || 'unknown'

function routerInstructions(){
  console.group('Permanent IP fixing from router admin') 
  console.group('1. Find something like:')
    console.log("DHCP Reservation")
    console.log("Address Reservation")
    console.log("Static DHCP")
    console.log("IP & MAC Binding")
  console.groupEnd()
    
  console.group("2. Add your PC's MAC address and assign, for example:") 
    console.log("MAC: " + mac)
    console.log("Finally restart the router.")
  console.groupEnd()
  
  console.groupEnd()
}

let restarting = ref(false)
async function restartServer() {
  restarting.value = true
  try {
    await http.get('/refresh')
    emitter.emit('toaster-success', { message: helper.t('Server restarting...') })
  } catch (_) {
    emitter.emit('toaster-success', { message: helper.t('Server restarting...') })
  } finally {
    restarting.value = false
    
    setTimeout(() => {
      emitter.emit('toaster-success', { message: helper.t('Reloading...') })
      window.location.reload()
    }, 3000)
  }
}
 
function CopyCode() {
  if(CONFIG.value?.env?.CODE_NUMBER){
    helper.copyToClipboard(CONFIG.value?.env?.CODE_NUMBER);
    emitter.emit('toaster-success', {message: helper.t('Code number copied to clipboard!')});
  } else {
    emitter.emit('toaster-error', {message: helper.t('Code number not found, please contact support.')});
  }
}


</script>

<template>
  <!-- Contact Wrap -->
  <div class="container">
    <div class="header">
      <!-- <p class="ip-badge" @click.stop="routerInstructions()">{{ helper.t('Server IP:') }} <strong>{{ ip }}</strong></p>
      <p class="ip-badge ms-2" @click.stop="routerInstructions()">{{ helper.t('PC MAC Address:') }} <strong>{{ mac }}</strong></p> -->
      <h1>{{ helper.t('Contact Information') }}</h1>
      <p class="mt-3">
        {{ helper.t('Find all our contact details, office location, visit hours, and payment information below.') }}
      </p>
    </div>





    <div class="row mt-4 mb-3">
      <div class="col-12">
        <div class="students-stat-card">
          <div class="students-stat-card__glow"></div>
          <div class="students-stat-card__body">
            <div class="students-stat-card__icon">
              ৳
            </div>
            <div class="students-stat-card__info">
              <span class="students-stat-card__label">{{ helper.t('Payable amout') }}</span>
              <span class="students-stat-card__count">{{ all_students_non_copied?.length ?? 0 }} <span class="students-stat-card__count_sub">x&nbsp;&nbsp;{{appAccessData?.cost_perhead || 15}} tk</span> = {{ all_students_non_copied?.length * (appAccessData?.cost_perhead || 15) }} tk</span>
            </div>
            <div class="students-stat-card__badge">
              <i class='bx bx-transfer-alt'></i> {{ helper.t('About payment') }}
            </div>
          </div>
          <p class="students-stat-card__notice">
            <i class='bx bx-info-circle'></i>
            উপরের হিসাবটি শুধুমাত্র প্রকৃত (ডুপ্লিকেট বাদে) শিক্ষার্থীদের উপর ভিত্তি করে তৈরি করা হয়েছে। অনুগ্রহ করে নির্ধারিত পরিমাণ পরিশোধ করুন — অতিরিক্ত কার্ড বাবহারকারিদের গণনায় অন্তর্ভুক্ত করা হয়নি, তাই এই সংখ্যাটিই আপনার প্রদেয় বিলের ভিত্তি।
          </p>
        </div>
      </div>
    </div>

    <div class="row mt-4">
        <div class="col-12">
            <div class="whatsapp-card">
                <div class="whatsapp-content">
                    <div class="whatsapp-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                        </svg>
                    </div>
                    <div class="whatsapp-text">
                        <h4>{{ helper.t('Need instant help? Chat with us on WhatsApp!') }}</h4>
                        <p class="mb-0">{{ helper.t('Get quick responses to your queries. Our team is available during business hours to assist you.') }}</p>
                    </div>
                    <div class="whatsapp-button">
                        <a href="https://wa.me/8801951259460" target="_blank" class="btn btn-success btn-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                            </svg>
                            {{ helper.t('Open WhatsApp') }}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>



    <div class="row g-4">
      <!-- Card 1: Information -->
      <div class="col-md-6 col-lg-3">
        <div class="info-card card-1">
          <div class="card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
              />
            </svg>
          </div>
          <h3 class="card-title">{{ helper.t('Information') }}</h3>
          <div class="card-body">
            <div class="contact-detail">
              <i class="bi bi-telephone-fill"></i>
              <div>{{ helper.t('Mobile:') }} <strong>01617-207878</strong></div>
            </div>
            <div class="contact-detail">
              <i class="bi bi-telephone-fill"></i>
              <div>{{ helper.t('Mobile:') }} <strong>01951-258460</strong></div>
            </div>
            <div class="contact-detail">
              <i class="bi bi-envelope-fill"></i>
              <div>{{ helper.t('Email:') }} <strong><a href="mailto:mamun@softproit.com">mamun@softproit.com</a></strong></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Visit Us / Office Location -->
      <div class="col-md-6 col-lg-3">
        <div class="info-card card-2">
          <div class="card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
              />
            </svg>
          </div>
          <h3 class="card-title">{{ helper.t('Visit Us / Office Location') }}</h3>
          <div class="card-body">
            <p>
              {{ helper.t('House # 40, Road # 1, Block # C, Eastern Housing, Mirpur-12, Dhaka-1213, Bangladesh') }}
            </p>
            <a href="https://softproit.com/" target="_blank">softproit.com</a>
          </div>
        </div>
      </div>

      <!-- Card 3: Visit Hours -->
      <div class="col-md-6 col-lg-3">
        <div class="info-card card-3">
          <div class="card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"
              />
              <path
                d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"
              />
            </svg>
          </div>
          <h3 class="card-title">{{ helper.t('Visit Hours') }}</h3>
          <div class="card-body">
            <a>{{ helper.t('11:00 AM - 11:00 PM') }}</a>
            <p>{{ helper.t('Saturday - Friday') }}</p>
            <p class="small text-muted mt-2">{{ helper.t('Open 7 days a week') }}</p>
          </div>
        </div>
      </div>

      <!-- Card 4: Payment-able Numbers -->
      <div class="col-md-6 col-lg-3">
        <div class="info-card card-4">
          <div class="card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="black"
              viewBox="0 0 16 16"
            >
              <path
                d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"
              />
              <path
                d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"
              />
            </svg>
          </div>
          <h3 class="card-title">{{ helper.t('Payment-able Numbers') }}</h3>
          <div class="card-body">
            <div class="contact-detail">
              <i class="bi bi-phone-fill" style="color: #e2136e"></i>
              <div><strong>{{ helper.t('BKash:') }}</strong> 01951259460</div>
            </div>
            <div class="contact-detail">
              <i class="bi bi-phone-fill" style="color: #e2136e"></i>
              <div><strong>{{ helper.t('Nagad:') }}</strong> 01951259460</div>
            </div>

            <Btn @click.stop="CopyCode()">Code Number: 
              <strong style="color: #32ff00;">{{ CONFIG?.env?.CODE_NUMBER  }}</strong>
            </Btn>

          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>
        © {{ new Date().getFullYear() }} Calling Bird. All rights reserved.
      </p>
      <button class="restart-btn" @click="restartServer" :disabled="restarting">
        <i class='bx bx-refresh' :class="{ 'bx-spin': restarting }"></i>
      </button>
    </div>
  </div>

  <iframe 
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.871814090255!2d90.3519066!3d23.8227541!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c1dfeb618507:0x7d23bc082ebe9348!2sSOFT%20PRO%20IT!5e0!3m2!1sen!2sbd!4v1700000000000"
    width="100%"
    height="450"
    style="border:0;border-radius: 12px;"
    loading="lazy"
  >
  </iframe>
</template>

<style lang="css" scoped>
:root {
  --primary-color: #4a6fa5;
  --secondary-color: #6c757d;
  --accent-color: #17a2b8;
  --light-bg: #f8f9fa;
}

body {
  background-color: #f5f7fa;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  max-width: 1200px;
  margin-top: 30px;
  margin-bottom: 40px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
}

.ip-badge {
  display: inline-block;
  background: #f0f4ff;
  border: 1px solid #c7d4f0;
  border-radius: 6px;
  padding: 4px 14px;
  font-size: 0.85rem;
  color: #4a6fa5;
  margin-bottom: 12px;
}
.header h1 {
  color: var(--primary-color);
  font-weight: 600;
}

.header p {
  color: var(--secondary-color);
  max-width: 700px;
  margin: 0 auto;
}

.info-card {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  height: 100%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.card-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 32px;
}

.card-1 .card-icon {
  background-color: rgba(74, 111, 165, 0.1);
  color: var(--primary-color);
}

.card-2 .card-icon {
  background-color: rgba(108, 117, 125, 0.1);
  color: var(--secondary-color);
}

.card-3 .card-icon {
  background-color: rgba(23, 162, 184, 0.1);
  color: var(--accent-color);
}

.card-4 .card-icon {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.card-title {
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
  font-size: 1.25rem;
}

.card-body {
  color: #555;
  line-height: 1.6;
}

.contact-detail {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
}

.contact-detail i {
  margin-right: 10px;
  color: var(--primary-color);
  margin-top: 3px;
}

.footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
  color: var(--secondary-color);
  font-size: 0.9rem;
}

.restart-btn {
  margin-top: 10px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  transition: color 0.2s, border-color 0.2s;
  background: linear-gradient(135deg, rgb(42, 165, 151) 0%, rgb(37, 211, 102) 50%, rgb(18, 140, 126) 100%);
}
.restart-btn:hover { color: #333; border-color: #999; }
.restart-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .info-card {
    margin-bottom: 20px;
  }
}





/* Students Non-Copied Stat Card */
.students-stat-card {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 16px;
  padding: 24px 32px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(15, 52, 96, 0.35);
  border: 1px solid rgba(255,255,255,0.07);
}

.students-stat-card__glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(99, 179, 237, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.students-stat-card__body {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.students-stat-card__icon {
  width: 68px;
  height: 68px;
  border-radius: 16px;
  background: rgba(99, 179, 237, 0.15);
  border: 1px solid rgba(99, 179, 237, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
  font-family: 'SolaimanLipi', 'Kalpurush', sans-serif;
  color: #63b3ed;
  flex-shrink: 0;
}

.students-stat-card__info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.students-stat-card__label {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.55);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
  margin-bottom: 4px;
}

.students-stat-card__count {
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  letter-spacing: -1px;
}
.students-stat-card__count_sub {
  font-size: 1.5rem;
}

.students-stat-card__notice {
  margin-top: 16px;
  margin-bottom: 0;
  padding: 10px 14px;
  background: rgba(99, 179, 237, 0.08);
  border-left: 3px solid rgba(99, 179, 237, 0.5);
  border-radius: 0 8px 8px 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.88rem;
  line-height: 1.7;
  position: relative;
  z-index: 1;
}
.students-stat-card__notice .bx {
  color: #63b3ed;
  margin-right: 6px;
  font-size: 1rem;
  vertical-align: middle;
}

.students-stat-card__badge {
  flex-shrink: 0;
  background: rgba(99, 179, 237, 0.12);
  border: 1px solid rgba(99, 179, 237, 0.3);
  color: #63b3ed;
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 576px) {
  .students-stat-card { padding: 20px; }
  .students-stat-card__body { flex-wrap: wrap; gap: 16px; }
  .students-stat-card__count { font-size: 2.4rem; }
  .students-stat-card__badge { margin-left: 0; }
}

/* WhatsApp Card Styles */
.whatsapp-card {
    width: 100%;
    height: 120px;
    background: linear-gradient(135deg, #2aa597 0%, #25D366 50%, #128C7E 100%);
    border-radius: 12px;
    padding: 0 30px;
    display: flex;
    align-items: center;
    box-shadow: 0 8px 20px rgba(37, 211, 102, 0.2);
    margin-bottom: 30px;
    position: relative;
    overflow: hidden;
}

.whatsapp-card::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1%, transparent 1%);
    background-size: 20px 20px;
    opacity: 0.3;
    z-index: 1;
}

.whatsapp-content {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;
    z-index: 2;
}

.whatsapp-icon {
    width: 80px;
    flex-shrink: 0;
    color: white;
    margin-right: 30px;
}

.whatsapp-text {
    flex: 1;
    color: white;
    padding-right: 20px;
}

.whatsapp-text h4 {
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 1.4rem;
}

.whatsapp-text p {
    opacity: 0.9;
    font-size: 1rem;
    max-width: 600px;
}

.whatsapp-button {
    flex-shrink: 0;
}

.whatsapp-button .btn {
    background-color: white;
    color: #128C7E;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    padding: 12px 25px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.whatsapp-button .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
    background-color: #f8f9fa;
    color: #0d6e5e;
}

.whatsapp-button .btn:active {
    transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 992px) {
    .whatsapp-card {
        height: auto;
        padding: 25px;
    }
    
    .whatsapp-content {
        flex-wrap: wrap;
    }
    
    .whatsapp-icon {
        width: 60px;
        margin-right: 20px;
    }
    
    .whatsapp-text {
        order: 3;
        width: 100%;
        margin-top: 20px;
        text-align: center;
        padding-right: 0;
    }
    
    .whatsapp-button {
        order: 2;
        margin-left: auto;
    }
}

@media (max-width: 768px) {
    .whatsapp-card {
        padding: 20px;
    }
    
    .whatsapp-icon {
        width: 50px;
        margin-right: 15px;
    }
    
    .whatsapp-text h4 {
        font-size: 1.2rem;
    }
    
    .whatsapp-text p {
        font-size: 0.9rem;
    }
    
    .whatsapp-button .btn {
        padding: 10px 20px;
        font-size: 0.95rem;
    }
}

@media (max-width: 576px) {
    .whatsapp-content {
        flex-direction: column;
        text-align: center;
    }
    
    .whatsapp-icon {
        margin-right: 0;
        margin-bottom: 15px;
    }
    
    .whatsapp-button {
        margin-left: 0;
        margin-top: 15px;
        width: 100%;
    }
    
    .whatsapp-button .btn {
        width: 100%;
    }
}
</style>
