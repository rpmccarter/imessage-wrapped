export default function isUserOnMobile(): boolean {
  let check = true;
  // I'll use user agent because it's easiest
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  check = toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });

  return check;
}
