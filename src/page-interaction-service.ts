import { ElementHandle, Page } from "playwright";
import { GameTile, GameTileEvaluation, KnownGoodLetter, KnownLetters, Letter } from "./types";

const typeWord = (page: Page) => async (word: string) => {
    const board = page.locator("#board");
    [...word].forEach(async letter => {
        await board.press(letter);
    });
    await board.press("Enter");
}
const collectResults = (page: Page) => async () => {
    const gameTiles = await page.$$("#board game-tile");
    const gameRows: ElementHandle<SVGElement | HTMLElement>[][] = [];
    while (gameTiles.length) gameRows.push(gameTiles.splice(0, 5));
    return await Promise.all(gameRows.map(async row => {
        return await Promise.all(row.map(async (tile, idx) => {
            const gameTile: GameTile = {
                letter: await tile.getAttribute("letter") as (Letter | null),
                evaluation: await tile.getAttribute("evaluation") as GameTileEvaluation,
                revealed: (await tile.getAttribute("reveal")) == '',
                position: idx
            }
            return gameTile;
        }));
    }));
}

const isWordInvalid = (page: Page) => async () => {
    const rows = await page.$$("#board game-row");
    const rowsInvalid = await Promise.all(rows
        .map(async x=> await x.getAttribute('invalid') == ''));
    
    return rowsInvalid.reduce((prev,cur) => prev || cur, false);
        
}

const formatResultsAsKnownLetters = (gameTiles: GameTile[][]) => {
    const flatGameTiles = gameTiles.flat().filter(x => x.letter != null);
    const uniqueGameTiles: GameTile[] = [];
    flatGameTiles.forEach(tile => {
        const gameTileIdx = uniqueGameTiles.findIndex(x => x.letter == tile.letter);
        if (gameTileIdx == -1) {
            uniqueGameTiles.push(tile);
            return;
        }
        if (tile.evaluation == 'correct') {
            uniqueGameTiles[gameTileIdx] = tile;
            return;
        }
    });

    const result: KnownLetters = {
        knownBadLetters: uniqueGameTiles
            .filter(x => x.evaluation == 'absent')
            .map(x => x.letter as Letter),
        knownGoodLetters: uniqueGameTiles
            .filter(x => x.evaluation != 'absent')
            .map(x => {
                const goodLetter: KnownGoodLetter = {
                    letter: x.letter as Letter,
                    position: x.evaluation == 'correct' ? x.position : null,
                }
                return goodLetter;
            })
    }
    return result;
}

const backspaceWord = (page: Page) => async () => {
    const board = page.locator("#board");
    for(let i = 0; i< 5; i++){
        await board.press('Backspace');
    }
}

const create = (page: Page) => {
    return {
        typeWord: typeWord(page),
        collectResults: collectResults(page),
        formatResultsAsKnownLetters,
        backspaceWord: backspaceWord(page),
        isWordInvalid: isWordInvalid(page)
    }
}
export default { create }