import playwright, { ElementHandle } from "playwright";
import { GameTile, GameTileEvaluation, KnownGoodLetter, Letter, KnownLetters } from "./src/types";
import WordService from "./src/word-service";
import PageInteractionService from './src/page-interaction-service';
import InvalidWordService from './src/invalid-word-service'

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}


const containsCorrectAnswer = (results: GameTile[][]) => {
  return results
    .map(x=>x
      .map(x=>x.evaluation == 'correct')
      .reduce((prev, cur) => prev && cur, true))
    .reduce((prev, cur) => prev || cur, false);
      
}

const isGameOver = (results: GameTile[][]) => {
  return results
    .every(row=> row.every(tile => tile.revealed));
}

async function main() {
  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 500
  });
  const page = await browser.newPage();

  await page.goto('https://www.nytimes.com/games/wordle/index.html');
  await page.click('.close-icon');

  const pageInteractionService = PageInteractionService.create(page);
  const invalidWordService = InvalidWordService.create();
  const wordService = WordService.create(invalidWordService);

  let knownLetters: KnownLetters = {
    knownBadLetters: [],
    knownGoodLetters: []
  }
  let gameOver = false;
  while(!gameOver){
    const mostLikelyWord = wordService.getMostLikelyWord(knownLetters);
    console.log(mostLikelyWord);
    await delay(1500);
    await pageInteractionService.typeWord(mostLikelyWord);
    const wordIsInvalid = await pageInteractionService.isWordInvalid();
    if(wordIsInvalid){
      await pageInteractionService.backspaceWord();
      invalidWordService.setInvalidWord(mostLikelyWord);
    }
    
    const results = await pageInteractionService.collectResults();
    const correct = containsCorrectAnswer(results);
    gameOver = isGameOver(results);

    if(correct){
      console.log(`correct answer: ${mostLikelyWord}`);
      break;
    }

    knownLetters = pageInteractionService.formatResultsAsKnownLetters(results);
    console.log(results);
    console.log("---");
  }
  if(gameOver){
    console.log("game over");
  }

  await browser.close();
}
main();
