<script setup>
import { onMounted, watch, inject, ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import Btn from "../components/Btn.vue";
</script>

<template>
  <!-- Contact Wrap -->
  <div class="container">
    <div class="header">
      <h1>Contact Information</h1>
      <p class="mt-3">
        Find all our contact details, office location, visit hours, and payment
        information below.
      </p>
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
          <h3 class="card-title">Information</h3>
          <div class="card-body">
            <div class="contact-detail">
              <i class="bi bi-telephone-fill"></i>
              <div>Mobile: <strong><a class="text-black" href="tel:+8801617207878">+8801617207878</a></strong></div>
            </div>
            <div class="contact-detail">
              <i class="bi bi-telephone-fill"></i>
              <div>Mobile: <strong><a class="text-black" href="tel:+8801951258460">+8801951258460</a></strong></div>
            </div>
            <div class="contact-detail">
              <i class="bi bi-envelope-fill"></i>
              <div>Email: <strong><a href="mailto:mamun@softproit.com">mamun@softproit.com</a></strong></div>
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
          <h3 class="card-title">Visit Us / Office Location</h3>
          <div class="card-body">
            <p>
              House # 40, Road # 1, Block # C, Eastern Housing, Mirpur-12,
              Dhaka-1213, Bangladesh
            </p>
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
          <h3 class="card-title">Visit Hours</h3>
          <div class="card-body">
            <a>11:00 AM - 11:00 PM</a>
            <p>Saturday - Friday</p>
            <p class="small text-muted mt-2">Open 7 days a week</p>
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
              fill="currentColor"
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
          <h3 class="card-title">Payment-able Numbers</h3>
          <div class="card-body">
            <div class="contact-detail">
              <i class="bi bi-phone-fill" style="color: #e2136e"></i>
              <div><strong>BKash:</strong> 01951259460</div>
            </div>
            <div class="contact-detail">
              <i class="bi bi-phone-fill" style="color: #e2136e"></i>
              <div><strong>Nagad:</strong> 01951259460</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>
        © 2023 SoftPro IT. All rights reserved. | Bootstrap Information Cards
        Example
      </p>
    </div>
  </div>

  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.871814090255!2d90.3519066!3d23.8227541!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c1dfeb618507:0x7d23bc082ebe9348!2sSOFT%20PRO%20IT!5e0!3m2!1sen!2sbd!4v1700000000000"
    width="100%"
    height="350"
    style="border: 0"
    allowfullscreen
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

@media (max-width: 768px) {
  .info-card {
    margin-bottom: 20px;
  }
}
</style>
