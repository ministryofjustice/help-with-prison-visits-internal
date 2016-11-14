const childRelationshipEnum = require('../../constants/child-relationship-enum')

module.exports = function (type) {
  return childRelationshipEnum[type] ? childRelationshipEnum[type] : type
}
