import {
  AddedNewItemToCollection,
  CollectionMinted,
  ItemMinted,
  TransferBatch,
  TransferSingle,
} from '../generated/TaleOfThalesNFTs/TaleOfThalesNFTs';
import { Collection, Item, MintTransaction } from '../generated/schema';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ZERO_ADDRESS } from './constants';

export function handleAddedNewItemToCollection(event: AddedNewItemToCollection): void {
  let collection = Collection.load(event.params._collectionIndex.toHexString());
  let item = Item.load(event.params._itemIndex.toHexString());

  if (collection == null) {
    collection = new Collection(event.params._collectionIndex.toHexString());
    collection.created = event.block.timestamp;
    collection.save();
  }

  if (item == null) {
    item = new Item(event.params._itemIndex.toHexString());
    item.collection = collection.id;
    item.type = BigInt.fromI32(event.params._itemType);
    item.created = event.block.timestamp;
    item.save();
  }
}

export function handleItemMint(event: ItemMinted): void {
  let mintTransaction = new MintTransaction(
    `${event.params._minter.toHexString()}-${event.params._itemIndex.toHexString()}`,
  );
  let item = Item.load(event.params._itemIndex.toHexString());

  if (item !== null) {
    mintTransaction.minter = event.params._minter;
    mintTransaction.hash = event.transaction.hash;
    mintTransaction.item = item.id;
    mintTransaction.collection = item.collection;
    mintTransaction.timestamp = event.block.timestamp;
    mintTransaction.save();
  }
}

export function handleCollectionMint(event: CollectionMinted): void {
  let itemsMinted = event.params._items;

  for (let i = 0; i < itemsMinted.length; i++) {
    if (itemsMinted[i] !== BigInt.fromI32(0)) {
      let item = Item.load(itemsMinted[i].toHexString());
      if (item !== null) {
        let mintTransaction = new MintTransaction(
          `${event.params._minter.toHexString()}-${itemsMinted[i].toHexString()}`,
        );
        mintTransaction.minter = event.params._minter;
        mintTransaction.hash = event.transaction.hash;
        mintTransaction.item = item.id;
        mintTransaction.collection = item.collection;
        mintTransaction.timestamp = event.block.timestamp;
        mintTransaction.save();
      }
    }
  }
}

export function handleTransfer(event: TransferSingle): void {
  let mintTransaction = MintTransaction.load(`${event.params.from.toHexString()}-${event.params.id.toHexString()}`);

  if (mintTransaction !== null) {
    mintTransaction.minter = event.params.to;
    mintTransaction.save();
  }
}

export function handleBatchTransfer(event: TransferBatch): void {
  const itemsIndexes = event.params.ids;

  for (let i = 0; i < itemsIndexes.length; i++) {
    let mintTransaction = MintTransaction.load(`${event.params.from.toHexString()}-${itemsIndexes[i].toHexString()}`);
    if (itemsIndexes[i] !== BigInt.fromI32(0) && mintTransaction !== null) {
      mintTransaction.minter = event.params.to;
      mintTransaction.save();
    }
  }
}
