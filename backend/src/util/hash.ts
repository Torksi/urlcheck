import { createHash } from "crypto";

/**
 * Returns an MD5 hash for the given `content`.
 *
 * @param {String} content
 *
 * @returns {String}
 */
export function md5(content: string) {
  return createHash("md5").update(content).digest("hex");
}
