module.exports = {
  apps: [
    {
      name: "jurisshift-backend",
      script: "python",
      args: "-m uvicorn app.main:app --host 0.0.0.0 --port 8000",
      cwd: "./jurisshift/backend",
      autorestart: true,
      watch: false,
      restart_delay: 2000
    },
    {
      name: "jurisshift-frontend",
      script: "npm",
      args: "run dev",
      cwd: "./jurisshift/frontend",
      autorestart: true,
      watch: false,
      restart_delay: 2000
    }
  ]
};
