
const port_number = 2323

module.exports = {
     mode: 'with-BioTime-app', // 'with-ips' || 'with-BioTime-app'
     env: {
          PORT: port_number,
          SOCKET_PORT: 2424,
          SECRET_KEY: 'YOUR_SECRET_KEY',
          PUNCH_LOG_FILENAME: 'punch.log.json',
          
          /** ==== with-ips(Recommended) === */
          DEVICES: [
               {
                    devicePort: '4370',
                    deviceIp: "192.168.68.113",
                    clean: false, // false | anyquantity(e.g 500)
               }
          ], 
          /** ==== End === */


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
          punch_log_indent: 0, // for developer
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
               onPause_openAll_speakers: true,
          }
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
     // css_vars: false
     classes: [
          {
               class_name: 'Play',
               class_short: 'play',
               display_name: 'play',
               isActive: true,
               speaker_ports: [1, 2, 3],
          },
          {
               class_name: 'Nursery',
               class_short: 'nursery',
               display_name: 'nursery',
               isActive: true,
               speaker_ports: [1, 2],
          },
          {
               class_name: 'KG',
               class_short: 'kg',
               display_name: 'kg',
               isActive: true,
               speaker_ports: [1, 3],
          },
          {
               class_name: 'One/Saffe Awal',
               class_short: 'one',
               display_name: 'one',
               isActive: true,
               speaker_ports: [1, 3],
          },
          {
               class_name: 'Two/Saffe Sani',
               class_short: 'two',
               display_name: 'two',
               isActive: true,
               speaker_ports: [1, 4],
          },
          {
               class_name: 'Three/Saffe Sales',
               class_short: 'three',
               display_name: 'three',
               isActive: true,
               speaker_ports: [1, 5],
          },
          {
               class_name: 'Four/Saffe Rabe',
               class_short: 'four',
               display_name: 'four',
               isActive: true,
               speaker_ports: [1, 5],
          },
          {
               class_name: 'Ibtedaiyah',
               class_short: 'five',
               display_name: 'five',
               isActive: true,
               speaker_ports: [1, 6],
          },
          {
               class_name: 'Mutawassitah Awal / Mizan',
               class_short: 'mizan',
               display_name: 'mizan',
               isActive: true,
               speaker_ports: [1, 7],
          },
          {
               class_name: 'Mutawassitah Sani / Nahbemir',
               class_short: 'nahbemir',
               display_name: 'nahbemir',
               isActive: true,
               speaker_ports: [1, 8],
          },
          {
               class_name: 'Mutawassitah Sales',
               class_short: 'kuduri',
               display_name: 'kuduri',
               isActive: true,
               speaker_ports: [1, 8],
          },
          {
               class_name: 'Sanabiya Awal/Shorhebekaya',
               class_short: 'shorhebekaya',
               display_name: 'shorhebekaya',
               isActive: true,
               speaker_ports: [1, 8],
          },
          {
               class_name: 'Sanabiya Sani',
               class_short: 'meskat1',
               display_name: 'Hedaya',
               isActive: true,
               speaker_ports: [1, 8],
          },
          {
               class_name: 'Class 11',
               class_short: 'class_11',
               display_name: 'Meshkat',
               isActive: true,
               speaker_ports: [1, 8],
          },
          {
               class_name: 'Takmil',
               class_short: 'class_12',
               display_name: 'Daora',
               isActive: true,
               speaker_ports: [1, 8],
          },
          {
               class_name: 'Hifz',
               class_short: 'hifz',
               display_name: 'hifz',
               isActive: true,
               speaker_ports: [1, 8],
          },
          {
               class_name: 'Pre Hifz',
               class_short: 'pre_hifz',
               display_name: 'Pre Hifz',
               isActive: true,
               speaker_ports: [1, 8],
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
     }

}

