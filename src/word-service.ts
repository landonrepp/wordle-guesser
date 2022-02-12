import { InvalidWordService } from './invalid-word-service';
import { KnownBadLetter, Letter, KnownLetters, WordWithScore, KnownGoodLetter } from './types';
import { words } from './words';

const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].map(x=>x.toLowerCase());

const getLetterFrequency = () => {
    const normalizeFrequency = (frequency: any) => {
        let totalFrequency = 0;
        const normalFrequency = {};
    
        const keys = Object.keys(frequency);
        for(let i = 0; i < keys.length; i++) {
            totalFrequency += frequency[keys[i]];
        }
        for(let i = 0; i < keys.length; i++) {
            normalFrequency[keys[i]] = frequency[keys[i]]/totalFrequency;
        }
    
        return normalFrequency;
    }

    const letterFrequency = {};
    letters.forEach(letter=> letterFrequency[letter] = 0);
    words.forEach(x=>{
        [...x].forEach(letter => {
            letterFrequency[letter] = letterFrequency[letter] + 1;
        });
    });
    return normalizeFrequency(letterFrequency);
}

const lettersByFrequency = getLetterFrequency();

const getUniqueLetters = (str) => {
    let uniq = "";
     
    for(let i = 0; i < str.length; i++){
      if(uniq.includes(str[i]) === false){
        uniq += str[i]
      }
    }
    return [...uniq] as Letter[];
  }

const scoreWord = (knownGoodLetters: KnownGoodLetter[], knownBadLetters: KnownBadLetter[]) => 
    (word: string) => {
        let result = 0;
        const letters = getUniqueLetters(word);

        // if the word contains bad letters, it's worthless
        knownBadLetters.forEach(badLetter => {
            
        });
        for(let i = 0; i < knownBadLetters.length; i++){
            if(letters.findIndex(x=>x == knownBadLetters[i]) > -1)
                return -100;
        }
        
        for(let i = 0; i < knownGoodLetters.length; i++) {
            const goodLetter = knownGoodLetters[i];
            //if the word doesn't match perfect letters, it's worthless
            if(goodLetter.position != null && word[goodLetter.position] != goodLetter.letter)
                return -100;
            // if the word doesn't contain good letter, it's worthless
            if(goodLetter.position == null && letters.indexOf(goodLetter.letter) == -1)
                return -100;
        }

        return letters
            .map(x=>lettersByFrequency[x] as number)
            .reduce((prev, cur)=> prev + cur, 0);
    }

const getAllWordsWithScores = (knownLetters: KnownLetters) => {
    const getWordScore = scoreWord(knownLetters.knownGoodLetters, knownLetters.knownBadLetters);

    return words.map(x=>{
        return {
            word: x,
            score: getWordScore(x)
        } as WordWithScore;
    });
}

export const getMostLikelyWord = (invalidWordService: InvalidWordService) => (knownLetters: KnownLetters) => {
    const wordsWithScores = getAllWordsWithScores(knownLetters);

    return wordsWithScores
        .filter(x=> !invalidWordService.checkIsInvalidWord(x.word))
        .reduce((prev,cur) => prev.score > cur.score ? prev: cur)
        .word;
}

const create = (invalidWordService: InvalidWordService) => {
    return {
        getMostLikelyWord: getMostLikelyWord(invalidWordService)
    }
}

export default { create }