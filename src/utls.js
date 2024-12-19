const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')


function reqUrl(req){
    try {
        return req.protocol + '://' + req.get('host');
    } catch (error) {
        return 'error-url'
    }
}
function reqFullUrl(req){
    try {
        return req.protocol + '://' + req.get('host') + req.originalUrl;
    } catch (error) {
        return 'error-url'
    }
}

function setMetaData(html, {
    route={},
    storeName='',
    favIcon='/favicon.png',
    title='',
    og_title= '', // if empty, title will be set
    og_site_name='', // if empty, title will be set
    og_url='https://rentmy.co',
    description='',
    keywords='',
    author='RentMy',
    imageUrl='',
    image_description='',
    req_full_url='',
  }={}){
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const headElement = document.querySelector('head');
  
    if(headElement){
      setFavicon(headElement, favIcon)
      setTitle(document, headElement, [storeName, title || route.title].join(' :: '))      
      insertMeta(document, headElement, { property: 'og:title', content: og_title || title})  
      insertMeta(document, headElement, { property: 'og:site_name', content: og_site_name || title})  
      insertMeta(document, headElement, { property: 'og:url', content: og_url})  
      insertMeta(document, headElement, { property: 'description', content: description})  
      insertMeta(document, headElement, { property: 'og:description', content: description})  
      insertMeta(document, headElement, { property: 'og:keywords', content: keywords})  
      insertMeta(document, headElement, { property: 'og:author', content: author})
  
      insertMeta(document, headElement, { property: 'og:image', content: imageUrl})
      insertMeta(document, headElement, { property: 'og:image:alt', content: image_description})
  
      // Fixe meta items
      insertMeta(document, headElement, { property: 'og:type', content: 'website'})  
      insertMeta(document, headElement, { property: 'og:robots', content: 'index, follow'})  
      insertMeta(document, headElement, { property: 'og:type', content: req_full_url}) 


      /**
       * ==== Why is Structured Data Important? ====
       * 1) Improves SEO (Search Engine Optimization)
       *    a) Search engines like Google use structured data to better understand the content on a page
       *    b) This helps your page appear in Rich Results or Rich Snippets, which are enhanced search results with additional visual or contextual information
       * 2) Enables Rich Snippets
       *    a) Rich snippets include things like page ratings, authorship, images, breadcrumbs, FAQs, or events directly in search results.
       *    ::Example
       *           i. A product page could show star ratings, price, and availability.
       *           ii. An article could display the author, publish date, and featured image.   
       * 3) Machine Readable Data:
       *    a) The script uses application/ld+json, a JSON-LD format recommended by Google for embedding structured data.
       *    b) Machines (like search engine crawlers) can easily read this format.
       */
      let structurdSeoData = `
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "${title}",
            "description": "${description}",
            "url": "${req_full_url}",
            "image": {
                "@type": "ImageObject",
                "url": "${imageUrl}",
                "width": 1200,
                "height": 630
            },
            "author": {
                "@type": "Company",
                "name": "RentMy"
            }
        }
        </script>
      `
      // Ensure compatibility with older browsers
      structurdSeoData += `
        <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
      `

      headElement.insertAdjacentHTML("beforeend", structurdSeoData);
    }
  
    const fullHTML = dom.serialize();
  
    return fullHTML;
  
  }


function setCdnUrls(html, env){
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const headElement = document.querySelector('head');

  if(headElement){
    const cssElement = headElement.querySelector('link[CDN_CSS]');
    if(cssElement, env?.CSS_URL) cssElement.href = env?.CSS_URL;

    const scriptElement = headElement.querySelector('script[CDN_SCRIPT]');
    if(scriptElement, env?.SCRIPT_URL) cssElement.src = env?.SCRIPT_URL;
  }  
  const fullHTML = dom.serialize();  
  return fullHTML;  
}


function setFavicon(headElement, icon) {
  let favIconEl
  favIconEl = headElement.querySelector('[rel="shortcut icon"]')
  if(favIconEl) favIconEl.remove();

  favIconEl = headElement.querySelector('[rel="icon"]')
  if(favIconEl) favIconEl.remove();

  headElement.insertAdjacentHTML("afterbegin", `<link rel="icon" href="${icon}" type="image/x-icon">`);

}

function setTitle(document, headElement, title) {
  let titleTag = headElement.querySelector("title");
  if (titleTag) titleTag.textContent = title || 'RentMy Service';
  else {
    let titleTag = document.createElement("title");
    titleTag.textContent = title || 'RentMy Service';
    headElement.insertAdjacentElement("afterbegin", titleTag);
  }
}

function insertMeta(document, headElement, { property = "og:title", content = "" }) {
  let metaTag = headElement.querySelector(`meta[property="${property}"]`);
  if (metaTag) {
    metaTag.setAttribute("property", property);
    metaTag.setAttribute("content", content || "");
  } else {
    let metaTag = document.createElement("meta");
    metaTag.setAttribute("property", property);
    metaTag.setAttribute("content", content || "");
    headElement.appendChild(metaTag);
  }
}

module.exports = {
    reqUrl,
    reqFullUrl,
    setMetaData,
    setCdnUrls,
};
