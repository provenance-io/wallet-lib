export function paramsToObj(paramsString: string): { [key: string]: string } {
  return paramsString
    .replace(/(^\?)/, '')
    .split('&')
    .reduce((acc, param) => {
      const [key, val] = param.split('=');
      if (key && val)
        return {
          ...acc,
          [key]: val,
        };
      return acc;
    }, {});
}

export const queryParams = paramsToObj(window.document.location.search);
