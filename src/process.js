const { spawn } = require("child_process");
const isWin = process.platform === "win32";

function r_u_n__p_y_t_h_o_n__f_i_l_e(file, args = []) {
  return new Promise((resolve, reject) => {
    try {
        const pythonCmd = isWin ? "python" : "python3";
        const python = spawn(pythonCmd, [file, ...args]);
        let output = "";
        let error = "";

        python.stdout.on("data", (data) => {
            output += data.toString();
        });

        python.stderr.on("data", (data) => {
            error += data.toString();
        });

        python.on("error", (err) => {
            reject(`Failed to start Python process: ${err.message}`);
        });

        python.on("close", (code) => {
            if (code === 0) {
            resolve(output.trim());
            } else {
            reject(
                `Python process not executed. Error: ${
                error || `Exited with code ${code}`
                }`
            );
            }
        });
    } catch (err) {
      reject(`Unexpected error: ${err.message}`);
    }
  });
}

// Example usage:
// r_u_n__p_y_t_h_o_n__f_i_l_e("./../relay.singleboard.py", ["arg1", "arg2"])
//   .then(result => console.log("Output:", result))
//   .catch(err => console.error("Error:", err));

module.exports = r_u_n__p_y_t_h_o_n__f_i_l_e;
