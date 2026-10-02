export type PausableTimer = { pause: () => void; resume: () => void; clear: () => void };

/** A one-shot timeout that can be paused and resumed without losing the time already counted. */
export const createPausableTimer = (onExpire: () => void, duration: number): PausableTimer => {
  let remaining = duration;
  let startedAt = 0;
  let handle: ReturnType<typeof setTimeout> | null = null;
  let cleared = false;

  const resume = () => {
    if (cleared || handle !== null) return;
    startedAt = Date.now();
    handle = setTimeout(() => {
      handle = null;
      cleared = true;
      onExpire();
    }, remaining);
  };

  const pause = () => {
    if (handle === null) return;
    clearTimeout(handle);
    handle = null;
    remaining -= Date.now() - startedAt;
  };

  const clear = () => {
    pause();
    cleared = true;
  };

  resume();
  return { pause, resume, clear };
};
