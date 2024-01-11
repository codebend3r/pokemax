const fs = require('fs');

function decode(messageFile) {
  // use fs to read the file
  const fileContent = fs.readFileSync(messageFile, 'utf8');

  // create an array of lines split on the end of line
  const lines = fileContent.trim().split('\n');

  // loop through each line and create the matching pair of number to word
  const pairs = lines.map((line) => {
    const [num, word] = line.split(' ');
    return { num: parseInt(num), word };
  });

  // create a dictionary using the reduce function
  const numToWord = pairs.reduce((acc, pair) => {
    return {
      ...acc,
      [pair.num]: pair.word,
    };
  }, {});

  // find the maximum number in the last line
  const maxNumber = pairs[pairs.length - 1].num;

  // extract the message words using the pyramid structure
  const messageWords = [];
  for (let i = 1; i <= maxNumber; i++) {
    messageWords.push(numToWord[i]);
  }

  // Join the words into a string
  const decodedMessage = messageWords.join(' ');

  return decodedMessage;
}

const messageFile = 'coding_qual_input.txt';
const result = decode(messageFile);
console.log(result);
