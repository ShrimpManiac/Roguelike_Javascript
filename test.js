function insertionSort(array) {
    for (let j = 1; j < array.length; j++) {
        let i = j - 1;
        if ( array[i] <= array[j] ) {
            continue;
        }
        while (i >= 0) {
            if ( array[i] <= array[j] ) {
                let temp = array[j];
                array.splice(j, 1);
                array.splice(i + 1, 0, temp);
                break;
            }
            i--;
        }
    }
    return array;
}

let array = [11, 1, 7, 2, 5, 3, 6];
console.log("result : " + insertionSort(array));