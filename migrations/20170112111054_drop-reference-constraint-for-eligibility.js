exports.up = function (knex, Promise) {
  return knex.schema.raw('ALTER TABLE ClaimEscort DROP CONSTRAINT claimescort_reference_foreign')
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimEvent DROP CONSTRAINT claimevent_reference_foreign')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimDeduction DROP CONSTRAINT claimdeduction_reference_foreign')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimChild DROP CONSTRAINT claimchild_reference_foreign')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimDocument DROP CONSTRAINT claimdocument_reference_foreign')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimBankDetail DROP CONSTRAINT claimbankdetail_reference_foreign')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimExpense DROP CONSTRAINT claimexpense_reference_foreign')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE Visitor DROP CONSTRAINT visitor_reference_foreign')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE Prisoner DROP CONSTRAINT prisoner_reference_foreign')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE Eligibility DROP CONSTRAINT eligibility_reference_unique')
    })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.raw('ALTER TABLE Eligibility ADD CONSTRAINT eligibility_reference_unique UNIQUE NONCLUSTERED (Reference)')
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimEscort ADD CONSTRAINT claimescort_reference_foreign FOREIGN KEY (Reference) REFERENCES Eligibility(Reference)')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimEvent ADD CONSTRAINT claimevent_reference_foreign FOREIGN KEY (Reference) REFERENCES Eligibility(Reference)')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimDeduction ADD CONSTRAINT claimdeduction_reference_foreign FOREIGN KEY (Reference) REFERENCES Eligibility(Reference)')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimChild ADD CONSTRAINT claimchild_reference_foreign FOREIGN KEY (Reference) REFERENCES Eligibility(Reference)')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimDocument ADD CONSTRAINT claimdocument_reference_foreign FOREIGN KEY (Reference) REFERENCES Eligibility(Reference)')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimBankDetail ADD CONSTRAINT claimbankdetail_reference_foreign FOREIGN KEY (Reference) REFERENCES Eligibility(Reference)')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE ClaimExpense ADD CONSTRAINT claimexpense_reference_foreign FOREIGN KEY (Reference) REFERENCES Eligibility(Reference)')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE Visitor ADD CONSTRAINT visitor_reference_foreign FOREIGN KEY (Reference) REFERENCES Eligibility(Reference)')
    })
    .then(function () {
      return knex.schema.raw('ALTER TABLE Prisoner ADD CONSTRAINT prisoner_reference_foreign FOREIGN KEY (Reference) REFERENCES Eligibility(Reference)')
    })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
