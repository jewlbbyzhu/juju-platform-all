module.exports = {
  apps: [{
    name: "server",
    script: "./src/server.js",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production"
    },
    env_production: {
      NODE_ENV: "production"
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time: true
  }]
};
