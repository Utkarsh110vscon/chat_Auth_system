import API from "../service/apiService"

export const getNewaccessToken = async () => {
    try {
        const token = await API.get('/api/auth/accessToken');
        return token.data.newAccessToken
    } catch (error) {
        throw error;
    }
}