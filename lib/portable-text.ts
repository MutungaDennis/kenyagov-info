/**
 * Lightweight Portable Text helpers — re-export Hansard-safe implementations.
 * Keep this module free of AI/PDF deps for Cloudflare Worker size.
 */

export {
  textToPortableText,
  portableTextToPlain,
  normalizeSpeechForSanity,
} from "@/lib/hansard/speech";
