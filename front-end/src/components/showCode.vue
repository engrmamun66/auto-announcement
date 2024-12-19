<template>
  <div class="code-view-wrapper">
    <span class="copycode" tooltipp="copy" flow="left" @click="copyToClipBoard">
      <i class="bx bxs-copy"></i>
    </span>
    <span class="copied" v-if="copied">Copied</span>
<pre ref="pretag" class="line-numbers" :contenteditable="contenteditable" :class="{'in-tabs': inTabs}">
<code :class="`language-${lang}`" ref="codeBlock">{{ trimmedCode }}</code>
</pre>
  </div>
</template>

<script>
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // Add your desired Prism theme
import "prismjs/plugins/line-numbers/prism-line-numbers.css"; // For line numbers

// Dynamically load the language based on the prop
const loadLanguage = async (lang) => {
  try {
    // await import(`prismjs/components/prism-${lang}`);
    await import(`prismjs/components/index.js`);
  } catch (e) {
    console.warn(`Language '${lang}' not found in Prism.js.`);
  }
};

export default {
  name: "ShowCode",
  props: {
    lang: {
      type: String,
      required: true,
      default: "javascript", // Fallback language
    },
    code: {
      type: String,
      required: true,
    },
    inTabs: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  data() {
    return {
      copied: false,
      contenteditable: false,
    };
  },
  computed: {
    trimmedCode() {
      return this.code
        .split("\n") // Split code into lines
        .map((line) => line.trimEnd()) // Trim trailing spaces
        .join("\n") // Join back into a single string
        .trim(); // Remove overall leading/trailing newlines
    },
  },
  watch: {
    code() {
      this.highlightCode();
    },
    lang() {
      this.loadAndHighlight();
    },
  },
  mounted() {
    this.loadAndHighlight();
  },
  methods: {
    async loadAndHighlight() {
      await loadLanguage(this.lang);
      this.highlightCode();
    },
    highlightCode() {
      if (this.$refs.codeBlock) {
        Prism.highlightElement(this.$refs.codeBlock);
      }
    },
    copyToClipBoard() {
      this.contenteditable = true;
      const preElement = this.$refs.pretag;
      if (preElement) {
        const range = document.createRange();
        const selection = window.getSelection();

        range.selectNodeContents(preElement);
        selection.removeAllRanges();
        selection.addRange(range);

        try {
          const successful = document.execCommand("copy");
          if (successful) {
            this.copied = true;
            setTimeout(() => {
              this.copied = false;
            }, 1000);
          }
        } catch (err) {
          console.error("Error copying content: ", err);
        }

        selection.removeAllRanges();
        this.contenteditable = false;
      }
    },
  },
};
</script>

<style>
/* Your CSS remains mostly unchanged */
.code-view-wrapper {
  position: relative;
}

.code-view-wrapper pre {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background-color: #292d3e;
  background-color: #3a3f48;
  overflow: auto;
  font-size: 0.9rem;
  padding-right: 40px;
}
.code-view-wrapper pre.in-tabs {
  margin-top: 10px;
}

.code-view-wrapper pre:focus-visible {
  outline: none;
}

.code-view-wrapper pre[class*="language-"].line-numbers {
  position: relative;
  padding-left: 1.8em;
  counter-reset: linenumber;
  line-height: 25px;
}

code[class*="language-"], pre[class*="language-"] {
    line-height: 2; 
}

.copycode {
  position: absolute;
  right: 10px;
  top: 13px;
  z-index: 9;
  cursor: pointer;
  padding: 2px 5px 0px 5px;
  border-radius: 3px;
  color: rgb(203, 203, 203);
}

.copycode:hover,
.copycode:has(~ .copied) {
  background-color: #2e323a;
}

.copycode:hover > i,
.copycode:has(~ .copied) > i {
  color: white;
}

.copycode ~ .copied {
  position: absolute;
  right: 32px;
  top: 13px;
  z-index: 9;
  cursor: pointer;
  background-color: #2e323a;
  padding: 0px 4px;
  color: #ffffff;
  font-size: 12px;
  text-align: center;
  padding: 4px 8px;
  border-radius: 3px;
  animation: copied-slideright 0.2s ease-in-out;
}

@keyframes copied-slideright {
  0% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(0px);
  }
}
</style>
