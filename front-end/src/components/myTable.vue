<script setup>
 

</script>

<template>
<div class="table-container">
  <table class="table">  
   
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
table {
  width: 100%; 
  width: min(900px, 100%-3rem);
  margin-inline: auto; 
  border-collapse: collapse;
  border-spacing: 2rem;
  border-radius: 20px;
  margin: 20px 0px;

  th,
  caption {
    padding: 10px;
  }
  td{
    padding: 8px 16px;
  }

  th {
    &:nth-child(1) {
      background: #a7d4df80;
      border-radius: 20px 0 0 0;
      border-right: 4px solid #fff;
    }
    &:nth-child(odd) {
      background: #e5f4fbc3;
      border-radius: 0 0 0 0;
      border-right: 4px solid #5dceff;
    }
    &:nth-child(even) {
      background: #f3f4dfb0;
      border-radius: 0 0 0 0;
      border-right: 4px solid #5dceff;
    }
    
    &:first-child {
      border-radius: 10px 0 0 0;
    }
    &:last-child {
      border-right: none;
      border-radius: 0 10px 0 0;
    }
  }
  td {
    border-bottom: 1px dashed var(--borderColor);
    font-weight: 400;
    font-size: 16px;
    color: #181818;
    background: rgba(245, 222, 179, 0.171);
  }
  tr:last-child {
    td {
      border-bottom: 1px solid var(--borderColor);
    }
  }
  col:nth-child(2) {
    background: #f4feff86;
  }
  & tbody tr td:first-child{
    /* border-left: 1px solid var(--borderColor); */
  }
  & tbody tr td:last-child{
    /* border-right: 1px solid var(--borderColor); */
  }
}
caption,
th,
td {
  text-align: center;
}
 
@media (max-width: 650px) {
  td {
    display: grid;
    gap: 2.5rem;
    grid-template-columns: 1fr 1fr;
    padding: 2rem 2rem;
  }
  td:first-child{
    padding-top:2rem;
  }
    td:last-child{
    padding-top:2rem;
  }
  th {
    display: none;
  }
  td::before {
    content: attr(data-cell);
    font-weight: bold;
    font-size: 16px;
    text-transform: capitalize;
    padding: 0.5rem 1rem;
  }

  td:nth-of-type(1)::before {
    background: #e3f4df;
  }
  td:nth-of-type(2)::before {
    background: #e5f4fb;
  }
  td:nth-of-type(3)::before {
    content: attr(data-cell);
    background: #fffaee;
  }
}

</style>