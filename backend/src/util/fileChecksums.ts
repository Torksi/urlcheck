interface Checksums {
  [filename: string]: string;
}

const checksums: Checksums = {
  "jquery-3.1.1.min.js": "ac5017a6c6a77a3db6f989b281084b6f",
  "this-will-not-match.js": "asdasdassdas",
};

export default checksums;
