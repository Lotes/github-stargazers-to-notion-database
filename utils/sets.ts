function isSubsetOf<T>(array1: T[], array2: T[]) {
    if (array1.length === array2.length) {
        return array1.every(element => {
            if (array2.includes(element)) {
                return true;
            }
            return false;
        });
    }

    return false;
}

export function areEqualsSets<T>(a: T[], b: T[]) {
    return isSubsetOf(a, b) && isSubsetOf(b, a);
}