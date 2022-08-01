import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  ThalesRoyalePassportAdminChanged,
  ThalesRoyalePassportBeaconUpgraded,
  ThalesRoyalePassportUpgraded
} from "../generated/ThalesRoyalePassport/ThalesRoyalePassport"

export function createThalesRoyalePassportAdminChangedEvent(
  previousAdmin: Address,
  newAdmin: Address
): ThalesRoyalePassportAdminChanged {
  let thalesRoyalePassportAdminChangedEvent = changetype<
    ThalesRoyalePassportAdminChanged
  >(newMockEvent())

  thalesRoyalePassportAdminChangedEvent.parameters = new Array()

  thalesRoyalePassportAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdmin",
      ethereum.Value.fromAddress(previousAdmin)
    )
  )
  thalesRoyalePassportAdminChangedEvent.parameters.push(
    new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin))
  )

  return thalesRoyalePassportAdminChangedEvent
}

export function createThalesRoyalePassportBeaconUpgradedEvent(
  beacon: Address
): ThalesRoyalePassportBeaconUpgraded {
  let thalesRoyalePassportBeaconUpgradedEvent = changetype<
    ThalesRoyalePassportBeaconUpgraded
  >(newMockEvent())

  thalesRoyalePassportBeaconUpgradedEvent.parameters = new Array()

  thalesRoyalePassportBeaconUpgradedEvent.parameters.push(
    new ethereum.EventParam("beacon", ethereum.Value.fromAddress(beacon))
  )

  return thalesRoyalePassportBeaconUpgradedEvent
}

export function createThalesRoyalePassportUpgradedEvent(
  implementation: Address
): ThalesRoyalePassportUpgraded {
  let thalesRoyalePassportUpgradedEvent = changetype<
    ThalesRoyalePassportUpgraded
  >(newMockEvent())

  thalesRoyalePassportUpgradedEvent.parameters = new Array()

  thalesRoyalePassportUpgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )

  return thalesRoyalePassportUpgradedEvent
}
