const env = require("../config/env");

const sleep = ms => new Promise(r => setTimeout(r, ms));

exports.maybeDelay = async (orderId) => {
  if (!env.CHAOS_ENABLED) return;
  const n = parseInt(orderId.slice(-1));
  if (!isNaN(n) && n % env.CHAOS_MODULO === 0) {
    await sleep(env.CHAOS_DELAY_MS);
  }
};
