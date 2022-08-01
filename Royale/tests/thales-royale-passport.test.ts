import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { ThalesRoyalePassportAdminChanged } from "../generated/schema"
import { ThalesRoyalePassportAdminChanged as ThalesRoyalePassportAdminChangedEvent } from "../generated/ThalesRoyalePassport/ThalesRoyalePassport"
import { handleThalesRoyalePassportAdminChanged } from "../src/thales-royale-passport"
import { createThalesRoyalePassportAdminChangedEvent } from "./thales-royale-passport-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let previousAdmin = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newAdmin = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newThalesRoyalePassportAdminChangedEvent = createThalesRoyalePassportAdminChangedEvent(
      previousAdmin,
      newAdmin
    )
    handleThalesRoyalePassportAdminChanged(
      newThalesRoyalePassportAdminChangedEvent
    )
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ThalesRoyalePassportAdminChanged created and stored", () => {
    assert.entityCount("ThalesRoyalePassportAdminChanged", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ThalesRoyalePassportAdminChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "previousAdmin",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ThalesRoyalePassportAdminChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newAdmin",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
