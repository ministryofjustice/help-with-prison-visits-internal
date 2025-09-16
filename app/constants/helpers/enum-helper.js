module.exports.getKeyByValue = (enumeration, value) => {
  let result = value
  Object.keys(enumeration).forEach(key => {
    const element = enumeration[key]
    if (typeof element === 'object' && element.value === value) {
      result = element
    }
  })
  return result
}
