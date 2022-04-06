import {
  SignedUp as SignedUpEvent,
  SignedUpPassport as SignedUpPassportEvent,
  TookAPosition as TookAPositionEvent,
  TookAPositionPassport as TookAPositionPassportEvent,
  RoyaleStarted as RoyaleStartedEvent,
  RoundClosed as RoundClosedEvent,
  NewSeasonStarted as NewSeasonStartedEvent,
  RewardClaimed as RewardClaimedEvent,
  ThalesRoyale,
} from '../generated/ThalesRoyale/ThalesRoyale';
import {
  ThalesRoyaleSeason,
  ThalesRoyalePlayer,
  ThalesRoyalePassportPlayer,
  ThalesRoyalePosition,
  ThalesRoyalePassportPosition,
  ThalesRoyaleRound,
} from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleSignedUp(event: SignedUpEvent): void {
  let thalesRoyaleSeason = ThalesRoyaleSeason.load(event.params.season.toHex());
  if (thalesRoyaleSeason === null) {
    thalesRoyaleSeason = new ThalesRoyaleSeason(event.params.season.toHex());
    thalesRoyaleSeason.timestamp = event.block.timestamp;
    thalesRoyaleSeason.season = event.params.season;
    thalesRoyaleSeason.save();
  }

  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  let players = thalesRoyaleContract.getPlayersForSeason(event.params.season);

  let thalesRoyalePlayer = new ThalesRoyalePlayer(event.params.season.toHex() + '-' + event.params.user.toHex());
  thalesRoyalePlayer.address = event.params.user;
  thalesRoyalePlayer.season = event.params.season;
  thalesRoyalePlayer.isAlive = true;
  thalesRoyalePlayer.number = BigInt.fromI32(players.length);
  thalesRoyalePlayer.timestamp = event.block.timestamp;
  thalesRoyalePlayer.save();
}

export function handleSignedUpPassport(event: SignedUpPassportEvent): void {
  let thalesRoyaleSeason = ThalesRoyaleSeason.load(event.params.season.toHex());
  if (thalesRoyaleSeason === null) {
    thalesRoyaleSeason = new ThalesRoyaleSeason(event.params.season.toHex());
    thalesRoyaleSeason.timestamp = event.block.timestamp;
    thalesRoyaleSeason.season = event.params.season;
    thalesRoyaleSeason.save();
  }

  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  let players = thalesRoyaleContract.getTokensForSeason(event.params.season);

  let thalesRoyalePassportPlayer = new ThalesRoyalePassportPlayer(event.params.tokenId.toHex());
  thalesRoyalePassportPlayer.timestamp = event.block.timestamp;
  thalesRoyalePassportPlayer.owner = event.params.user;
  thalesRoyalePassportPlayer.season = event.params.season;
  thalesRoyalePassportPlayer.isAlive = true;
  thalesRoyalePassportPlayer.number = BigInt.fromI32(players.length);
  let positions = [];
  event.params.positions.forEach((position: BigInt) => positions.push(position.toHex()));
  thalesRoyalePassportPlayer.defaultPositions = positions;
  thalesRoyalePassportPlayer.save();
}

export function handleSignedUpWithPosition(event: SignedUpEvent): void {
  let thalesRoyaleSeason = ThalesRoyaleSeason.load(event.params.season.toHex());
  if (thalesRoyaleSeason === null) {
    thalesRoyaleSeason = new ThalesRoyaleSeason(event.params.season.toHex());
    thalesRoyaleSeason.timestamp = event.block.timestamp;
    thalesRoyaleSeason.season = event.params.season;
    thalesRoyaleSeason.save();
  }

  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  let players = thalesRoyaleContract.getPlayersForSeason(event.params.season);

  let thalesRoyalePlayer = new ThalesRoyalePlayer(event.params.season.toHex() + '-' + event.params.user.toHex());
  thalesRoyalePlayer.timestamp = event.block.timestamp;
  thalesRoyalePlayer.address = event.params.user;
  thalesRoyalePlayer.season = event.params.season;
  thalesRoyalePlayer.isAlive = true;
  thalesRoyalePlayer.number = BigInt.fromI32(players.length);
  if (event.params.position.notEqual(BigInt.fromI32(0))) {
    thalesRoyalePlayer.defaultPosition = event.params.position;
  }
  thalesRoyalePlayer.save();
}

export function handleTookAPosition(event: TookAPositionEvent): void {
  let thalesRoyalePosition = ThalesRoyalePosition.load(
    event.params.season.toHex() + '-' + event.params.user.toHex() + '-' + event.params.round.toString(),
  );
  if (thalesRoyalePosition === null) {
    thalesRoyalePosition = new ThalesRoyalePosition(
      event.params.season.toHex() + '-' + event.params.user.toHex() + '-' + event.params.round.toString(),
    );
    thalesRoyalePosition.season = event.params.season;
    thalesRoyalePosition.player = event.params.user;
    thalesRoyalePosition.round = event.params.round;
  }
  thalesRoyalePosition.timestamp = event.block.timestamp;
  thalesRoyalePosition.position = event.params.position;
  thalesRoyalePosition.save();
}

export function handleTookAPositionPassport(event: TookAPositionPassportEvent): void {
  let thalesRoyalePosition = ThalesRoyalePassportPosition.load(
    event.params.season.toHex() + '-' + event.params.tokenId.toHex() + '-' + event.params.round.toString(),
  );
  if (thalesRoyalePosition === null) {
    thalesRoyalePosition = new ThalesRoyalePassportPosition(
      event.params.season.toHex() + '-' + event.params.tokenId.toHex() + '-' + event.params.round.toString(),
    );
    thalesRoyalePosition.season = event.params.season;
    thalesRoyalePosition.tokenPlayer = event.params.tokenId;
    thalesRoyalePosition.round = event.params.round;
  }
  thalesRoyalePosition.timestamp = event.block.timestamp;
  thalesRoyalePosition.position = event.params.position;
  thalesRoyalePosition.save();
}

export function handleRoyaleStartedOPKovan(event: RoyaleStartedEvent): void {
  let thalesRoyaleSeason = ThalesRoyaleSeason.load(event.params.season.toHex());
  if (thalesRoyaleSeason === null) {
    thalesRoyaleSeason = new ThalesRoyaleSeason(event.params.season.toHex());
    thalesRoyaleSeason.timestamp = event.block.timestamp;
    thalesRoyaleSeason.season = event.params.season;
    thalesRoyaleSeason.save();
  }

  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  let tokenPlayers = thalesRoyaleContract.getTokensForSeason(event.params.season);

  let thalesRoyaleRound = new ThalesRoyaleRound(event.params.season.toHex() + '-' + BigInt.fromI32(1).toHex());
  thalesRoyaleRound.season = event.params.season;
  thalesRoyaleRound.round = BigInt.fromI32(1);
  thalesRoyaleRound.timestamp = event.block.timestamp;
  thalesRoyaleRound.totalPlayersPerRoundPerSeason = BigInt.fromI32(tokenPlayers.length);
  thalesRoyaleRound.eliminatedPerRoundPerSeason = BigInt.fromI32(0);
  thalesRoyaleRound.save();
}

export function handleRoyaleStartedOPMainnet(event: RoyaleStartedEvent): void {
  let thalesRoyaleSeason = ThalesRoyaleSeason.load(event.params.season.toHex());
  if (thalesRoyaleSeason === null) {
    thalesRoyaleSeason = new ThalesRoyaleSeason(event.params.season.toHex());
    thalesRoyaleSeason.timestamp = event.block.timestamp;
    thalesRoyaleSeason.season = event.params.season;
    thalesRoyaleSeason.save();
  }

  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  let tokenPlayers: any[];
  if (event.params.season.gt(BigInt.fromI32(6))) {
    tokenPlayers = thalesRoyaleContract.getTokensForSeason(event.params.season);
  } else {
    tokenPlayers = thalesRoyaleContract.getPlayersForSeason(event.params.season);
  }
  let thalesRoyaleRound = new ThalesRoyaleRound(event.params.season.toHex() + '-' + BigInt.fromI32(1).toHex());
  thalesRoyaleRound.season = event.params.season;
  thalesRoyaleRound.round = BigInt.fromI32(1);
  thalesRoyaleRound.timestamp = event.block.timestamp;
  thalesRoyaleRound.totalPlayersPerRoundPerSeason = BigInt.fromI32(tokenPlayers.length);
  thalesRoyaleRound.eliminatedPerRoundPerSeason = BigInt.fromI32(0);
  thalesRoyaleRound.save();
}

export function handleRoundClosedOPKovan(event: RoundClosedEvent): void {
  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  let players = thalesRoyaleContract.getTokensForSeason(event.params.season);

  for (let index = 0; index < players.length; index++) {
    let player = players[index];
    let thalesRoyalePassportPlayer = ThalesRoyalePassportPlayer.load(player.toHex());
    let thalesRoyalePassportPosition = ThalesRoyalePassportPosition.load(
      event.params.season.toHex() + '-' + player.toHex() + '-' + event.params.round.toString(),
    );
    if (
      (thalesRoyalePassportPosition === null || thalesRoyalePassportPosition.position.notEqual(event.params.result)) &&
      thalesRoyalePassportPlayer.isAlive
    ) {
      thalesRoyalePassportPlayer.isAlive = false;
      thalesRoyalePassportPlayer.deathRound = event.params.round;
      thalesRoyalePassportPlayer.timestamp = event.block.timestamp;
      thalesRoyalePassportPlayer.save();

      let thalesRoyaleRound = ThalesRoyaleRound.load(event.params.season.toHex() + '-' + event.params.round.toHex());
      if (thalesRoyaleRound !== null) {
        thalesRoyaleRound.eliminatedPerRoundPerSeason = thalesRoyaleRound.eliminatedPerRoundPerSeason.plus(
          BigInt.fromI32(1),
        );
        thalesRoyaleRound.timestamp = event.block.timestamp;
        thalesRoyaleRound.save();
      }
    }
  }

  let nextRound = event.params.round.plus(BigInt.fromI32(1));
  let thalesRoyaleLastRound = ThalesRoyaleRound.load(event.params.season.toHex() + '-' + event.params.round.toHex());
  thalesRoyaleLastRound.strikePrice = event.params.strikePrice;
  thalesRoyaleLastRound.finalPrice = event.params.finalPrice;
  thalesRoyaleLastRound.result = event.params.result;
  thalesRoyaleLastRound.save();
  let nextRoundTotalPlayers = thalesRoyaleLastRound.totalPlayersPerRoundPerSeason.minus(
    thalesRoyaleLastRound.eliminatedPerRoundPerSeason,
  );

  let nextThalesRoyaleRound = new ThalesRoyaleRound(event.params.season.toHex() + '-' + nextRound.toHex());
  nextThalesRoyaleRound.season = event.params.season;
  nextThalesRoyaleRound.round = nextRound;
  nextThalesRoyaleRound.timestamp = event.block.timestamp;
  nextThalesRoyaleRound.totalPlayersPerRoundPerSeason = nextRoundTotalPlayers;
  nextThalesRoyaleRound.eliminatedPerRoundPerSeason = BigInt.fromI32(0);
  nextThalesRoyaleRound.save();
}

export function handleRoundClosedOPMainnet(event: RoundClosedEvent): void {
  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  if (event.params.season.gt(BigInt.fromI32(6))) {
    let tokenPlayers = thalesRoyaleContract.getTokensForSeason(event.params.season);

    for (let index = 0; index < tokenPlayers.length; index++) {
      let player = tokenPlayers[index];
      let thalesRoyalePassportPlayer = ThalesRoyalePassportPlayer.load(player.toHex());
      let thalesRoyalePassportPosition = ThalesRoyalePassportPosition.load(
        event.params.season.toHex() + '-' + player.toHex() + '-' + event.params.round.toString(),
      );
      if (
        (thalesRoyalePassportPosition === null ||
          thalesRoyalePassportPosition.position.notEqual(event.params.result)) &&
        thalesRoyalePassportPlayer.isAlive
      ) {
        thalesRoyalePassportPlayer.isAlive = false;
        thalesRoyalePassportPlayer.deathRound = event.params.round;
        thalesRoyalePassportPlayer.timestamp = event.block.timestamp;
        thalesRoyalePassportPlayer.save();

        let thalesRoyaleRound = ThalesRoyaleRound.load(event.params.season.toHex() + '-' + event.params.round.toHex());
        if (thalesRoyaleRound !== null) {
          thalesRoyaleRound.eliminatedPerRoundPerSeason = thalesRoyaleRound.eliminatedPerRoundPerSeason.plus(
            BigInt.fromI32(1),
          );
          thalesRoyaleRound.timestamp = event.block.timestamp;
          thalesRoyaleRound.save();
        }
      }
    }
  } else {
    let players = thalesRoyaleContract.getPlayersForSeason(event.params.season);

    for (let index = 0; index < players.length; index++) {
      let player = players[index];
      let thalesRoyalePlayer = ThalesRoyalePlayer.load(event.params.season.toHex() + '-' + player.toHex());
      let thalesRoyalePosition = ThalesRoyalePosition.load(
        event.params.season.toHex() + '-' + player.toHex() + '-' + event.params.round.toString(),
      );
      if (
        (thalesRoyalePosition === null || thalesRoyalePosition.position.notEqual(event.params.result)) &&
        thalesRoyalePlayer.isAlive
      ) {
        thalesRoyalePlayer.isAlive = false;
        thalesRoyalePlayer.deathRound = event.params.round;
        thalesRoyalePlayer.timestamp = event.block.timestamp;
        thalesRoyalePlayer.save();

        let thalesRoyaleRound = ThalesRoyaleRound.load(event.params.season.toHex() + '-' + event.params.round.toHex());
        if (thalesRoyaleRound !== null) {
          thalesRoyaleRound.eliminatedPerRoundPerSeason = thalesRoyaleRound.eliminatedPerRoundPerSeason.plus(
            BigInt.fromI32(1),
          );
          thalesRoyaleRound.timestamp = event.block.timestamp;
          thalesRoyaleRound.save();
        }
      }
    }
  }

  let nextRound = event.params.round.plus(BigInt.fromI32(1));
  let thalesRoyaleLastRound = ThalesRoyaleRound.load(event.params.season.toHex() + '-' + event.params.round.toHex());
  thalesRoyaleLastRound.strikePrice = event.params.strikePrice;
  thalesRoyaleLastRound.finalPrice = event.params.finalPrice;
  thalesRoyaleLastRound.result = event.params.result;
  thalesRoyaleLastRound.save();
  let nextRoundTotalPlayers = thalesRoyaleLastRound.totalPlayersPerRoundPerSeason.minus(
    thalesRoyaleLastRound.eliminatedPerRoundPerSeason,
  );

  let nextThalesRoyaleRound = new ThalesRoyaleRound(event.params.season.toHex() + '-' + nextRound.toHex());
  nextThalesRoyaleRound.season = event.params.season;
  nextThalesRoyaleRound.round = nextRound;
  nextThalesRoyaleRound.timestamp = event.block.timestamp;
  nextThalesRoyaleRound.totalPlayersPerRoundPerSeason = nextRoundTotalPlayers;
  nextThalesRoyaleRound.eliminatedPerRoundPerSeason = BigInt.fromI32(0);
  nextThalesRoyaleRound.save();
}
