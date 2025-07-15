<script setup>
 

</script>

<template>
<div class="table-container">
  <table class="table table-striped- mt-4">  
   
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
  /* background: var(--primaryColor) !important; */
  color: black;
}

thead tr {
  background: var(--grad2)
}
 

tbody tr {
  background: var(--grad2)
}
 


</style>