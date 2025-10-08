
const port_number = 2323

// shifts must be 24 hours format
const SHIFTS = {
     first: {
          start: '08:30', 
          end: '12:20',
     },
     second: {
          start: '22:30',
          end: '23:20', 
     },
}

module.exports = {
     env: {
          PORT: port_number,
          SOCKET_PORT: 2424,
          SECRET_KEY: 'YOUR_SECRET_KEY',
          PUNCH_LOG_FILENAME: 'punch.log.json', 


          /** ==== with-BioTime-app === */
          BIO_TIME_APP_USERNAME: "admin",
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
     settings: {
          log_backup_days: 7,
          punch_log_indent: 0, // for developer,
          auto_focus_student_card: {
               status: false,
               delay_in_seconds: 3
          },
          backup: {
               logo: true,
               database: true,
               openbat: true,
               config: true,
               exports: true,
               media: true,
          },
          with_speaker_controls: {
               status: true,
               switch_count: 8,
               switch_board_chunk_size: 8,
               on_inactivity_switches_mode: 'no_action', // no_action | open_all | close_all | [1,2,3] ===> array of switch numbers
               switch_mode: 'auto', // auto || manual,
               delay_before_starting: 10, // miliseconds
          },
          attendance: {
               status: true,
               only_attendance_feature: false,
               // boundary_time: [30, 'minutes'], // using in getRunningShift() function
               boundary_time: [30, 'minutes'], // using in getRunningShift() function,
               punch_separator_gap_in_seconds: 10,
               // ====================================================== //
               /**
                * [ It's only for shift start time ]
                * If user come before over late_conderation_minute, late time will be 0 minute,
                * example:
                * =======================================
                * When late_conderation_minute = 5
                * shift start: 08:00, student come: 08:05
                */
               late_conderation_minute: 5, 
               maximum_live_attedence: 50, 
               pagination: {
                    perpage: 2,
                    pagiation_positon: 'top_left', // top_left | top_center | top_right ||| left_left | left_center | left_right
               } 
          },
     },
     logo: {
          width: '200px',
          image_url: 'logo.example.jpeg',
          padding: '4px 10px',
     },
     css_vars: `

     /* === Pick color from >> module.css ===*/

     /* === Black & White Theme */
     --primaryColor: #222322;
     --secondaryColor: #3a3a3a;
     --borderColor: #d5fdd7;
     --fontColor: #222322;
     --grad1: linear-gradient(90deg, rgba(137, 137, 137, 0.636) 0%, rgb(227, 244, 255) 100%);
     --grad2: linear-gradient(90deg, rgba(118, 118, 118, 0.348) 0%, rgba(246, 231, 255, 0.486) 100%);
     --grad3: linear-gradient(90deg, #222322 0%, #3a3a3a 100%); 
     `,
    
     classes: [
          {
               class_name: 'Play',
               class_short: 'play',
               display_name: 'play',
               isActive: true,
               speaker_ports: [1, 2],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Nursery',
               class_short: 'nursery',
               display_name: 'nursery',
               isActive: true,
               speaker_ports: [1, 2],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'KG',
               class_short: 'kg',
               display_name: 'kg',
               isActive: true,
               speaker_ports: [1, 2],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'One/Saffe Awal',
               class_short: 'one',
               display_name: 'one',
               isActive: true,
               speaker_ports: [1, 2],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Two/Saffe Sani',
               class_short: 'two',
               display_name: 'two',
               isActive: true,
               speaker_ports: [1, 2],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Three/Saffe Sales',
               class_short: 'three',
               display_name: 'three',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Four/Saffe Rabe',
               class_short: 'four',
               display_name: 'four',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Ibtedaiyah',
               class_short: 'five',
               display_name: 'five',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Mutawassitah Awal / Mizan',
               class_short: 'mizan',
               display_name: 'mizan',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Mutawassitah Sani / Nahbemir',
               class_short: 'nahbemir',
               display_name: 'nahbemir',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Mutawassitah Sales',
               class_short: 'kuduri',
               display_name: 'kuduri',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Sanabiya Awal/Shorhebekaya',
               class_short: 'shorhebekaya',
               display_name: 'shorhebekaya',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Sanabiya Sani',
               class_short: 'meskat1',
               display_name: 'Hedaya',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Class 11',
               class_short: 'class_11',
               display_name: 'Meshkat',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Takmil',
               class_short: 'class_12',
               display_name: 'Daora',
               isActive: true,
               speaker_ports: [1, 6],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Hifz',
               class_short: 'hifz',
               display_name: 'hifz',
               isActive: true,
               speaker_ports: [1, 5],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
          {
               class_name: 'Pre Hifz',
               class_short: 'pre_hifz',
               display_name: 'Pre Hifz',
               isActive: true,
               speaker_ports: [1, 5],
               shifts: [ SHIFTS.first, SHIFTS.second ],
          },
     ],
     studentTableColumns: {
          class: 'Class',
          name: 'Name',
          dakhela: 'Dakhela',
          year: 'Year',
          sound: 'Sound',
          status: 'Status',
          punch: 'Punch',
          card_owner: 'Owner',
          note: 'Note',
     },
     card_not_set_message: 'Unknown',
     card_owners: [
          {
               id: 1,
               name: 'Father',
          },
          {
               id: 2,
               name: 'Mother',
          },
          {
               id: 3,
               name: 'Uncle',
          },
          {
               id: 4,
               name: 'Mahram',
          },
     ]

}

