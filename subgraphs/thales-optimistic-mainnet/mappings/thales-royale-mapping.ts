import {
  SignedUp as SignedUpEvent,
  TookAPosition as TookAPositionEvent,
  RoyaleStarted as RoyaleStartedEvent,
  RoundClosed as RoundClosedEvent,
  NewSeasonStarted as NewSeasonStartedEvent,
  RewardClaimed as RewardClaimedEvent,
  ThalesRoyale,
} from '../../../generated/ThalesRoyale/ThalesRoyale';
import {
  ThalesRoyaleSeason,
  ThalesRoyalePlayer,
  ThalesRoyalePosition,
  ThalesRoyaleRound,
} from '../../../generated/schema';
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

export function handleRoyaleStarted(event: RoyaleStartedEvent): void {
  let thalesRoyaleSeason = ThalesRoyaleSeason.load(event.params.season.toHex());
  if (thalesRoyaleSeason === null) {
    thalesRoyaleSeason = new ThalesRoyaleSeason(event.params.season.toHex());
    thalesRoyaleSeason.timestamp = event.block.timestamp;
    thalesRoyaleSeason.season = event.params.season;
    thalesRoyaleSeason.save();
  }

  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
  let players = thalesRoyaleContract.getPlayersForSeason(event.params.season);

  let thalesRoyaleRound = new ThalesRoyaleRound(event.params.season.toHex() + '-' + BigInt.fromI32(1).toHex());
  thalesRoyaleRound.season = event.params.season;
  thalesRoyaleRound.round = BigInt.fromI32(1);
  thalesRoyaleRound.timestamp = event.block.timestamp;
  thalesRoyaleRound.totalPlayersPerRoundPerSeason = BigInt.fromI32(players.length);
  thalesRoyaleRound.eliminatedPerRoundPerSeason = BigInt.fromI32(0);
  thalesRoyaleRound.save();
}

export function handleRoundClosed(event: RoundClosedEvent): void {
  let thalesRoyaleContract = ThalesRoyale.bind(event.address);
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

// This handler serves only for avoiding problematic season which was caused due to contract changes
// while the season was still running
export function handleRoundClosedForOPKovan(event: RoundClosedEvent): void {
  if (event.params.season.le(BigInt.fromI32(88))) {
    let thalesRoyaleContract = ThalesRoyale.bind(event.address);
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
}
