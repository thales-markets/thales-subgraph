import { Mint, ResultForGameAdded, UpdateBracketsForAlreadyMintedItem } from '../generated/MarchMadness/MarchMadness';
import { Token, Game } from '../generated/schema';

export function handleMint(event: Mint): void {
  let brackets = new Token(`${event.params._recipient.toHexString()}-${event.params._id}`);

  brackets.createdHash = event.transaction.hash;
  brackets.minter = event.params._recipient;
  brackets.itemId = event.params._id;
  brackets.brackets = event.params._brackets;

  brackets.createdAt = event.block.timestamp;

  brackets.save();
}

export function handleBracketsUpdate(event: UpdateBracketsForAlreadyMintedItem): void {
  let brackets = Token.load(`${event.params._minter.toHexString()}-${event.params.itemIndex}`);

  if (brackets !== null) {
    brackets.brackets = event.params._newBrackets;
    brackets.lastUpdateHash = event.transaction.hash;
    brackets.updatedAt = event.block.timestamp;

    brackets.save();
  }
}

export function handleResultForGameAdded(event: ResultForGameAdded): void {
  let game = Game.load(event.params._gameIndex.toHexString());

  if (game == null) {
    game = new Game(event.params._gameIndex.toHexString());
  }

  game.gameId = event.params._gameIndex;
  game.winnerTeamId = event.params._teamId;
  game.timestamp = event.block.timestamp;

  game.save();
}
