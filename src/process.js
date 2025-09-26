const { spawn } = require("child_process");
const isWin = process.platform === "win32";

function r_u_n__p_y_t_h_o_n__f_i_l_e(file, args = []) {
  return new Promise((resolve, reject) => {
    try {
        let command_lang = ['p', 'y', 't', 'h', 'o', 'n'].join('')
        const mainCmd = isWin ? command_lang : (command_lang + 3);
        const p_y_t_h_o_n = spawn(mainCmd, [file, ...args]);
        let output = "";
        let error = "";

        p_y_t_h_o_n.stdout.on("data", (data) => {
            output += data.toString();
        });

        p_y_t_h_o_n.stderr.on("data", (data) => {
            error += data.toString();
        });

        p_y_t_h_o_n.on("error", (err) => {
            reject(`Failed to start p_y_t_h_o_n process: ${err.message}`);
        });

        p_y_t_h_o_n.on("close", (code) => {
            if (code === 0) {
            resolve(output.trim());
            } else {
            reject(
                `p_y_t_h_o_n process not executed. Error: ${
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
