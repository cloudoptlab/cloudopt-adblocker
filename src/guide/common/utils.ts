export const getHash = (hash: string = window.location.hash): string => {
    return hash.replace("#", "");
};
