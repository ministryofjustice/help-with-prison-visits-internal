function totalApproved () {
  let approvedCost = 0
  let manuallyProcessed = 0
  if ($('#unassign').length) {
    $('.approved-amount').each(function () {
      if (!isNaN(this.value) && this.value.length !== 0 && this.value.indexOf('e') === -1 && this.value.indexOf('E') === -1) {
        manuallyProcessed += parseFloat(this.value)
      }
      approvedCost += +$(this).text().replace('£', '')
    })
    $('.deduction').each(function () {
      approvedCost += +$(this).text().replace(' £', '')
    })
  } else { // use hidden approved cost for unassigned claims
    $('.approved-set-amount').each(function () {
      const parsedCost = parseFloat(+$(this).text().replace('£', ''))
      if (!isNaN(parsedCost) && parsedCost !== 0) {
        approvedCost += parsedCost
      }
    })
    $('.deduction').each(function () {
      approvedCost += +$(this).text().replace(' £', '')
    })
  }
  if (isNaN(manuallyProcessed)) {
    manuallyProcessed = 0
  }

  const totalCost = approvedCost + manuallyProcessed
  const formattedCost = totalCost < 0 ? '- £' + Math.abs(totalCost).toFixed(2) : '£' + totalCost.toFixed(2)
  $('.claim-expense-approvedCostText').text(formattedCost)

  if (totalCost < 0) {
    $('.claim-expense-approvedCostText').addClass('claim-table-negative')
  } else {
    $('.claim-expense-approvedCostText').removeClass('claim-table-negative')
  }
}

$(document).ready(function () {
  function initializeState () {
    $('.claim-expense-status').each(function () {
      const id = $(this).attr('data-id')
      const value = $(this).val()
      if (value === 'APPROVED') {
        $(`#claim-expense-${id}-approvedcost`).addClass('approved-amount')
      }
      if (value === 'APPROVED-DIFF-AMOUNT') {
        $(`#claim-expense-${id}-approvedcost`).addClass('approved-amount')
        $(`#claim-expense-${id}-claimedcost`).removeClass('approved-set-amount')
        $(`.approved-${id}-cost-set`).addClass('js-hidden')
        $(`.claim-expense-${id}-approvedcost`).removeClass('js-hidden')
      }
    })
    $('#additional-info-reject').each(function () {
      if (this[this.selectedIndex].value === 'Other') {
        $('.rejection-reason-other').removeClass('js-hidden')
      }
    })
    $('#release-date-is-set').each(function () {
      if ($(this).is(':checked')) {
        $('#release').removeClass('js-hidden')
      }
    })
    $('#is-trusted-checkbox').each(function () {
      if ($(this).is(':checked')) {
        $('.reject-auto-approval').addClass('js-hidden')
      } else {
        $('.reject-auto-approval').removeClass('js-hidden')
      }
    })
  }
  initializeState()

  $(function () {
    totalApproved()
    $('.claim-expense-status').change(function () {
      const id = $(this).attr('data-id')
      const value = $(this).val()
      if (value === 'APPROVED-DIFF-AMOUNT') {
        $(`.claim-expense-${id}-approvedcost`).removeClass('js-hidden')
        $(`.approved-${id}-cost-set`).addClass('js-hidden')
        $(`#claim-expense-${id}-approvedcost`).addClass('approved-amount')
        $(`#claim-expense-${id}-claimedcost`).removeClass('approved-amount')
        $('input.approved-amount').on('input', function () {
          totalApproved()
        })
      } else if (value === 'APPROVED') {
        $(`.claim-expense-${id}-approvedcost`).addClass('js-hidden')
        $(`.approved-${id}-cost-set`).removeClass('js-hidden').text($(`#claim-expense-${id}-claimedcost`).text())
        $(`#claim-expense-${id}-approvedcost`).removeClass('approved-amount')
        $(`#claim-expense-${id}-claimedcost`).addClass('approved-amount')
      } else {
        $(`.approved-${id}-cost-set`).text('').removeClass('js-hidden')
        $(`.claim-expense-${id}-approvedcost`).addClass('js-hidden')
        $(`#claim-expense-${id}-claimedcost`).removeClass('approved-amount')
        $(`#claim-expense-${id}-approvedcost`).removeClass('approved-amount')
      }
      totalApproved()
    })

    $('input[value="Remove"]').parent().parent().find('td.deduction').addClass('approved-amount')
    $('.approved-manual-cost').on('input', function () {
      totalApproved()
    })

    $('.claim-expense-status').each(function () {
      const value = this[this.selectedIndex].value
      const id = $(this).attr('data-id')
      if (value === 'APPROVED') {
        $(this).parent().parent().find('td.cost').addClass('approved-amount')
        $(this).next('input').removeClass('approved-amount')
      } else if (value === 'APPROVED-DIFF-AMOUNT') {
        $(`#claim-expense-${id}-approvedcost`).addClass('approved-amount')
        $(`#claim-expense-${id}-claimedcost`).removeClass('approved-amount')
      } else {
        $(this).parent().parent().find('td.cost').removeClass('approved-amount')
      }
    })

    $('.approved-amount').each(function () {
      totalApproved()
    })

    $('#overpayment-toggle').change(function () {
      showClosedClaimActionSection('#overpayment-input')
    })

    $('#close-toggle').change(function () {
      showClosedClaimActionSection('#close-advanced-claim-input')
    })

    $('#request-new-payment-details-toggle').change(function () {
      showClosedClaimActionSection('#request-new-payment-details-input')
    })

    $('#additional-info-reject').change(function () {
      if (this[this.selectedIndex].value === 'Other') {
        $('.rejection-reason-other').removeClass('js-hidden')
      } else {
        $('.rejection-reason-other').addClass('js-hidden')
      }
    })

    $('#is-trusted-checkbox').on('click', function () {
      if ($(this).is(':checked')) {
        $('.reject-auto-approval').addClass('js-hidden')
      } else {
        $('.reject-auto-approval').removeClass('js-hidden')
      }
    })

    $('#release-date-is-set').on('click', function () {
      if ($(this).is(':checked')) {
        $('#release').removeClass('js-hidden')
      } else {
        $('#release').addClass('js-hidden')
      }
    })
  })

  function showClosedClaimActionSection (id) {
    $('#overpayment-input').addClass('js-hidden')
    $('#close-advanced-claim-input').addClass('js-hidden')
    $('#request-new-payment-details-input').addClass('js-hidden')
    $(id).removeClass('js-hidden')
  }
})
