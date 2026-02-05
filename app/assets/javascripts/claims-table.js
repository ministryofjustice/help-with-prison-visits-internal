function cleanColumnOutput (data, type, row) {
  const unsafeOutputPattern = />|<|&|"|\/|'/g
  return data.replace(unsafeOutputPattern, '')
}

jQuery(() => {
  const paramsString = window.location.search
  const searchParams = new URLSearchParams(paramsString)
  const status = searchParams.get('status') || 'NEW'
  const dataReference = `/claims/${status}`

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
      error: () => {
        $('#claims_processing').hide()
        alert('An error occurred when searching for claims.') // eslint-disable-line no-undef
      }
    },
    columns: [
      { data: 'Reference', render: cleanColumnOutput, orderable: false },
      { data: 'Name', render: cleanColumnOutput, orderable: false },
      { data: 'DateSubmittedFormatted', orderable: true },
      { data: 'DateOfJourneyFormatted', orderable: true },
      { data: 'UpdatedDateFormatted', orderable: true },
      { data: 'DisplayStatus', orderable: false },
      {
        data: 'ClaimType',
        orderable: false,
        createdCell: function (td, cellData, rowData, row, col) {
          const extraClasses = rowData.ClaimTypeDisplayName === 'Repeat' ? ' moj-badge--green' : ''
          $(td).html(`<span class="moj-badge${extraClasses}">${rowData.ClaimTypeDisplayName}</span>`)
        }
      },
      {
        data: 'ClaimId',
        orderable: false,
        createdCell: function (td, cellData, rowData, row, col) {
          $(td).html(`<a id="claim${rowData.ClaimId}" href="/claim/${rowData.ClaimId}">View</a>`)
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
