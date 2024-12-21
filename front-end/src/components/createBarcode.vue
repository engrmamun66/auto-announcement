<template>
  <div>
    <svg ref="barcode"></svg>
  </div>
</template>

<script>
import JsBarcode from "jsbarcode";

export default {
  props: {
    data: {
        default: '',
      type: [Object, String],
      required: true,
    },
    displayValue: {
      default: true,
      type: [Boolean],
      required: false,
    },
  },
  mounted() {
    this.generateBarcode();
  },
  methods: {
    generateBarcode() {
      const jsonString =
        typeof this.data == "object" ? JSON.stringify(this.data) : this.data; // Convert JSON object to string
      JsBarcode(this.$refs.barcode, jsonString, {
        format: "CODE128", // Barcode format
        displayValue: this.displayValue,
        lineColor: "#000",
        width: 2,
        height: 100,
      });
    },
  },
};
</script>
