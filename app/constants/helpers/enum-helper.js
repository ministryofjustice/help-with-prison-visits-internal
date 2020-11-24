module.exports.getKeyByValue = function (enumeration, value) {
  let result = value
  Object.keys(enumeration).forEach(function (key) {
    const element = enumeration[key]
    if (typeof element === 'object' && element.value === value) {
      result = element
    }
  })
  return result
}
