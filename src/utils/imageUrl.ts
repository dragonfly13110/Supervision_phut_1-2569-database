export const isImageUrl = (value: string) => {
    try {
        const { protocol } = new URL(value.trim());
        return protocol === 'http:' || protocol === 'https:';
    } catch {
        return false;
    }
};
