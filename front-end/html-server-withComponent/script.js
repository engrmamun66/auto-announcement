import {createComponentHTML} from './test.withComponent.js'


let main = document.querySelector('main');


createComponentHTML(main, [
    {
        selector: 'ul',
        child: [
            {
                selector: 'li',
                attr: {
                    'v-if': 'x==1',
                    ':class': `{"active": condition}`,
                },
                child: [
                    {
                        selector: '[Pre]',
                        attr: {d:4},
                        text: '{{ site.name }}'
                    },
                    {
                        selector: '[Label]',
                        attr: {d:4},
                        text: '{{ site.name }}'
                    },
                    {
                        selector: '[POST]',
                        attr: {d:4},
                        text: '{{ site.name }}'
                    },
                ]
            }
        ]        
    }
])

// console.log(main.innerHTML);