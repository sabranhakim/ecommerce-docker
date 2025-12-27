const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: 3306,
    logging: false,
  }
);

const connectWithRetry = async () => {
  let retries = 5;

  while (retries) {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connected");
      return;
    } catch (err) {
      retries -= 1;
      console.log(`⏳ DB not ready, retrying... (${retries})`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.error("❌ Could not connect to database");
  process.exit(1);
};

module.exports = {
  sequelize,
  connectWithRetry,
};
