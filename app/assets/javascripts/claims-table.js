function getUrlParameter (sParam) {
  const sPageURL = decodeURIComponent(window.location.search.substring(1))
  const sURLVariables = sPageURL.split('&')
  let sParameterName

  for (let i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=')

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1]
    }
  }
}

function cleanColumnOutput (data, type, row) {
  const unsafeOutputPattern = />|<|&|"|\/|'/g
  return data.replace(unsafeOutputPattern, '')
}

$(document).ready(() => {
  const status = getUrlParameter('status') || 'NEW'
  const dataReference = '/claims/' + status

  $('#claims').DataTable({
    processing: true,
    serverSide: true,
    searching: false,
    lengthChange: false,
    sorting: true,
    order: [],
    ajax: {
      url: dataReference,
      dataSrc: 'claims',
      error: response => {
        $('#claims_processing').hide()
        alert('An error occurred when searching for claims.') // eslint-disable-line no-undef
      }
    },
    columns: [
      { title: 'Ref no.', data: 'Reference', render: cleanColumnOutput, orderable: false },
      { title: 'Name', data: 'Name', render: cleanColumnOutput, orderable: false },
      { title: 'Submitted', data: 'DateSubmittedFormatted', orderable: true },
      { title: 'Visit date', data: 'DateOfJourneyFormatted', orderable: true },
      { title: 'Updated date', data: 'UpdatedDateFormatted', orderable: true },
      { title: 'Status', data: 'DisplayStatus', orderable: false },
      {
        title: 'Claim type',
        data: 'ClaimType',
        orderable: false,
        createdCell: function (td, cellData, rowData, row, col) {
          if (rowData.ClaimTypeDisplayName === 'Repeat') {
            $(td).html('<span class="moj-badge moj-badge--green">' + rowData.ClaimTypeDisplayName + '</span>')
          } else {
            $(td).html('<span class="moj-badge">' + rowData.ClaimTypeDisplayName + '</span>')
          }
        }
      },
      {
        title: '',
        data: 'ClaimId',
        orderable: false,
        createdCell: function (td, cellData, rowData, row, col) {
          $(td).html("<a id='claim" + rowData.ClaimId + "' href='/claim/" + rowData.ClaimId + "'>View</a>")
        }
      }
    ],
    // TODO: update pagination to match design
    pagingType: 'first_last_numbers',

    columnDefs: [
      {
        targets: [0, 1, 2, 3, 4, 5, 6, 7],
        visible: true,
        searchable: false
      }
    ],
    drawCallback: () => {
      const total = $('#claims_info').text().split(' ')[5]
      $('.moj-notification-badge').text(total)
    },

    language: {
      info: 'Showing _START_ to _END_ of _TOTAL_ claims',
      infoEmpty: 'Showing 0 to 0 of 0 claims',
      emptyTable: 'No claims found'
    }
  })
})
