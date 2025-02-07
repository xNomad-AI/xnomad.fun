export function deleteLastZero(numArr: string[], makeZero = false): string {
  const len = numArr.length;
  if (numArr.length === 1 && numArr[0] === '0' && makeZero) {
    return numArr[0];
  } else if (numArr[len - 1] === '0') {
    numArr.pop();
    return deleteLastZero(numArr);
  } else if (numArr[len - 1] === '.') {
    numArr.pop();
  }
  return numArr.join('');
}
