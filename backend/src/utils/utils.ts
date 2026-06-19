import { customAlphabet } from "nanoid";

export function generateRandomId(length: number): string {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nanoid5 = customAlphabet(alphabet, length);
  return nanoid5();
}
