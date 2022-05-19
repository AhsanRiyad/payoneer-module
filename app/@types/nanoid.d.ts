import { type } from "os";

declare module 'nanoid';

export function nanoid(size?: number): string;
export type NanoId = string;