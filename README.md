# Calling Bird


# Check IP address
cmd: ipconfig 

# Autoope open.bat shortut
win + R         ---> Then press enter
shell:startup   ---> Then press enter
copy and pate the shortcut of open.bat

# Excel Import/Export (Students + Schedules)
ইমপোর্ট করার সময় শিটের নাম **Students** এবং **Schedules** রাখা সবচেয়ে ভালো। তবে বাধ্যতামূলক নয়।
- **Students** ডাটা সবসময় **প্রথম শিট** থেকে নেয় (শিটের নাম যাই হোক)।
- **Schedules** ডাটা নেয়—যদি কোনো শিটের নাম **Schedules** (case‑insensitive) থাকে, তাহলে সেখান থেকে; **না থাকলে দ্বিতীয় শিট** থেকে নেয়।

সুতরাং নাম একই রাখা রেকমেন্ডেড, না রাখলেও চলবে—শর্ত: Students প্রথম শিটে, Schedules দ্বিতীয় শিটে।

### Students ইমপোর্টের নিয়ম
- প্রথম row অবশ্যই **header row** হতে হবে।
- নিচের **৩টি column বাধ্যতামূলক** (যেকোনো অর্ডারে থাকতে পারে):
  - `name`
  - `dakhela`
  - `class`
- বাকি column গুলো optional: `id`, `class_short`, `card_no`, `year`, `status`, `sound1`, `created`, `card_owner`, `options`, `note`, `device_index`, `profile_image`, `phone_number`
- `year` খালি থাকলে current year বসবে।
- `status` খালি থাকলে `1` (active) বসবে।


To skip DOM lang change add
[data-no-auto-i18n="true"] // But not in use

localizeDom() // But not in use
localizeAppDom() 
is main DOM change able funciton
