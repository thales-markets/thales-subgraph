import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  NewThalesRoyaleAddress,
  NewTokenUri,
  OwnershipTransferred,
  ThalesRoyalePassPaused,
  Transfer
} from "../generated/ThalesRoyalePass/ThalesRoyalePass"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createNewThalesRoyaleAddressEvent(
  _thalesRoyaleAddress: Address
): NewThalesRoyaleAddress {
  let newThalesRoyaleAddressEvent = changetype<NewThalesRoyaleAddress>(
    newMockEvent()
  )

  newThalesRoyaleAddressEvent.parameters = new Array()

  newThalesRoyaleAddressEvent.parameters.push(
    new ethereum.EventParam(
      "_thalesRoyaleAddress",
      ethereum.Value.fromAddress(_thalesRoyaleAddress)
    )
  )

  return newThalesRoyaleAddressEvent
}

export function createNewTokenUriEvent(_tokenURI: string): NewTokenUri {
  let newTokenUriEvent = changetype<NewTokenUri>(newMockEvent())

  newTokenUriEvent.parameters = new Array()

  newTokenUriEvent.parameters.push(
    new ethereum.EventParam("_tokenURI", ethereum.Value.fromString(_tokenURI))
  )

  return newTokenUriEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createThalesRoyalePassPausedEvent(
  _state: boolean
): ThalesRoyalePassPaused {
  let thalesRoyalePassPausedEvent = changetype<ThalesRoyalePassPaused>(
    newMockEvent()
  )

  thalesRoyalePassPausedEvent.parameters = new Array()

  thalesRoyalePassPausedEvent.parameters.push(
    new ethereum.EventParam("_state", ethereum.Value.fromBoolean(_state))
  )

  return thalesRoyalePassPausedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}
