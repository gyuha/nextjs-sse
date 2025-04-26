import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function uuid(numberOfCharacters = 8): string {
  let uidStr = Date.now().toString(36).slice(-4).split("").reverse().join("");
  if (numberOfCharacters <= 4) {
    return uidStr.slice(0, numberOfCharacters);
  }
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < numberOfCharacters - 4; i++) {
     uidStr += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return uidStr; 
}