<script setup>
import TermsContent from '../components/TermsContent.vue'
</script>

<!-- Hidden route (/terms): not in the nav, linked from the Contact page -->
<template>
  <div class="container terms-page">
    <TermsContent />
  </div>
</template>

<style scoped>
.terms-page {
  max-width: 1200px;
  margin-top: 30px;
  margin-bottom: 40px;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}
@media (max-width: 576px) {
  .terms-page {
    margin-top: 15px;
    padding: 18px;
  }
}
</style>
