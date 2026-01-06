const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

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
