export const throttle = <T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number
) => {
  let last = 0;
  let timeout: number | undefined;
  let pendingArgs: Parameters<T> | null = null;

  const run = () => {
    if (!pendingArgs) {
      return;
    }
    fn(...pendingArgs);
    last = Date.now();
    pendingArgs = null;
  };

  return (...args: Parameters<T>) => {
    pendingArgs = args;
    const now = Date.now();
    const remaining = wait - (now - last);

    if (remaining <= 0) {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = undefined;
      }
      run();
      return;
    }

    if (!timeout) {
      timeout = window.setTimeout(() => {
        timeout = undefined;
        run();
      }, remaining);
    }
  };
};
