import { ParsedMail, simpleParser } from "mailparser";

export class EmailScanController {
  public static async parseEmail(source: string): Promise<ParsedMail> {
    const parsed = await simpleParser(source);
    return parsed;
  }
}
