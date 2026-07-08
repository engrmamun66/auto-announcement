class DevicecmdController {
  handle(req, res) {
    let rawData = '';

    req.on('data', chunk => {
      rawData += chunk.toString();
    });

    req.on('end', () => {
      const sn = req.query.SN || req.query.sn || 'UNKNOWN';

      console.log(`${req.method}:: ${req.originalUrl}`);
      const params = Object.fromEntries(
        rawData.replace(/\n$/, '').split('&').map(p => p.split('='))
      );
      const returnCode = parseInt(params.Return || '0', 10);
      const status = returnCode === 0 ? 'OK' : `FAILED (${returnCode})`;

      console.log(`ZKTeco [${sn}] command result [${status}]`);
      console.log({ id: params.ID, cmd: params.CMD, return: params.Return });

      res.status(200).type('text/plain').send('OK\r\n');
    });
  }
}

module.exports = new DevicecmdController();
