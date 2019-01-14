const {
  deepFlatten,
  getCharacterFrequencies,
  initializeArrayWithValues,
  initializeArrayWithSeed,
  initializeArrayWithRange,
  median,
  bifurcateBy
} = require("../utils");

const getLetterValues = letterFrequencies => {
  const freqArr = Object.keys(letterFrequencies);
  const max = Math.max(...freqArr.map(f => letterFrequencies[f]));
  return freqArr.map(f => {
    return {
      letter: f,
      freq: letterFrequencies[f],
      value: Math.ceil((1 - letterFrequencies[f] / max) * 10)
    };
  });
};

const generateWordKey = letterFrequencies => {
  // const letterFrequencies = getCharacterFrequencies(words);
  // const letterPairFrequencies = getCharacterPairFrequencies(words);

  const letterValues = getLetterValues(letterFrequencies);
  // console.log();
  const m = median(letterValues.map(x => x.freq));
  const [common, uncommon] = bifurcateBy(letterValues, x => x.freq > m);
  // const pairs = letterPairFrequencies.filter(p => p.freq > 250);

  const key = [
    // ...deepFlatten(
    //   initializeArrayWithSeed(pairs, 1).map(p => {
    //     return p.pair
    //       .split("")
    //       .map(c => ({ letter: c, freq: p.freq, value: p.freq }));
    //   })
    // ),
    ...initializeArrayWithSeed(common, 5),
    ...initializeArrayWithSeed(uncommon, 1)
    // ...initializeArrayWithSeed(letterValues, 6)
  ];

  return {
    key: key.map(l => l.letter),
    values: key.map((k, i) => ({ ...k, id: i }))
  };
};

const getNormalizedWordFrequencies = wordLists => {
  const wordLengthFrequencies = wordLists.reduce((a, c, i) => {
    a[i + 3] = c.length;
    return a;
  }, {});
  const total = Object.values(wordLengthFrequencies).reduce((a, c) => a + c, 0);
  return Object.keys(wordLengthFrequencies).map(len => {
    return { len, prob: wordLengthFrequencies[len] / total };
  });
};
const pickWordLengthByProbability = arr => {
  const winner = Math.random();
  let threshold = 0;
  for (let i = 0; i < arr.length; i++) {
    threshold += parseFloat(arr[i].prob);
    if (threshold > winner) {
      return arr[i];
    }
  }
};

const findMatchingWords = (wordList, key, currentList) => {
  const keyCharacterFrequencies = getCharacterFrequencies(key);
  return wordList.filter(w => {
    const wordArr = w.split("");
    if (!currentList.includes(w) && wordArr.every(c => key.includes(c))) {
      const f = getCharacterFrequencies(wordArr);
      return wordArr.every(c => f[c] <= keyCharacterFrequencies[c]);
    }
    return false;
  });
};

const generateWordList = (
  numWords,
  maxWordLength,
  wordLists,
  letterFrequencies,
  wordFrequencies
) => {
  const { key, values } = generateWordKey(letterFrequencies);

  const wordLengths = initializeArrayWithValues(numWords).map(
    () => pickWordLengthByProbability(wordFrequencies).len
  );

  const words = wordLengths.reduce((a, c) => {
    const matchingWords = findMatchingWords(wordLists[c - 3], key, a);
    return matchingWords.length
      ? [...a, matchingWords[Math.floor(Math.random() * matchingWords.length)]]
      : a;
  }, []);

  return words.length < numWords
    ? generateWordList(
        numWords,
        maxWordLength,
        wordLists,
        letterFrequencies,
        wordFrequencies
      )
    : { words, key: values };
};

const getWordList = (numWords, maxWordLength = 6) => {
  const wordLists = initializeArrayWithRange(maxWordLength, 3).map(n =>
    require(`./lists/popular/${n}.json`)
  );
  const wordFrequencies = getNormalizedWordFrequencies(wordLists);
  const letterFrequencies = getCharacterFrequencies(deepFlatten(wordLists));

  return generateWordList(
    numWords,
    maxWordLength,
    wordLists,
    letterFrequencies,
    wordFrequencies
  );
};

module.exports = { getWordList };
