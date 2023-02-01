// Credit to Jorik - https://dev.to/jorik/country-code-to-flag-emoji-a21

const getFlagEmoji = (countryCode: any) => {
  if (countryCode === "XX") return null;
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((x) => 0x1f1a5 + x.charCodeAt())
  );
};

export default getFlagEmoji;
