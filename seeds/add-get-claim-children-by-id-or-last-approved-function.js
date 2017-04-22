const config = require('../config')

/**
 * Adds a table function to the IntSchema that retrieves the last approved Claim Child data for the given reference
 * number and eligibilityId or by claimId and grants the external web user permissions to call it.
 */
exports.seed = function (knex, Promise) {
  return knex.schema
    .raw('DROP FUNCTION IF EXISTS IntSchema.getClaimChildrenByIdOrLastApproved')
    .then(function () {
      return knex.schema
        .raw(
          `
            CREATE FUNCTION IntSchema.getClaimChildrenByIdOrLastApproved(@reference varchar(7), @eligibiltyId int, @claimId int, @masked bit)
            RETURNS TABLE
            AS
            RETURN
            (
              SELECT
                ClaimChild.FirstName,
                CASE
                  WHEN @masked = 1 THEN STUFF(ClaimChild.LastName, 2, 100, REPLICATE('*', LEN(ClaimChild.LastName) - 1))
                  ELSE ClaimChild.LastName
                END AS LastName,
                ClaimChild.DateOfBirth,
                ClaimChild.Relationship
              FROM IntSchema.ClaimChild AS ClaimChild
              WHERE
                ClaimChild.ClaimId = @claimId OR
                ClaimChild.ClaimId IN (
                  SELECT TOP(1) Claim.ClaimId
                  FROM IntSchema.Claim AS Claim
                  WHERE
                    Claim.Reference = @reference AND
                    Claim.EligibilityId = @eligibiltyId AND
                    Claim.Status = 'APPROVED'
                  ORDER BY Claim.DateSubmitted DESC
                ) AND
                ClaimChild.IsEnabled = 1
            )
          `
        )
        .raw('GRANT SELECT ON IntSchema.getClaimChildrenByIdOrLastApproved TO ??;', [config.EXT_WEB_USERNAME])
    })
    .catch(function (error) {
      console.log(error)
      throw error
    })
}
