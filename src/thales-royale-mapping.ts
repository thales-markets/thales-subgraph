import {
  SignedUp as SignedUpEvent,
  TookAPosition as TookAPositionEvent,
  RoyaleStarted as RoyaleStartedEvent,
  RoundClosed as RoundClosedEvent,
  ThalesRoyale,
} from '../generated/ThalesRoyale/ThalesRoyale';
import { ThalesRoyaleGame, ThalesRoyalePlayer, ThalesRoyalePosition } from '../generated/schema';

export function handleSignedUp(event: SignedUpEvent): void {
  let thalesRoyaleGame = ThalesRoyaleGame.load(event.address.toHex());
  if (thalesRoyaleGame === null) {
    thalesRoyaleGame = new ThalesRoyaleGame(event.address.toHex());
    thalesRoyaleGame.timestamp = event.block.timestamp;
    thalesRoyaleGame.address = event.address;
    thalesRoyaleGame.save();
  }

  let thalesRoyalePlayer = new ThalesRoyalePlayer(event.params.user.toHex());
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
}

export function handleRoundClosed(event: RoundClosedEvent): void {
  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  let allPlayers = thalesRoyaleContract.getPlayers();

  for (let index = 0; index < allPlayers.length; index++) {
    const player = allPlayers[index];
    let thalesRoyalePlayer = ThalesRoyalePlayer.load(player.toHex());
    let thalesRoyalePosition = ThalesRoyalePosition.load(
      event.address.toHex() + '-' + player.toHex() + '-' + event.params.round.toString(),
    );
    if (thalesRoyalePosition === null || thalesRoyalePosition.position.notEqual(event.params.result)) {
      thalesRoyalePlayer.isAlive = false;
      thalesRoyalePlayer.timestamp = event.block.timestamp;
      thalesRoyalePlayer.save();
    }
  }
}
