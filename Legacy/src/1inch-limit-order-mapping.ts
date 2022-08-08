/* eslint-disable no-empty */
import { Bytes, ethereum } from '@graphprotocol/graph-ts';
import { OrderFilled } from '../generated/LimitOrderProtocol/LimitOrderProtocol';
import { BinaryOption, Trade } from '../generated/schema';

// position of data in encoded input data of fillOrder transaction
// example file 1inch_fillOrder_encoded_input_data_example.txt
let MAKING_AMOUNT_POINTER = 2 * 32;
let TAKING_AMOUNT_POINTER = 4 * 32;
let MAKER_TOKEN_POINTER = 6 * 32;
let TAKER_TOKEN_POINTER = 7 * 32;
let MAKER_POINTER = 16 * 32 + 4;

export function handleOrderFilledEvent(event: OrderFilled): void {
  // Skip the selector
  let dataWithoutFunctionSelector = event.transaction.input.subarray(4);

  let makerAmount = ethereum
    .decode('uint256', dataWithoutFunctionSelector.subarray(MAKING_AMOUNT_POINTER) as Bytes)
    .toBigInt();
  let takerAmount = ethereum
    .decode('uint256', dataWithoutFunctionSelector.subarray(TAKING_AMOUNT_POINTER) as Bytes)
    .toBigInt();
  let makerToken = ethereum
    .decode('address', dataWithoutFunctionSelector.subarray(MAKER_TOKEN_POINTER) as Bytes)
    .toAddress();
  let takerToken = ethereum
    .decode('address', dataWithoutFunctionSelector.subarray(TAKER_TOKEN_POINTER) as Bytes)
    .toAddress();
  let maker = ethereum.decode('address', dataWithoutFunctionSelector.subarray(MAKER_POINTER) as Bytes).toAddress();

  let trade = new Trade(
    event.transaction.hash.toHexString() + '-' + event.params.orderHash.toHex() + '-' + event.logIndex.toString(),
  );
  trade.transactionHash = event.transaction.hash;
  trade.timestamp = event.block.timestamp;
  trade.blockNumber = event.block.number;
  trade.orderHash = event.params.orderHash;
  trade.maker = maker;
  trade.taker = event.transaction.from;
  trade.makerToken = makerToken;
  trade.takerToken = takerToken;
  trade.makerAmount = makerAmount;
  trade.takerAmount = takerAmount;

  let makerEntity = BinaryOption.load(makerToken.toHex());
  if (makerEntity !== null) {
    trade.market = makerEntity.market;
    trade.optionSide = makerEntity.side;
    trade.orderSide = 'buy';
    trade.save();
  } else {
    let takerEntity = BinaryOption.load(takerToken.toHex());
    if (takerEntity !== null) {
      trade.market = takerEntity.market;
      trade.optionSide = takerEntity.side;
      trade.orderSide = 'sell';
      trade.save();
    }
  }
}
