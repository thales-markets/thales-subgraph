import {
  SignedUp as SignedUpEvent,
  TookAPosition as TookAPositionEvent,
  RoyaleStarted as RoyaleStartedEvent,
  RoundClosed as RoundClosedEvent,
  ThalesRoyale,
} from '../generated/ThalesRoyale/ThalesRoyale';
import { ThalesRoyaleGame, ThalesRoyalePlayer, ThalesRoyalePosition, ThalesRoyaleRound } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleSignedUp(event: SignedUpEvent): void {
  let thalesRoyaleGame = ThalesRoyaleGame.load(event.address.toHex());
  if (thalesRoyaleGame === null) {
    thalesRoyaleGame = new ThalesRoyaleGame(event.address.toHex());
    thalesRoyaleGame.timestamp = event.block.timestamp;
    thalesRoyaleGame.address = event.address;
    thalesRoyaleGame.save();
  }

  let thalesRoyalePlayer = new ThalesRoyalePlayer(event.address.toHex() + '-' + event.params.user.toHex());
  thalesRoyalePlayer.address = event.params.user;
  thalesRoyalePlayer.timestamp = event.block.timestamp;
  thalesRoyalePlayer.game = event.address;
  thalesRoyalePlayer.isAlive = true;
  thalesRoyalePlayer.save();
}

export function handleTookAPosition(event: TookAPositionEvent): void {
  let thalesRoyalePosition = ThalesRoyalePosition.load(
    event.address.toHex() + '-' + event.params.user.toHex() + '-' + event.params.round.toString(),
  );
  if (thalesRoyalePosition === null) {
    thalesRoyalePosition = new ThalesRoyalePosition(
      event.address.toHex() + '-' + event.params.user.toHex() + '-' + event.params.round.toString(),
    );
    thalesRoyalePosition.game = event.address;
    thalesRoyalePosition.player = event.params.user;
    thalesRoyalePosition.round = event.params.round;
  }
  thalesRoyalePosition.timestamp = event.block.timestamp;
  thalesRoyalePosition.position = event.params.position;
  thalesRoyalePosition.save();
}

export function handleRoyaleStarted(event: RoyaleStartedEvent): void {
  let thalesRoyaleGame = ThalesRoyaleGame.load(event.address.toHex());
  if (thalesRoyaleGame === null) {
    thalesRoyaleGame = new ThalesRoyaleGame(event.address.toHex());
    thalesRoyaleGame.timestamp = event.block.timestamp;
    thalesRoyaleGame.address = event.address;
    thalesRoyaleGame.save();
  }

  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  let alivePlayers = thalesRoyaleContract.getAlivePlayers();

  let thalesRoyaleRound = new ThalesRoyaleRound(event.address.toHex() + '-1');
  thalesRoyaleRound.game = event.address;
  thalesRoyaleRound.round = BigInt.fromI32(1);
  thalesRoyaleRound.timestamp = event.block.timestamp;
  thalesRoyaleRound.totalPlayersPerRound = BigInt.fromI32(alivePlayers.length);
  thalesRoyaleRound.eliminatedPerRound = BigInt.fromI32(0);
  thalesRoyaleRound.save();
}

export function handleRoundClosed(event: RoundClosedEvent): void {
  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  let players = thalesRoyaleContract.getPlayers();

  for (let index = 0; index < players.length; index++) {
    let player = players[index];
    let thalesRoyalePlayer = ThalesRoyalePlayer.load(event.address.toHex() + '-' + player.toHex());
    let thalesRoyalePosition = ThalesRoyalePosition.load(
      event.address.toHex() + '-' + player.toHex() + '-' + event.params.round.toString(),
    );
    if (
      (thalesRoyalePosition === null || thalesRoyalePosition.position.notEqual(event.params.result)) &&
      thalesRoyalePlayer.isAlive
    ) {
      thalesRoyalePlayer.isAlive = false;
      thalesRoyalePlayer.deathRound = event.params.round;
      thalesRoyalePlayer.timestamp = event.block.timestamp;
      thalesRoyalePlayer.save();

      let thalesRoyaleRound = ThalesRoyaleRound.load(event.address.toHex() + '-' + event.params.round.toHex());
      thalesRoyaleRound.eliminatedPerRound = thalesRoyaleRound.eliminatedPerRound.plus(BigInt.fromI32(1));
      thalesRoyaleRound.timestamp = event.block.timestamp;
      thalesRoyaleRound.save();
    }
  }

  let alivePlayers = thalesRoyaleContract.getAlivePlayers();
  let nextRound = event.params.round.plus(BigInt.fromI32(1));

  let nextThalesRoyaleRound = new ThalesRoyaleRound(event.address.toHex() + '-' + nextRound.toHex());
  nextThalesRoyaleRound.game = event.address;
  nextThalesRoyaleRound.round = nextRound;
  nextThalesRoyaleRound.timestamp = event.block.timestamp;
  nextThalesRoyaleRound.totalPlayersPerRound = BigInt.fromI32(alivePlayers.length);
  nextThalesRoyaleRound.eliminatedPerRound = BigInt.fromI32(0);
  nextThalesRoyaleRound.save();
}
