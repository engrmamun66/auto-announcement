
const port_number = 2323

// shifts must be 24 hours format
const SHIFTS = {
     teacher: {
          start: '04:00',
          end: '23:59', 
     },
     first: {
          start: '08:30',
          end: '10:00', 
     },
     second: {
          start: '14:30',
          end: '16:00', 
     },
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  NOT saved to DB  →  env{}                                   ║
// ║  Saved to DB      →  settings, classes, logo, css_vars,      ║
// ║                       card_owners, card_not_set_message      ║
// ║  DB keys are editable from Settings panel in the UI.         ║
// ╚══════════════════════════════════════════════════════════════╝

module.exports = {
     // ── NOT saved to DB ── loaded from config.js at startup only ──
     env: {
          PORT: port_number,
          SOCKET_PORT: 2424,
          SECRET_KEY: 'YOUR_SECRET_KEY',
          CODE_NUMBER: 'DEV_MAM', // Rrequeired for Client Identification
          PUNCH_LOG_FILENAME: 'punch.log.json', 
          DATABASE_PATH: 'database/database.db', // For Client DB Example: './../clientdb-DHM101.db'


          /** ==== with-BioTime-app === */
          BIO_TIME_APP_USERNAME: "Admin",
          BIO_TIME_APP_PASSWORD: "Admin@123",
          DEVICE_NAMES: ['Device 2'], // zktecho device name, which already connected by name in BioTime-8.0 server
          DATA_FETCH_BACK_SECONDS: 10,
          DATA_FETCH_INTERVAL_IN_SECOND: 2,
          PRIMARY_SERVER_LOCAL: 'http://wordpress-test.test/wp-admin/admin-ajax.php',
          PRIMARY_SERVER: 'https://callingbird.softproit.com/wp-admin/admin-ajax.php', 
          /** ==== End === */

          // #Front End variables
          BASE_URL: `http://localhost:${port_number}`,
          API_BASE_URL: `http://localhost:${port_number}/api`,
          DEVICE_API_BASE_URL: 'http://127.0.0.1:8081/',

     },

     // ── Saved to DB (settings table) ── editable from UI Settings panel ──
     settings: {
          lang_bn: true,
          log_backup_days: 7,
          punch_log_indent: 0, // for developer,
          click_me_to_allow_sound: {
               status: false,
               custom_message: 'Click me to allow sound',
          },
          auto_focus_student_card: {
               status: false,
               delay_in_seconds: 3
          },
          with_speaker_controls: {
               status: false, // -------------------------- on/off
               switch_count: 8,
               switch_board_chunk_size: 8,
               on_inactivity_switches_mode: 'no_action', // no_action | open_all | close_all | [1,2,3] ===> array of switch numbers
               switch_mode: 'auto', // auto || manual,
               delay_before_starting: 10, // miliseconds
          },
          attendance: {
               status: true, // -------------------------- on/off
               only_attendance_feature: false,

                /**
                * 'if_present_in_first_shift'
                * 'if_present_in_last_shift'
                * 'if_present_in_all_shifts'
                * 'if_present_minimum_{2}_shift'. // 2 is dynamic
                * 'if_present_in_[1, 2]'         // 1 means fist shift, 2 means 2nd shift
                */
               preset_count_by: 'if_present_in_first_shift', 
               /**
                * using in getRunningShift() function
                * example: if boundary_time = 30
                * To fix boundary for a shift: (shift.start - 30min, shift.end + 30min)
                */
               boundary_time: { 
                    start_before: [10, 'minutes'], 
                    end_after: [15, 'minutes'] 
               },  
               /**
                * if strict_boundary_time = true, 
                * out of boundary time nobody can be submit attendance, 
                * otherwise shift will be selected automatically 
                */
              
               strict_boundary_time: false, // true | false
               punch_separator_gap_in_seconds: 10,
               // ====================================================== //
               /**
                * [ It's only for shift start time ]
                * If user come before over late_consideration_minute, late time will be 0 minute,
                * example:
                * =======================================
                * When late_consideration_minute = 5
                * shift start: 08:00, student come: 08:05
                */
               late_consideration_minute: 5, 
               maximum_live_attedence: 500, 
               pagination: {
                    perpage: 20,
                    pagiation_positon: 'bottom_center', // bottom_left | bottom_center | bottom_right
               },
               weekends: ['Friday'], // Saturday, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
               
          },
          sms: {
               enabled: false,                    // master on/off
               provider: 'mimsms',               // ssl_wireless | mimsms | muthofon | custom
               api_base_url: 'https://api.mimsms.com',
               api_key: '',                       // API key from mimsms.com dashboard
               user_name: '',                     // mimsms account email
               sender_id: '',                     // approved sender ID / number
               send_on_in: true,                  // send SMS when student punches IN
               send_on_out: false,                // send SMS when student punches OUT
               // {name}, {time}, {date}, {status} are replaced at send time
               in_message_template: `
               🕌 তালীমুল কুরআন মহিলা মাদ্রাসা
               ========================
               🧑 নামঃ {name}
               📚 ক্লাসঃ {class}
               🗓️ তারিখঃ {date}
               ⏰ প্রবেশের সময়ঃ {time} 🟢
               `,
               out_message_template: `
               🕌 তালীমুল কুরআন মহিলা মাদ্রাসা
               ========================
               🧑 নামঃ {name}
               📚 ক্লাসঃ {class}
               🗓️ তারিখঃ {date}
               ⏰ বের হওয়ার সময়ঃ {time} 🔴
               `,
               only_if_phone_number: true,        // skip student if no phone_number set
          },
     },
     date_range_list: [
          "This Week",
          "Last Week",
          // "Next Week",
          "This Month",
          "Last Month",
          // "Next Month", 
          "Last Year",
          "Auto Months",
     ],
     logo: {
          width: '200px',
          image_url: 'logo.example.jpeg',
          padding: '4px 10px',
     },
     css_vars: `

     /* === Pick color from >> module.css ===*/

     /* === Black & White Theme */
     --primaryColor: #2c3e50;
     --secondaryColor: #4d566b;
     --borderColor: #d5fdd7;
     --fontColor: #2c3e50;
     --grad1: linear-gradient(90deg, rgba(137, 137, 137, 0.636) 0%, #b3c6d2 100%);
     --grad2: linear-gradient(90deg, rgba(118, 118, 118, 0.348) 0%, rgba(246, 231, 255, 0.486) 100%);
     --grad3: linear-gradient(90deg, var(--primaryColor) 0%, var(--secondaryColor) 100%);
     `,
    
     classes: [
          {
               class_name: 'Teacher',
               display_name: 'Teacher',
               class_short: 'teachers',
               isActive: true,
               speaker_ports: [],
               shifts: [ SHIFTS?.teacher ],
          },
          {
               class_name: 'Play',
               display_name: 'play',
               class_short: 'play',
               isActive: true,
               speaker_ports: [1, 2],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Nursery',
               display_name: 'nursery',
               class_short: 'nursery',
               isActive: true,
               speaker_ports: [1, 2],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'KG',
               display_name: 'kg',
               class_short: 'kg',
               isActive: true,
               speaker_ports: [1, 2],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'One/Saffe Awal',
               display_name: 'one',
               class_short: 'one',
               isActive: true,
               speaker_ports: [1, 2],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Two/Saffe Sani',
               display_name: 'two',
               class_short: 'two',
               isActive: true,
               speaker_ports: [1, 2],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Three/Saffe Sales',
               display_name: 'three',
               class_short: 'three',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Four/Saffe Rabe',
               display_name: 'four',
               class_short: 'four',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Ibtedaiyah',
               display_name: 'five',
               class_short: 'five',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Mutawassitah Awal / Mizan',
               display_name: 'mizan',
               class_short: 'mizan',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Mutawassitah Sani / Nahbemir',
               display_name: 'nahbemir',
               class_short: 'nahbemir',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Mutawassitah Sales',
               display_name: 'kuduri',
               class_short: 'kuduri',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Sanabiya Awal/Shorhebekaya',
               display_name: 'shorhebekaya',
               class_short: 'shorhebekaya',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Sanabiya Sani',
               display_name: 'Hedaya',
               class_short: 'meskat1',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Class 11',
               display_name: 'Meshkat',
               class_short: 'class_11',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Takmil',
               display_name: 'Daora',
               class_short: 'class_12',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Hifz',
               display_name: 'hifz',
               class_short: 'hifz',
               isActive: true,
               speaker_ports: [1, 5],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
          {
               class_name: 'Pre Hifz',
               display_name: 'Pre Hifz',
               class_short: 'pre_hifz',
               isActive: true,
               speaker_ports: [1, 5],
               shifts: [ SHIFTS?.first, SHIFTS?.second ],
          },
     ],
     card_not_set_message: 'Unknown',
     card_owners: [
          {
               id: 1,
               name: 'বাবা',
          },
          {
               id: 2,
               name: 'মা',
          },
          {
               id: 3,
               name: 'চাচা',
          },
          {
               id: 4,
               name: 'মাহরাম',
          },
     ]

}
 
