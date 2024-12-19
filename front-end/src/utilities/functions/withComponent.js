export function createComponentHTML(
  DomElement,
  options,
  uniqueKeyForParentEl = ""
) {
  // options = [
  //     {
  //   ***   selector: 'p', // pass '__SELF__' (use in child[], see example in File: src/pages/OrderComplete.vue:173)
  //   ***   template: true,
  //   ***   attr: {
  //             'v-if': 'person.idd == 0'
  //             '@click': 'myFunction',
  //             ':class': '{active: condition}', // Note: To dynamic 'active' class, pass like this from DOM :: <li activeClass="myActiveClass"> Any Text </li>
  //         },
  //         callback: (el) => { ...check/do-something },
  //   ***   text: "any text or html or html contain '__EXISTING_HTML__'",   ------- Example: src\modules\user\views\Profile.vue:216
  //         removeSiblings: false, //optional
  //         classToRemove: '', //optional
  //         skipIcon: false, //optional
  //         removeAttr: ['placeholder'] //optional
  //         target: { prev_tag, next_tag, parent_tag, child_tag }, // when we want to select a TEXT_NODE
  //         child: [] ------- child is the same type of options(calling recusively), example in file: src\modules\checkout\views\GenerateCompoenentHtml.js:883
  //         console: true //optional ---- to console current selctor and element. Pass [console] attr from DOM to overwirte this
  //     },
  // ]

  /**
   * Expainnation of 'options' arrtibute from DOM element
   * Example: <div options="key=value space\skey=space\svalue" > ... </div>
   * Note: in key or value, instead of space use back-slash (e.g. any\skey=any\svalue)
   */

  /**
   * Expainnation of [activeClass] arrtibute from DOM element to dynamic
   * Example: <div activeClass="myClassName" > ... </div>
   * Note: It will be apply as active class/classlist
   *      a) if using default binding with 'active'
   *          :class="{active: AnyCondition}"
   * 
   *      b) Pass >>> activeClass="myActiveClass" attribute from DOM 
   *         then it by be appply like this 
   *          :class="{myActiveClass: AnyCondition}"
   */

  /**
   * Expainnation of
   * ====== Super Powerfull ***

   * Note:
   *      1) Using guied of 'att.' prefixed attributes from DOM element
   *
   *      Use Example (attr.):
   *          INPUT: <button   * 
   *                    attr.one="one" 
   *                    attr.:class="{ 'active' : !condition == test }" 
   *                    attr.@click="(e)=>{ e.preventDefault() }"      *
   *                    attr.@submit.prevent="(e)=>{ e.preventDefault() }"      *
   *                    > Hello Mamun </button>
   *
   *          OUTPUT EFFECT: It will be apply like this
   *                    option.attr = { ...option.attr, ...newAttrs }
   *
   *
   *      2) Using guied of [text] attr from DOM element:
   *
   *          INPUT: <h1 text="Hello world" > Hello Mamun </h1>
   *          INPUT: <h1 text="&quot;option&quot; Content here" > Hello Mamun </h1>
   * 
   *          Note:: To endoe HTML online: https://emn178.github.io/online-tools/html_encode.html
   * 
   *          OUTPUT EFFECT: It will be replace option.text
   * 
   *      2) Using guied of [text-var] attr from DOM element:
   *          Note: Encoded HTML is more complex to understand with human eyes.
   *                So we cat set our HTML from global variable
   *
   *          Examples: of ["text-var"] attribute   
   * 
   *                text_variable_attr = 'buttonHtml; 
   *                text_variable_attr = 'cartPage.buttonHtml;
   *                text_variable_attr = 'window.cartPage.buttonHtml;
   *                text_variable_attr = 'window.cartPage.buttonHtml;
   *                              

   */ 
   

  /**
   * Expainnation of 'uniqueKeyForParentEl'
   * >>> When we want to use option.selector == '__SELF__' in zero (0) index of options[]
   * and with (v-if and v-else-if and v-else) or (v-if and v-else)
   * template = true | false
   * Then we will assing parent template like this >>> window.parents[uniqueKeyForParentEl] = DomElement.parentElement;
   * note: we can pass DomElement id or any string key in this parameter
   * -----------------------------------------------------------------------------
   * Then we get Exact HTML with >>> window.parents[uniqueKeyForParentEl].innerHTML
   * v-html :: to set v-html attribut pass in text: <div v-html="product.description"></div>
   */

  if (!DomElement) return;
  let element = DomElement;
  try {
    let templates = [];
    let elements = [];
    options?.forEach((option, index) => {
      if (!option.attr) option.attr = {};
      try {
        let el = element;
        if (option?.selector !== "__SELF__") {
          if (option?.selector) {
            // v-else-if and v-else, selector always will be single selector
            if ("v-else-if" in option.attr || "v-else" in option.attr) {
              let parts = option.selector?.split(" ");
              option.selector = parts[parts.length - 1];
            }

            el =
              element?.querySelector(option?.selector) ||
              element?.content?.querySelector(option?.selector);

            // Finding from all templates
            templates.forEach((template) => {
              let _el = template.content.querySelectorAll(option.selector);
              if (_el?.length) {
                if (_el) el = _el[_el.length - 1];
              }
            });
          }
        }

        if (
          index == 0 &&
          option.selector === "__SELF__" &&
          uniqueKeyForParentEl
        ) {
          if (!window.parents) window.parents = {};
          window.parents[uniqueKeyForParentEl] = el.parentElement;
        }

        if (el) {
          if (el.hasAttribute("console")) {
            if (el.getAttribute("console") == "true") {
              option.console = true;
            } else {
              option.console = false;
            }
          }
        }

        

        if (el) {           

            /* ---------------------------------------- */
            /*         attr. prefixed attribute         */
            /* ---------------------------------------- */            
            let all_attrdot_prefix_attrs = parsePrefixedAttributes(el);
            if (all_attrdot_prefix_attrs) {
                option.attr = { ...option.attr, ...all_attrdot_prefix_attrs };         
            }

            /* ---------------------------------------- */
            /*             [text] attribute             */
            /* ---------------------------------------- */            
            let text_attr = el.getAttribute("text");
            if (text_attr) {
                option.text = text_attr;
                el.removeAttribute("text");
            }

            /* --------------------------------------------------- */
            /*             ["text-var"] attribute             */
            /* --------------------------------------------------- */  
            let text_variable_attr = el.getAttribute("text-var");        
            try {
              if(text_variable_attr) {
                  let remote_var_data = null;
                  let variable_parts = text_variable_attr.split('.')
                  variable_parts = variable_parts.filter(part => !['window', 'globalThis'].includes(part));
                  variable_parts.forEach(var_key => {
                      remote_var_data = remote_var_data?.[var_key] || globalThis?.[var_key] || null;
                  })
                  if(remote_var_data){
                    option.text = remote_var_data;
                  } 
                  el.removeAttribute("text-var");
              }
            } catch (error) {
              console.error('[text-var] error', error);
            } 
             
        }


        if (option.console === true) {
            console.group(`selector >>> ${option.selector}`);
            window.globalElement = el;
            window.templates = templates;
            let data = {
                "el" : el,
                "type in cosole" : 'window.dev',
                "templates" : templates,
                "selector" : option.selector,
                "1: prev_options" : options.slice(0, index),
                "2: current_options ***" : option,
                "3: next_options" : options.slice(index, options?.length - 1),
                "4: __all_options__" : options,
            }   
            window.dev = data;
            console.log(data);         
            console.groupEnd();
        }


        if (el && Object.keys(option.attr || {})?.length) {
          /* -------------------------------------------------------------------------- */
          /*                            When template = true                            */
          /* -------------------------------------------------------------------------- */
          if (option.template) {
            if (option.removeSiblings) {
              while (el.nextSibling) {
                el.nextSibling.remove();
              }
            }
            let template;
            let clonedEl;

            template = document.createElement("template");
            if ("v-else-if" in option.attr || "v-else" in option.attr) {
              let last_template = templates[templates.length - 1];
              clonedEl = el.cloneNode(true);
              clearVueAttributes(clonedEl);
              clearAttributes(clonedEl, option?.removeAttr);
              template.content.appendChild(clonedEl);
              last_template.insertAdjacentElement("afterend", template);
            } else {
              let clonedEl = el.cloneNode(true);
              clearAttributes(clonedEl, option?.removeAttr);
              template.content.appendChild(el.cloneNode(true));
              el.insertAdjacentElement("beforebegin", template);
              el.remove();
            }
            templates.push(template);
            el = template;

            Object.entries(option.attr).forEach((entry) => {
              let [key, value] = entry;
              key = key.replace(/^@/, "v-on:");
              autoClearAttributes(el, key);
              value = key == "v-else" ? "" : value;
              el.setAttribute(key, value || "");
            });

            if (option.classToRemove) {
              el.classList.remove(option.classToRemove);
            }
          } else {
          /* -------------------------------------------------------------------------- */
          /*                            When template = false                           */
          /* -------------------------------------------------------------------------- */
            if ("v-else-if" in option.attr || "v-else" in option.attr) {
              let lastElement = elements[elements?.length - 1];
              let clonedElement = lastElement?.cloneNode(true);
              clearVueAttributes(clonedElement);
              el = clonedElement;
              lastElement.insertAdjacentElement("afterend", el);
            }
            if ("v-if" in option.attr || "v-else-if" in option.attr) {
              elements.push(el);
            }

            el.removeAttribute("options");

            if (option?.callback) {
              let callback = option.callback;
              delete option.attr.callback;
              callback({ el, optionsAttr });
            }

            clearAttributes(el, option?.removeAttr);

            if (option.classToRemove) {
              el.classList.remove(option.classToRemove);
            }

            Object.entries(option.attr).forEach((entry) => {
              let [key, value] = entry;
              key = key.replace(/^@/, "v-on:");
              autoClearAttributes(el, key);
              value = key == "v-else" ? "" : value;

              /* ------------------------------------------------------------------ */
              /*                        Dynamic active class                        */
              /* ------------------------------------------------------------------ */
              if (
                key === ":class" &&
                value.startsWith("{") &&
                el.getAttribute("activeClass")
              ) {
                try {
                  const regex = /([\w-_\s]+)/g;
                  let activeClass = regex.exec(value)?.[0];
                  if (activeClass) {
                    value = value.replace(
                      activeClass,
                      el.getAttribute("activeClass")
                    );
                    el.removeAttribute("activeClass");
                  }
                } catch (error) {
                  console.warn("Dynamic-Active-Class", error);
                }
                el.setAttribute(key, value || "");
              } else {
                el.setAttribute(key, value || "");
              }
            });

            if (option.removeSiblings) {
              while (el.nextSibling) {
                el.nextSibling.remove();
              }
            }
          }
        }

        /* -------------------------------------------------------------------------- */
        /*                              Setting InnerHTML                             */
        /* -------------------------------------------------------------------------- */
        if (el && option.text) {
          if (el.content) el = el.content.firstChild;
          // Avoid assiging any text or html when found ByElementor attribute
          if (!el.hasAttribute("ByElementor")) {
            if (option.target) {
              let textNode = getExactTextNode(el, option.target);
              if (textNode) {
                textNode.textContent = option.text;
              }
            } else {
              let innerHTML = null;
              innerHTML = el.innerHTML;
              innerHTML = el.innerHTML?.replace(/\s{2,}/g, "");

              let pre_icon_html = "";
              let post_icon_html = "";
              if (option?.skipIcon !== true && el.querySelector("i")) {
                let hasIconInLeft = /i>.*[a-z]+/i.test(innerHTML);
                let hasIconInRight = /[a-z]+\s?<i/i.test(innerHTML);
                if (hasIconInLeft)
                  pre_icon_html = el.querySelector("i").outerHTML;
                if (hasIconInRight)
                  post_icon_html = el.querySelector("i").outerHTML;
              }

              /**
                             special-text:: __EXISTING_HTML__                             
                            */
              if (
                option.text &&
                option.text.indexOf("__EXISTING_HTML__") > -1
              ) {
                option.text = option.text.replace(
                  "__EXISTING_HTML__",
                  innerHTML
                );
              }

              el.innerHTML = `${pre_icon_html} ${option.text} ${post_icon_html}`;
            }
          }
        }

        if (el && option.child) {
          createComponentHTML(el?.content?.firstChild || el, option.child);
        }
      } catch (error) {
        console.warn(error);
      }
    });
  } catch (error) {
    console.warn(error);
  }
}

function clearVueAttributes(domElement, clearAlsoFromChilds = true) {
  const clearVueAttrs = function (domElement) {
    if (domElement && domElement.attributes) {
      for (let i = domElement.attributes.length - 1; i >= 0; i--) {
        let attributeName = domElement.attributes[i].name;
        var htmlAttributes = [
          "class",
          "id",
          "title",
          "disabled",
          "hidden",
          "contenteditable",
          "name",
          "value",
          "placeholder",
          "type",
          "href",
          "src",
          "alt",
          "style",
          "target",
          "rel",
          "width",
          "height",
          "maxlength",
          "min",
          "max",
          "step",
          "for",
          "tabindex",
          "readonly",
          "required",
          "autofocus",
          "aria-label",
          "role",
          "aria-hidden",
          "aria-disabled",
          "aria-selected",
          "aria-checked",
          "aria-describedby",
          "aria-labelledby",
          "aria-controls",
          // Add more attributes here as needed
        ];
        if (!htmlAttributes.includes(attributeName)) {
          domElement.removeAttribute(attributeName);
        }
      }
    }
  };
  clearVueAttrs(domElement);
  if (clearAlsoFromChilds) {
    domElement.querySelectorAll("*")?.forEach(function (el) {
      clearVueAttrs(el);
    });
  }
}

function clearAttributes(domElement, attr_array = []) {
  if (domElement && attr_array) {
    attr_array?.forEach((attr) => domElement.removeAttribute(attr));
  }
}

function autoClearAttributes(el, key) {
  if (key.startsWith(":") || key.startsWith("v-bind:")) {
    if (key != "v-bind") {
      let _key = key.split(":")[1];
      if (!["class", "style"].includes(_key)) {
        // Example: if pass :src, then remove src attribute first
        el.removeAttribute(key.split(":")[1]);
      }
    }
  }
}

function getAllTextNodes(element) {
  const textNodes = [];
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (const childNode of node.childNodes) {
        traverse(childNode);
      }
    }
  }
  traverse(element || document.body);
  return textNodes;
}

function getExactTextNode(element, target = {} /** option.target */) {
  try {
    Object.keys(target).forEach(
      (key) => (target[key] = target[key].toLocaleUpperCase())
    );
    let textNode = getAllTextNodes(element)?.filter((el) => {
      let prev_tag = el.previousSibling?.tagName ?? null;
      let next_tag = el.nextSibling?.tagName ?? null;

      let parent_tag = el.parentElement?.tagName ?? null;
      let child_tag = el.firstChild?.tagName ?? null;

      if (target.prev_tag && target.next_tag) {
        return target.prev_tag == prev_tag && target.next_tag == next_tag;
      } else if (target.parent_tag && target.child_tag) {
        return target.parent_tag == parent_tag && target.child_tag == child_tag;
      } else if (target.prev_tag) {
        return target.prev_tag == prev_tag;
      } else if (target.next_tag) {
        return target.next_tag == next_tag;
      } else if (target.parent_tag) {
        return target.parent_tag == parent_tag;
      } else if (target.child_tag) {
        return target.child_tag == child_tag;
      }

      return false;
    });
    return textNode?.[0] ?? null;
  } catch (error) {
    console.warn(error);
  }
}

function parsePrefixedAttributes(el, attrPrefix = 'attr.') {
    const attributes = el.attributes;
    const attrNames = [];
    const attrObject = {};
    let isFound = false;
    for (let attr of attributes) {
        if (attr.name.startsWith(attrPrefix)){
            attrNames.push(attr.name)      
            let attr_name = attr.name.replace(attrPrefix, '');
            attrObject[attr_name] = attr.value;
            isFound = true;
        }
    }
    if(isFound){
        attrNames.forEach(attr => el.removeAttribute(attr))
        return attrObject;
    } else {
        return false;
    }
}
