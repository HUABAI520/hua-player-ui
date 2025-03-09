let timeout: ReturnType<typeof setTimeout> | null;
let currentValue: string;
export const fetch = (
  value: string,
  callback: (data: { value: string; text: string }[]) => void,
  request: (params: { name: string }, options?: { [p: string]: any }) => Promise<any>,
) => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;

  const fake = () => {
    if (currentValue === value) {
      request({ name: value }).then((res: any) => {
        const data = res.map((item: any) => ({
          value: item.id,
          text: item.name,
        }));
        callback(data);
      });
    }
  };
  if (value) {
    timeout = setTimeout(fake, 600);
  } else {
    callback([]);
  }
};
