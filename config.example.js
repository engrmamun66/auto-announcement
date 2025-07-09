
const port_number = 2323

module.exports = {
     env: {
          PORT: port_number,
          SOCKET_PORT: 2424,
          BIO_TIME_APP_USERNAME: "admin",
          BIO_TIME_APP_PASSWORD: "Admin@123",
          // #Front End variables
          BASE_URL: `http://localhost:${port_number}`,
          API_BASE_URL: `http://localhost:${port_number}/api`,
     },
     logo: {
          width: '100px',
          image_url: 'logo.example.png',
          padding: '14px 10px',
     },
     css_vars: `
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
          },
          {
               class_name: 'Nursery',
               class_short: 'nursery',
               display_name: 'nursery',
               isActive: true,
          },
          {
               class_name: 'KG',
               class_short: 'kg',
               display_name: 'kg',
               isActive: true,
          },
          {
               class_name: 'One/Saffe Awal',
               class_short: 'one',
               display_name: 'one',
               isActive: true,
          },
          {
               class_name: 'Two/Saffe Sani',
               class_short: 'two',
               display_name: 'two',
               isActive: true,
          },
          {
               class_name: 'Three/Saffe Sales',
               class_short: 'three',
               display_name: 'three',
               isActive: true,
          },
          {
               class_name: 'Four/Saffe Rabe',
               class_short: 'four',
               display_name: 'four',
               isActive: true,
          },
          {
               class_name: 'Ibtedaiyah',
               class_short: 'five',
               display_name: 'five',
               isActive: true,
          },
          {
               class_name: 'Mutawassitah Awal / Mizan',
               class_short: 'mizan',
               display_name: 'mizan',
               isActive: true,
          },
          {
               class_name: 'Mutawassitah Sani / Nahbemir',
               class_short: 'nahbemir',
               display_name: 'nahbemir',
               isActive: true,
          },
          {
               class_name: 'Mutawassitah Sales',
               class_short: 'kuduri',
               display_name: 'kuduri',
               isActive: true,
          },
          {
               class_name: 'Sanabiya Awal/Shorhebekaya',
               class_short: 'shorhebekaya',
               display_name: 'shorhebekaya',
               isActive: true,
          },
          {
               class_name: 'Sanabiya Sani',
               class_short: 'meskat1',
               display_name: 'Hedaya',
               isActive: true,
          },
          {
               class_name: 'Class 11',
               class_short: 'class_11',
               display_name: 'Meshkat',
               isActive: true,
          },
          {
               class_name: 'Takmil',
               class_short: 'class_12',
               display_name: 'Daora',
               isActive: true,
          },
          {
               class_name: 'Hifz',
               class_short: 'hifz',
               display_name: 'hifz',
               isActive: true,
          },
          {
               class_name: 'Pre Hifz',
               class_short: 'pre_hifz',
               display_name: 'pre_hifz',
               isActive: true,
          },
     ],

}

