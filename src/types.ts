export type Letter = "a"| "b"| "c"| "d"| "e"| "f"| "g"| "h"| "i"| "j"| "k"| "l"| "m"| "n"| "o"| "p"| "q"| "r"| "s"| "t"| "u"| "v"| "w"| "x"| "y"| "z";


export type KnownGoodLetter = {
    letter: Letter,
    position: number,
    correctPosition: boolean
}

export type KnownBadLetter = Letter;

export type WordWithScore = {
    word: string,
    score: number
}

export type GameTileEvaluation = "absent" | "present" | "correct" | null;

export type GameTile = {
    letter: Letter | null
    evaluation: GameTileEvaluation, 
    position: number,
    revealed: boolean
}

export type KnownLetters = {
    knownGoodLetters: KnownGoodLetter[]
    knownBadLetters: KnownBadLetter[]
}