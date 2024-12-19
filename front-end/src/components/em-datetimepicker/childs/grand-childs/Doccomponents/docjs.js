function higlight(text){
    return `<span class="higlight44" >${text}</span>`;
}
function space(length){
    return Array.from({length: length * 2}).fill('&nbsp;').join('');
}

export const allCustomRangePattern = [
    'Today',
    'Tomorrow',
    'Yesterday',
    'Last 2 Days',
    'Next 3 Days',
    '2 days',

    'This Week',
    'last week',
    'Next Week',
    'Last 2 Weeks',
    '2 Weeks',

    'This Month',
    'last Month',
    'Next Month',
    'Last 2 Months',
    'Next 2 Months',
    '2 Months', 

    'This Year',
    'Last Year',
    'Next Year',
    'Last 2 Years',
    'Next 2 Years',
    '2 Years',  

    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',

    'All Months',
    'Auto Months',

    ':Custom tile here:2024-07-17:2024-07-17',
]

export let options = [
    {
        name: 'displayIn',
        defaultValue: 'modal', 
        availableValue: {
            type: 'array',
            value: [
                'modal', 

                'top_left', 
                'top_right', 
                'top_center',

                'bottom_left', 
                'bottom_right',     
                'bottom_center', 

                'left_top', 
                'left_bottom', 
                'left_center', 

                'right_top', 
                'right_bottom', 
                'right_center', 
                
                'inline_left', 
                'inline_right', 
                'inline_center',

                'center', 
            ]
        },
        type: 'string',
        description: `Availble 17 display position with auto reposive mode. <br> We suggesting for ${higlight('"bottom_left"')} | ${higlight('"bottom_right"')} | ${higlight('bottom_center')}`,
        isExpand: false,
    },
    {
        name: 'rangePicker',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `It will allow to pick ${higlight('date-range')} and ${higlight('time-range')}`,
        isExpand: false,
    },
    {
        name: 'useCustomRange',
        defaultValue: false, 
        availableValue: {
            type: 'array',
            value: allCustomRangePattern            
        },
        type: 'boolean',
        description: `You can pass ${higlight('true')} or ${higlight('Array')}. This is fully dynamic. You can pass any kind of range pattern as string`,
        isExpand: false,
    },
    {
        name: 'allowDateOnlyFromCustomRange',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `It's will work with ${higlight('options.useCustomRange = true')}. If you pass true. User will be able to pick date form ${higlight('custom-range')}`,
        isExpand: false,
    },
    {
        name: 'rangeSelectionPattern',
        defaultValue: false, 
        availableValue: {
            type: 'array',
            value: [
                'week --(not: select current week)',
                'week + 1 week --(note: {1} is dynamic)',
                'week + 2 day --(note: {1} is dynamic)',
                'from sun to thu --(note: {sun} and {thu} is dynamic)',
                '1st week of month',
                '2nd week of month',
                '3rd week of month',
                '4th week of month',
                '5th week of month',
            ]
        },
        type: 'boolean',
        description: `It's workable only for ${higlight('date-range-picker')}. You can set range selection pattern.`,
        isExpand: false,
    },
    {
        name: 'displayFormat',
        defaultValue: 'DD MMM, YYYY', 
        availableValue: null,
        type: 'string',
        description: `Default format is ${higlight('DD MMM, YYYY')} + ${higlight('hh:mm A')} will be add if use ${higlight('time-picker')}.`,
        isExpand: false,
    },
    {
        name: 'minDate',
        defaultValue: 'null', 
        availableValue: {
            type: 'array',
            value: [
                '2024-12-15',
                'today',
                'today + 1 day|week|month',
                'today - 1 day|week|month',
                'yesterday',
                'tomorrow',
                'next Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday',
            ]
        },
        type: 'string',
        description: `This is fully dynamic. You can pass any kind of pattern as string`,
        isExpand: false,
    },
    {
        name: 'maxDate',
        defaultValue: 'null', 
        availableValue: {
            type: 'array',
            value: [
                '2024-12-15',
                'today',
                'today + 1 day|week|month',
                'today - 1 day|week|month',
                'yesterday',
                'tomorrow',
                'next Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday',
            ]
        },
        type: 'string',
        description: `This is fully dynamic. You can pass any kind of pattern as string`,
        isExpand: false,
    },
    {
        name: 'local',
        defaultValue: {
            lang: 'en',
            adjustWeekday: 0,
        }, 
        defaultValue_forCopy: {
            lang: 'en',
            adjustWeekday: 0,
        }, 
        availableValue: null,
        type: 'Object',
        description: `Just pass an object and modify as you choice.`,
        isExpand: false,
    },
    {
        name: 'sticky',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `If you pass true. Never can close the picker.`,
        isExpand: false,
    },    
    {
        name: 'prevIcon',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `Calendar Prevous Icon`,
        isExpand: false,
    },
    {
        name: 'nextIcon',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `Calendar Next Icon`,
        isExpand: false,
    },
    {
        name: 'autoSetValuFirstTime',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `To update with perfect data on inlitialization`,
        isExpand: false,
    },
    {
        name: 'buttons',
        defaultValue: {
            buttons: {
                todayBtn: 'Today',
                cancelBtn: 'Cancel',
                applyBtn: 'Apply',
            }
        }, 
        defaultValue_forCopy: {
            buttons: {
                todayBtn: 'Today',
                cancelBtn: 'Cancel',
                applyBtn: 'Apply',
            }
        }, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'Object',
        description: `Just pass an object and modify as you choice.`,
        isExpand: false,
    },
    {
        name: 'row',
        defaultValue: 6, 
        availableValue: {
            type: 'array',
            value: [3,4,5,6,7,8,9,10]
        },
        type: 'boolean',
        description: `This is the caledar row qunatity. You can pass minimum value 3 and maximum value 10`,
        isExpand: false,
    },
    {
        name: 'timePicker',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `If you pass true, ${higlight('time-picker')} will be active in ${higlight('date-picker')} (by clicking time button)`,
        isExpand: false,
    },
    {
        name: 'onlyTimePicker',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `To show only time picker. This parameter priority is very high. I mean, if also rangePicker=true that will not work verses of this parameter.`,
        isExpand: false,
    },
    {
        name: 'minuteStep',
        defaultValue: 1, 
        availableValue: {
            type: 'string',
            value: '1 to 30'
        },
        type: 'Number',
        description: `You can pass 1 to 30`,
        isExpand: false,
    },
    {
        name: 'use24Format',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `If you pass true. It will effect just only ${higlight('display-format')}`,
        isExpand: false,
    },
    {
        name: 'timePickerUi',
        defaultValue: 'standard', 
        availableValue: {
            type: 'array',
            value: ['standard', 'classic']
        },
        type: 'string',
        description: ``,
        isExpand: false,
    },
    {
        name: 'timePickerButtons',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `If you pass true, ${higlight('Close')} and ${higlight('OK')} button will be show in ${higlight('time-picker')}`,
        isExpand: false,
    },
    {
        name: 'endTimeAutoValid',
        defaultValue: true, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `By default, we are using this for ${higlight('time-range')} picker, You can not be able to select ${higlight('endTime')} rather than past time of ${higlight('startTime')}. I you want to skip this validation just pass ${higlight('false')}`,
        isExpand: false,
    },
    
    {
        name: 'adjustX',
        defaultValue: 0, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'number',
        description: `You can fix you picker display ${higlight('horizontal')} position by passing ${higlight('positive')} or ${higlight('negative')} number`,
        isExpand: false,
    },
    {
        name: 'adjustY',
        defaultValue: 0, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'number',
        description: `You can fix you picker display ${higlight('vertical')} position by passing ${higlight('positive')} or ${higlight('negative')} number`,
        isExpand: false,
    },
    {
        name: 'theme',
        defaultValue: 'light', 
        availableValue: {
            type: 'array',
            value: ['light', 'dark']
        },
        type: 'boolean',
        description: ``,
        isExpand: false,
    },
    {
        name: 'colors',
        defaultValue: {
            colors: {
                // Just change -----> "primary_bg" to adjust color according any theme color
                primary_bg: '...',
                body_bg: '...',
                bg_grey: '...',
                font_dark: '...',
                font_dark_low: '...',
                font_light: '...',
                date_disable: '...',
            },
        },         
        defaultValue_forCopy: {
            colors: {
                // Just change -----> "primary_bg" to adjust color according any theme color
                primary_bg: '...',
                body_bg: '...',
                bg_grey: '...',
                font_dark: '...',
                font_dark_low: '...',
                font_light: '...',
                date_disable: '...',
            },
        }, 

        availableValue: null,
        type: 'object',
        description: `Just change ${higlight('primary_bg')} to adjust color according to your theme color. Only ${higlight('HEX Color')} is supported (${higlight('Example: #10b105')})`,
        isExpand: false,
    },
    {
        name: 'autoOpen',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `It will open picker on initialization`,
        isExpand: false,
    },
    {
        name: 'invisible',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `If you pass true, picker input element ${higlight('opacity will be 0')}. It's better to use with ${higlight('displayIn = "inline_left | inline_right | inline_center"')} and ${higlight('sticky = true')}`,
        isExpand: false,
    },
    {
        name: 'isDisabled',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: ``,
        isExpand: false,
    },
    {
        name: 'hideSwitcher',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `This will be hide ${higlight('startDate, endDate')} and ${higlight('startTime, endTime')}`,
        isExpand: false,
    },
    {
        name: 'adjustCalendarDayWidth',
        defaultValue: '0px', 
        availableValue: null,
        type: 'string',
        description: `You can increase/decrease calendar day width by this property`,
        isExpand: false,
    },
    {
        name: 'adjustCalendarDayHeight',
        defaultValue: '0px', 
        availableValue: null,
        type: 'string',
        description: `You can increase/decrease calendar day height by this property`,
        isExpand: false,
    },    
    {
        name: 'useRandomSelection',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `It's workable only single date picker. ModelValue will update in dates:[...] key`,
        isExpand: false,
    },    
    {
        name: 'documentation',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `To display documetation button (It's only for developer)`,
        isExpand: false,
    },    
]


export let allProps = [
    {
        name: 'modelValue',
        defaultValue: "{ startDate, endDate, startTime, endTime, dates }", 
        defaultValue_forCopy: {
            startDate: 'new Date()',
            endDate: 'new Date()',
            startTime: '06:00 AM',
            endTime: '05:00 PM',
        },
        availableValue: null,
        type: 'object',
        description: `
            <h6>Keys of modelValue object</h6>
            <hr>              
            <ul>
                <li>
                    <strong>{</strong>  
                </li>
                <li>
                    <strong>startDate:</strong> new Date(),
                </li>
                <li>
                    <strong>endDate:</strong> new Date(),
                </li>
                <li>
                    <strong>startTime:</strong> '08:00 AM',
                </li>
                <li>
                    <strong>endTime:</strong> '05:00 AM',
                </li>
                <li>
                    <strong>dates:</strong> [ ] <small>
                </li>
                <li>
                    <strong>}</strong>
                </li>                
            </ul>
            <ul>
                <li class="mt-3 mb-1">
                    startDate and endDate pass when ${higlight('date-picker')} is using
                </li>
                <li class="mt-3 mb-1">
                    startTime and endTime pass when ${higlight('time-picker')} is using
                </li>
                <li class="mt-3 mb-1">
                    date = [ ] pass, when ${higlight('options.useRandomSelection = true')}
                </li>               
            </ul>
        `,
        isExpand: false,
    },
    {
        name: 'disabled',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `It will allow to pick ${higlight('date-range')} and ${higlight('time-range')}`,
        isExpand: false,
    },
    {
        name: 'showValueIf',
        defaultValue: false, 
        availableValue: {
            type: 'string',
            value: 'true | false'
        },
        type: 'boolean',
        description: `You can handle to display modelVlaue, in input element of picker`,
        isExpand: false,
    },
    {
        name: 'options',
        defaultValue: {}, 
        availableValue: {
            type: 'array',
            value: options.map(item => item.name),
        },
        type: 'object',
        description: `There are many option for this props. See details from below`,
        isExpand: false,
    },
    {
        name: 'availableInDates',
        defaultValue: 'null', 
        availableValue: null,
        type: 'Array | Object',
        description: `
            <h6>If you pass Array</h6>
            <hr>              
             <ul>
                <li>
                    <strong>[</strong>  
                </li>

                <li>
                    <strong>${space(1)}{</strong>       
                </li>               
                <li>
                    <strong>${space(2)}available:</strong> 234,
                </li>               
                <li>
                    <strong>${space(2)}date:</strong> "2024-07-15",
                </li>               
                <li>
                    <strong>${space(1)}},</strong>
                </li> 

                <li>
                    <strong>${space(1)}{</strong>       
                </li>               
                <li>
                    <strong>${space(2)}available:</strong> 235,
                </li>               
                <li>
                    <strong>${space(2)}date:</strong> "2024-07-16",
                </li>               
                <li>
                    <strong>${space(1)}},</strong>
                </li> 

                <li>
                    <strong>]</strong>
                </li>                 
            </ul>

            
            <hr>
            <h6>If you pass Object</h6>
            <hr>              
             <ul>
                <li>
                    <strong>{</strong>  
                </li>

                   
                    <li>
                        <strong>${space(1)}data : [</strong>       
                    </li> 

                        <li>
                            <strong>${space(2)}{</strong>       
                        </li>               
                            <li>
                                <strong>${space(3)}name:</strong> 'Product Name',
                            </li>               
                            <li>
                                <strong>${space(3)}quantity:</strong> 234,
                            </li>               
                            <li>
                                <strong>${space(3)}created_at:</strong> "2024-07-15",
                            </li>               
                        <li>
                            <strong>${space(2)}},</strong>
                        </li>                

                        <li>
                            <strong>${space(2)}{</strong>       
                        </li>               
                            <li>
                                <strong>${space(3)}name:</strong> 'Sample Product',
                            </li>               
                            <li>
                                <strong>${space(3)}quantity:</strong> 237,
                            </li>               
                            <li>
                                <strong>${space(3)}created_at:</strong> "2024-07-16",
                            </li>               
                        <li>
                            <strong>${space(2)}},</strong>
                        </li>                
                                     
                          
                    <li>
                        <strong>${space(1)}],</strong>
                    </li>   


                    <li>
                        <strong>${space(1)}aiasesKey : {</strong>       
                    </li>       
                        <li>
                            <strong>${space(2)}available:</strong> "quantity",
                        </li>               
                        <li>
                            <strong>${space(2)}date:</strong> "created_at"
                        </li>  
                    <li>
                        <strong>${space(1)}}</strong>
                    </li>   

                <li>
                    <strong>}</strong>
                </li>                 
            </ul>

        
        
        `,
        isExpand: false,
    },
];


 