function cleanColumnOutput (data, type, row) {
  const unsafeOutputPattern = />|<|&|"|\/|'/g
  return data.replace(unsafeOutputPattern, '')
}

$(document).ready(function () {
  const searchQuery = decodeURIComponent(window.location.search.substring(1))

  const search = JSON.parse('{"' + decodeURI(searchQuery).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"').replace(/\+/g, ' ') + '"}')

  if (searchQuery) {
    $('#search-results-header').show()
    $('#advanced-search-results').show()
    const dataReference = '/advanced-search-results'

    $('#advanced-search-results').DataTable({
      processing: true,
      serverSide: true,
      searching: false,
      lengthChange: false,
      order: [],
      ajax: {
        url: dataReference,
        type: 'POST',
        data: search,
        dataSrc: 'claims',
        error: function (response) {
          $('#advanced-search-results_processing').hide()
          alert('An error occurred when searching for claims.') // eslint-disable-line no-undef
        }
      },

      columns: [
        { data: 'Reference', render: cleanColumnOutput },
        { data: 'Name', render: cleanColumnOutput },
        { data: 'DateSubmittedFormatted' },
        { data: 'DateOfJourneyFormatted' },
        { data: 'DisplayStatus' },
        {
          data: 'ClaimType',
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).html('<span class=\'tag ' + rowData.ClaimType + '\'>' + rowData.ClaimTypeDisplayName + '</span>')
          }
        },
        { data: 'DaysUntilPayment' },
        { data: 'AssignedTo' },
        {
          data: 'ClaimId',
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).html("<a id='claim" + rowData.ClaimId + "' href='/claim/" + rowData.ClaimId + "'>View</a>")
          }
        }
      ],

      columnDefs: [
        {
          targets: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          visible: true,
          searchable: false,
          orderable: false,
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).css('padding', '10px')
          }
        }
      ],

      drawCallback: function () {
        const total = $('#advanced-search-results_info').text().split(' ')[6]
        $('.badge').text(total)
      },

      language: {
        info: 'Showing _START_ to _END_ of _TOTAL_ claims',
        infoEmpty: 'Showing 0 to 0 of 0 claims',
        emptyTable: 'No claims found'
      }
    })
  }
})
