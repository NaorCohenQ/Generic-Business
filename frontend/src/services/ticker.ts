export function createTicker(cb: () => void, intervalMs: number) {
  let timer: any = null;
  let paused = false;

  function tick() {
    if (!paused) cb();
  }
  return {
    start(){ if (!timer) timer = setInterval(tick, intervalMs); },
    stop(){ if (timer) { clearInterval(timer); timer = null; } },
    setPaused(p:boolean){ paused = p; },
    setSpeed(_:number){ /* speed handled in store via dt multiplier */ }
  };
}
