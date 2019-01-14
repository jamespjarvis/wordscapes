const {
  deepFlatten,
  getCharacterFrequencies,
  initializeArrayWithValues,
  initializeArrayWithSeed,
  initializeArrayWithRange,
  median,
  bifurcateBy
} = require("../utils");

const masterDictionary = require("./lists/popular/dictionary.json");

const getLetterValues = letterFrequencies => {
  const freqArr = Object.keys(letterFrequencies);
  const max = Math.max(...freqArr.map(f => letterFrequencies[f]));
  return freqArr.reduce((acc, char) => {
    return {
      ...acc,
      [char]: {
        freq: letterFrequencies[char],
        value: Math.ceil((1 - letterFrequencies[char] / max) * 10)
      }
    };
  }, {});
};

const generateWordKey = letterFrequencies => {
  // const letterFrequencies = getCharacterFrequencies(words);
  // const letterPairFrequencies = getCharacterPairFrequencies(words);

  const letterValues = getLetterValues(letterFrequencies);
  // console.log();
  const m = median(letterValues.map(x => x.freq));
  const [common, uncommon] = bifurcateBy(letterValues, x => x.freq > m);
  // const pairs = letterPairFrequencies.filter(p => p.freq > 250);
  const lessFreq = uncommon.filter(
    l => !["Q", "Z", "X", "J"].includes(l.letter)
  );

  const key = [
    // ...deepFlatten(
    //   initializeArrayWithSeed(pairs, 1).map(p => {
    //     return p.pair
    //       .split("")
    //       .map(c => ({ letter: c, freq: p.freq, value: p.freq }));
    //   })
    // ),
    ...initializeArrayWithSeed(common, 5),
    ...initializeArrayWithSeed(lessFreq, 1)
    // ...initializeArrayWithSeed(letterValues, 6)
  ];

  return {
    key: key.map(l => l.letter),
    values: key.map((k, i) => ({ ...k, id: i }))
  };
};

const getKey = keys => {
  const key = keys[Math.floor(Math.random() * keys.length)].split("");
  return {
    key,
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
  wordFrequencies,
  keys,
  n
) => {
  const result = {
    words: [],
    key: []
  };

  // const { key, values } = generateWordKey(letterFrequencies);
  const { key, values } = getKey(keys);
  const wordLengths = initializeArrayWithValues(numWords).map(
    () => pickWordLengthByProbability(wordFrequencies).len
  );

  const words = wordLengths.reduce((a, c) => {
    const matchingWords = findMatchingWords(wordLists[c - 3], key, a);
    return matchingWords.length
      ? [...a, matchingWords[Math.floor(Math.random() * matchingWords.length)]]
      : a;
  }, []);

  if (words.length >= numWords) {
    result.words = words;
    result.key = values;
    result.success = true;
  } else {
    if (n) {
      return generateWordList(
        numWords,
        maxWordLength,
        wordLists,
        letterFrequencies,
        wordFrequencies,
        keys,
        n
      );
    } else {
      result.success = false;
      result.error = new Error();
    }
  }
  return result;
};

const getWordList = (numWords, maxWordLength = 6) => {
  const maxWords = Object.keys(masterDictionary).reduce((a, c) => {
    return Math.max(masterDictionary[c].length, a);
  }, 0);

  const wordCount = Math.min(numWords, maxWords);
  const letterFrequencies = getLetterValues(
    getCharacterFrequencies(Object.keys(masterDictionary))
  );

  const filteredDictionary = Object.keys(masterDictionary).reduce(
    (acc, curr) => {
      const filtered = masterDictionary[curr].filter(
        word => word.length <= maxWordLength
      );
      return filtered.length >= wordCount ? { ...acc, [curr]: filtered } : acc;
    },
    {}
  );

  const matchingKeyLengths = Object.keys(filteredDictionary).filter(
    k => masterDictionary[k].length >= wordCount
  );

  const randomKey =
    matchingKeyLengths[Math.floor(Math.random() * matchingKeyLengths.length)];

  const words = initializeArrayWithSeed(masterDictionary[randomKey], wordCount);
  const key = randomKey
    .split("")
    .map((k, i) => ({ letter: k, id: i, value: letterFrequencies[k].value }));

  return {
    success: true,
    words,
    key
  };
  // return generateWordList(
  //   numWords,
  //   maxWordLength,
  //   wordLists,
  //   letterFrequencies,
  //   wordFrequencies,
  //   keys,
  //   1e2
  // );
};

module.exports = { getWordList };
