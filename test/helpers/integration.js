function getClaimReference (result, reference) {
  return result.claims.filter(function (claim) {
    return claim.Reference === reference
  })
}

function getClaimId (result, claimId) {
  return result.claims.filter(function (claim) {
    return claim.ClaimId === claimId
  })
}

module.exports = {
  getClaimReference,
  getClaimId
}
