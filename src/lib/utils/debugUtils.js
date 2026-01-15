

export const debugStyle = "background: blue; color: orange";

// for logging an object's public fields
export function sortObjectProps(obj) {
  const sortedObj = {};
  for (const key of Object.keys(obj).sort()) {
    if (!key.includes('_')) sortedObj[key] = obj[key];
  }
  return sortedObj
}

// Example: in BasicModel.js, log the material properties of a selected/focused Model 
// if (isFocused?.length && isFocused === nodeName) {
//   console.log(`%cname: ${nodeName} selectedMatID: ${selectedMatID}${"\n"}`, debugStyle);
//   console.table(createSortedObject(selectedMaterialRef.current));
// }
