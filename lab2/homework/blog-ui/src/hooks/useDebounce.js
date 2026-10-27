import { useState, useEffect } from "react";

export function useDebounce(value, delay = 400) {
  // 1. state holding the settled value
  const [debounced, setDebounced] = useState(value);
  // 2. effect on [value, delay]:
  //      - start setTimeout(() => setSettled(value), delay)
  //      - return cleanup that clearTimeout(id)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id);
  }, [value, delay])
  // 3. return settled
  return debounced;
}