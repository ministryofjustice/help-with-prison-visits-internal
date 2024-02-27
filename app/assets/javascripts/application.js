/* global $ */

function ShowHideContent () {
  const self = this

  self.escapeElementName = function (str) {
    const result = str.replace('[', '\\[').replace(']', '\\]')
    return (result)
  }

  self.showHideRadioToggledContent = function () {
    $(".multiple-choice input[type='radio']").each(function () {
      const $radio = $(this)
      const $radioGroupName = $radio.attr('name')
      const $radioLabel = $radio.next('label')

      const dataTarget = $radioLabel.attr('data-target')

      // Add ARIA attributes

      // If the data-target attribute is defined
      if (dataTarget) {
        // Set aria-controls
        $radio.attr('aria-controls', dataTarget)

        $radio.on('click', function () {
          // Select radio buttons in the same group
          $radio.closest('form').find('.multiple-choice input[name=' + self.escapeElementName($radioGroupName) + ']').each(function () {
            const $this = $(this)

            const groupDataTarget = $this.next('label').attr('data-target')
            const $groupDataTarget = $('#' + groupDataTarget)

            // Hide toggled content
            $groupDataTarget.addClass('js-hidden')
            // Set aria-expanded and aria-hidden for hidden content
            $this.attr('aria-expanded', 'false')
            $groupDataTarget.attr('aria-hidden', 'true')
          })

          const $dataTarget = $('#' + dataTarget)
          $dataTarget.removeClass('js-hidden')
          // Set aria-expanded and aria-hidden for clicked radio
          $radio.attr('aria-expanded', 'true')
          $dataTarget.attr('aria-hidden', 'false')
        })
      } else {
        // If the data-target attribute is undefined for a radio button,
        // hide visible data-target content for radio buttons in the same group

        $radio.on('click', function () {
          // Select radio buttons in the same group
          $('.multiple-choice input[name=' + self.escapeElementName($radioGroupName) + ']').each(function () {
            const groupDataTarget = $(this).next('label').attr('data-target')
            const $groupDataTarget = $('#' + groupDataTarget)

            // Hide toggled content
            $groupDataTarget.addClass('js-hidden')
            // Set aria-expanded and aria-hidden for hidden content
            $(this).attr('aria-expanded', 'false')
            $groupDataTarget.attr('aria-hidden', 'true')
          })
        })
      }
    })
  }
  self.showHideCheckboxToggledContent = function () {
    $(".multiple-choice input[type='checkbox']").each(function () {
      const $checkbox = $(this)
      const $checkboxLabel = $(this).next('label')

      const $dataTarget = $checkboxLabel.attr('data-target')

      // Add ARIA attributes

      // If the data-target attribute is defined
      if (typeof $dataTarget !== 'undefined' && $dataTarget !== false) {
        // Set aria-controls
        $checkbox.attr('aria-controls', $dataTarget)

        // Set aria-expanded and aria-hidden
        $checkbox.attr('aria-expanded', 'false')
        $('#' + $dataTarget).attr('aria-hidden', 'true')

        // For checkboxes revealing hidden content
        $checkbox.on('click', function () {
          const state = $(this).attr('aria-expanded') === 'false'

          // Toggle hidden content
          $('#' + $dataTarget).toggleClass('js-hidden')

          // Update aria-expanded and aria-hidden attributes
          $(this).attr('aria-expanded', state)
          $('#' + $dataTarget).attr('aria-hidden', !state)
        })
      }
    })
  }
}

$(document).ready(function () {
  // Show and hide toggled content
  // Where .block-label uses the data-target attribute
  const toggleContent = new ShowHideContent()
  toggleContent.showHideRadioToggledContent()
  toggleContent.showHideCheckboxToggledContent()
})

function goBack () {
  history.back() //eslint-disable-line
}
const el = document.getElementById('backBtn')
el && el.addEventListener('click', goBack)

function printReport () {
  const printContents = document.getElementById('print-report').innerHTML
  const originalContents = document.body.innerHTML
  document.body.innerHTML = printContents
  window.print()
  document.body.innerHTML = originalContents
}
const elp = document.getElementById('print')
elp && elp.addEventListener('click', printReport)

document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', (e) => {
    if (form.classList.contains('is-submitting')) {
      e.preventDefault()
    }
    form.classList.add('is-submitting')
  })
})
