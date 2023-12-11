import vCard from 'vcf';

export const parseContacts = async (file: File) => {
  const cards = await loadVCards(file);
  return cards.reduce<Record<string, string>>((acc, card) => {
    try {
      const name = cleanName(card);
      cleanNumbers(card).forEach((num) => (acc[num] = name));
    } catch (e) {
      console.log(e);
    }
    return acc;
  }, {});
};

const cleanNumbers = (card: vCard): string[] => {
  const prop: vCard.Property | vCard.Property[] | undefined = card.get('tel');
  if (prop === undefined) {
    return [];
  }
  if (Array.isArray(prop)) {
    return prop.map((num) => normalizeId(num.valueOf()));
  }
  return [normalizeId(prop.valueOf())];
};

export const normalizeId = (number: string): string => {
  // not sure if this is applicable, but if any contacts use email, preserve special chars
  if (number.includes('@')) return number.toLowerCase();

  return number.replaceAll(/[^0-9]/g, '');
};

const cleanName = (card: vCard): string => {
  const prop: vCard.Property | vCard.Property[] | undefined = card.get('fn');
  if (prop === undefined) {
    throw Error('missing name');
  }
  if (Array.isArray(prop)) {
    return prop[0].valueOf();
  }
  return prop.valueOf();
};

const loadVCards = (file: File) =>
  new Promise<vCard[]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject('unable to parse contact file');
      }
      try {
        const cards = vCard.parse(reader.result);
        return resolve(cards);
      } catch (e) {
        return reject(e);
      }
    };
    reader.readAsText(file);
  });
