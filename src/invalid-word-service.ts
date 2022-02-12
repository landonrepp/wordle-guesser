import fs from "fs";

let invalidWords:string[] = [];

const invalidWordFilePath = "./invalid-words.json";

export type InvalidWordService = {
    checkIsInvalidWord: ReturnType<typeof checkIsInvalidWord>,
    setInvalidWord: ReturnType<typeof setInvalidWord>
}

const getInvalidWords = () => {
    const invalidWordData = fs.readFileSync(invalidWordFilePath, {encoding:'utf8', flag:'r'});
    invalidWords = JSON.parse(invalidWordData) as string[];

    return invalidWords;
}

getInvalidWords();

const checkIsInvalidWord = () => (word: string) => {
    return invalidWords.findIndex(x=>x ==word) > -1;
}

const setInvalidWord = () => (word: string) => {
    invalidWords.push(word);
    fs.writeFileSync(invalidWordFilePath, JSON.stringify(invalidWords));
}

const create = () => {
    const service: InvalidWordService = {
        setInvalidWord: setInvalidWord(),
        checkIsInvalidWord: checkIsInvalidWord()
    };

    return service;
}

export default {
    create
}