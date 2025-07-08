module.exports = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/x-icon" href="http://localhost:2323/favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Announcement</title>
    <script>
     var GLOBAL_DATA = {
        logo: "DYNAMIC_LOGO_URL", 
        logo_width: "DYNAMIC_LOGO_WIDTH", 
        logo_area_padding: "DYNAMIC_LOGO_AREA_PADDING", 
        env: 'ENV_VARIABLES_IN_JSON_FROMAT'
     }
    </script>
    <link rel="stylesheet" href="/dist/assets/my-announcement.min.css">
    <script src="/dist/assets/my-announcement.min.js"></script>
    <!-- CSS_VARS -->
</head>

<body>
    <div id="my-app"></div>
</body>

</html>
`

