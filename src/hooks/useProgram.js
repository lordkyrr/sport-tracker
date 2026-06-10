import { useStorage } from "./useStorage";
import { DEFAULT_PROGRAM } from "../lib/defaults";

export function useProgram() {
  const [program, setProgram] = useStorage("program-config", DEFAULT_PROGRAM);
  return { program, setProgram };
}
