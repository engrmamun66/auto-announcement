## Project Setup
```sh
npm install
yarn install
```

## Compile Build Commands

```sh
npm run build
yarn run build
```

## Run to cdn

```sh
yarn run doc
```


## Repo Link in npmjs.com

```sh
https://www.npmjs.com/package/em-datetimepicker
```


<!-- https://codepen.io/ryomario/pen/PoVJVqP -->

## If you load script in defer mode  or after ready the DOM, follow the instruction

```
Example: 1
==========
document.addEventListener( 'empicker_is_ready', yourCallback )

Example: 2
==========
window.addEventListener('message', ({data}) => {
    if(data.action === 'emDateTimePicker_loaded'){
      # your code here >>> example: inputElement.emDateTimePicker({...})
    }
});
```
