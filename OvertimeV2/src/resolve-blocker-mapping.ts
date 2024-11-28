/* eslint-disable no-empty */
import { GamesBlockedForResolution, GamesUnblockedForResolution } from '../generated/ResolveBlocker/ResolveBlocker';
import { BlockedGame } from '../generated/schema';

export function handleGameBlocked(event: GamesBlockedForResolution): void {
  for (let i = 0; i < event.params.gameIds.length; i++) {
    const gameId = event.params.gameIds[i];
    let blockedGame = BlockedGame.load(gameId.toHexString());
    if (blockedGame === null) {
      blockedGame = new BlockedGame(gameId.toHexString());
    }
    blockedGame.timestamp = event.block.timestamp;
    blockedGame.hash = event.transaction.hash;
    blockedGame.gameId = gameId;
    blockedGame.reason = event.params.reason;
    blockedGame.isUnblocked = false;
    blockedGame.save();
  }
}

export function handleGameUnblocked(event: GamesUnblockedForResolution): void {
  for (let i = 0; i < event.params.gameIds.length; i++) {
    const gameId = event.params.gameIds[i];
    let blockedGame = BlockedGame.load(gameId.toHexString());
    if (blockedGame !== null) {
      blockedGame.timestamp = event.block.timestamp;
      blockedGame.hash = event.transaction.hash;
      blockedGame.gameId = gameId;
      blockedGame.isUnblocked = true;
      blockedGame.unblockedBy = event.transaction.from;
      blockedGame.save();
    }
  }
}
