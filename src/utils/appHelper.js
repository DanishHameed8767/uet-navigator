export const parseSafely = (data) => {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.log(error);
        return null;
    }
};
