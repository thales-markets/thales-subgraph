import { SportMarket } from '../../generated/schema';
import { BigInt, Bytes } from '@graphprotocol/graph-ts';

export const getPositionAddressFromPositionIndex = (position: BigInt, sportMarket: SportMarket): Bytes | null => {
  if (position.equals(BigInt.fromI32(0))) return sportMarket.upAddress;
  if (position.equals(BigInt.fromI32(1))) return sportMarket.downAddress;
  if (position.equals(BigInt.fromI32(2))) return sportMarket.drawAddress;
  return null;
};
