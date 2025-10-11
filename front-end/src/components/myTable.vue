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

<style>

/**
border-right: 4px solid #fff;
border-right: 4px solid #5dceff;
border-right: 4px solid #5dceff;
*/

.table-container{
  max-width: 100%;
  overflow-y: auto;
}


td{
  padding: 5px 20px !important;  
}

th{
  padding: 10px 20px !important;
}
 
th { 
  background: rgba(255, 255, 255, 0.301) !important;
  color: black;
}

thead tr {
  /* background: rgba(255, 255, 255, 0.301) !important; */
}   

 
th a, td a {
  color: black;
  text-decoration: none;
}


</style>