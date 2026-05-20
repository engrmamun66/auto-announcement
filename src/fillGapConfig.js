

 
function fillMissingKeys(exampleConfigObject, configObject) {
  configObject = fill__config__missing__data(exampleConfigObject, configObject, ['settings', 'sms'])
  return configObject
}





function fill__config__missing__data(exampleConfigObject, configObject, keys = []) {
  if (!keys || !keys.length) return configObject
 
  let exampleVal = exampleConfigObject
  for (const k of keys) {
    if (exampleVal == null || typeof exampleVal !== 'object') { exampleVal = undefined; break }
    exampleVal = exampleVal[k]
  }
  const defaultVal = exampleVal

  // Walk configObject, creating missing intermediate objects, then assign leaf
  let node = configObject
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (node[k] == null || typeof node[k] !== 'object') node[k] = {}
    node = node[k]
  }

  const leafKey = keys[keys.length - 1]
  if (node[leafKey] === undefined) {
    node[leafKey] = defaultVal
  }

  return configObject
}

module.exports = { fillMissingKeys }