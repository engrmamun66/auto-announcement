class RegistryController {
  handle(req, res) {
    let rawData = '';

    req.on('data', chunk => {
      rawData += chunk.toString();
    });

    req.on('end', () => {
      const sn = req.query.SN || req.query.sn || 'UNKNOWN';

      console.log(`${req.method}:: ${req.originalUrl}`);
      console.log(`ZKTeco [${sn}] registry`);
      console.log({ rawData });

      res.status(200).type('text/plain').send(`RegistryCode=${sn}\r\n`);
    });
  }
}

module.exports = new RegistryController();
