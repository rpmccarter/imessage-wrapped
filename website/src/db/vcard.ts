import vCard from 'vcf';
import * as fs from 'fs';

function cleanThatShit(number: string) {
  return number
    .replace('+', '')
    .replace(' ', '')
    .replace('(', '')
    .replace(')', '')
    .replace('-', '');
}

function extractPhoneNumbers(strings: string[]): string[] {
  const phoneNumberRegex =
    /\+?(\d{1,3})?[-.\s]?(\(\d{1,4}\)|\d{1,4})?[-.\s]?(\d{1,4}[-.\s]?){1,3}\d{1,4}/g;
  let phoneNumbers: string[] = [];

  strings.forEach((str) => {
    let matches = str.match(phoneNumberRegex);
    if (matches) {
      const cleanMatches = (phoneNumbers = phoneNumbers.concat(matches));
    }
  });

  return phoneNumbers;
}

export function parseVcard(filePath: string): Record<string, string> {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  var vCardData = vCard.parse(fileContents);
  console.log(vCardData);
  const numToName: Record<string, string> = {};
  for (const card of vCardData) {
    // console.log(card.toJSON());
    // const tel = card.get('tel').valueOf();
    const name = card.get('fn').valueOf();
    if (!card.get('tel')) {
      continue;
    }
    const tel = JSON.stringify(card.get('tel')).split(',');
    const phone_number = extractPhoneNumbers(tel);

    for (let i = 0; i < phone_number.length; i++) {
      phone_number[i] = cleanThatShit(phone_number[i]);
      numToName[phone_number[i]] = name.toString();
    }

    return numToName;
  }

  return numToName;
}
