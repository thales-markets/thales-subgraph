import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { ExampleEntity } from "../generated/schema"
import { CreatorCapitalRequirementUpdated } from "../generated/Manager/Manager"
import { handleCreatorCapitalRequirementUpdated } from "../src/manager"
import { createCreatorCapitalRequirementUpdatedEvent } from "./manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let value = BigInt.fromI32(234)
    let newCreatorCapitalRequirementUpdatedEvent = createCreatorCapitalRequirementUpdatedEvent(
      value
    )
    handleCreatorCapitalRequirementUpdated(
      newCreatorCapitalRequirementUpdatedEvent
    )
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ExampleEntity created and stored", () => {
    assert.entityCount("ExampleEntity", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "value",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})