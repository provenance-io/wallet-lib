export const LEVELS = {
  LOG: 'LOG',
  ERROR: 'ERROR',
};

const FACES = {
  [LEVELS.LOG]: '👾',
  [LEVELS.ERROR]: '💣',
};

export const log = (message: string | Error, level = LEVELS.LOG, writeLog = process.env.REACT_APP_ENV === 'development') => {
  if (writeLog)
    // eslint-disable-next-line no-console
    console[level === LEVELS.ERROR ? 'error' : 'log'](
      `%c WALLET %c ${FACES[level] || ''} ${message}`,
      `background: ${level === LEVELS.ERROR ? '#BE3F3F' : '#3677EA'}; color: white;`,
      'background: unset; color: unset;'
    );
  // eslint-disable-next-line no-console
  else if (level === LEVELS.ERROR) console.error(message);
};

export default log;
