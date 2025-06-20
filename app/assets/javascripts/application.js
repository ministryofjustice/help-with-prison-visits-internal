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
