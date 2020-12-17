module.exports = function (status) {
  let displayStatus = ''
  switch (status) {
    case 'APPROVED':
    case 'REJECTED':
    case 'UPDATED':
    case 'PENDING':
    case 'NEW':
      displayStatus = status.charAt(0) + status.slice(1).toLowerCase()
      break
    case 'AUTO-APPROVED':
      displayStatus = 'Auto-Approved'
      break
    case 'APPROVED-ADVANCE-CLOSED':
      displayStatus = 'Closed'
      break
    case 'APPROVED-PAYOUT-BARCODE-EX':
      displayStatus = 'Barcode Expired'
      break
    case 'REQUEST-INFO-PAYMENT':
      displayStatus = 'Payment Information Requested'
      break
    case 'REQUEST-INFORMATION':
      displayStatus = 'Information Requested'
      break
    default:
      displayStatus = status
      break
  }
  return displayStatus
}
