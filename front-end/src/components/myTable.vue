<script setup>
 
defineProps({
  topMarginClass: {
    default: 'mt-4',
    required: false
  }
})

</script>

<template>
<div class="table-container" v-bind="$attrs">
  <table class="table table-striped-" :class="[ topMarginClass ]">  
   
    <slot name="thead">
      <thead>
        <tr>
          <th>berfore..</th>
          <th>What?</th>
          <th>After..</th>
          <th>After..</th>
        </tr>
      </thead>
    </slot>
    <tbody>
      <slot name="rows">
        <!-- <tr>
          <td>1 </td>
          <td>Reviews </td>
          <td>efe </td>
          <td>222</td>
        </tr>   -->
      </slot>
       
    </tbody>
  </table>
</div>
</template>

 