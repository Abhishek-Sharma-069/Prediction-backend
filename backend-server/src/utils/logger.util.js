const log = (level, ...args) => {
  const prefix = `[${new Date().toISOString()}] [${level}]`;
  console.log(prefix, ...args);
};

export const logger = {
  info: (...args) => log('INFO', ...args),
  warn: (...args) => log('WARN', ...args),
  error: (...args) => log('ERROR', ...args),
  debug: (...args) => log('DEBUG', ...args),
};
