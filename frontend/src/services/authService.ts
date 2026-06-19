import httpService from "./httpService";


const authService = {
    register: (userData : {name : string}) => httpService.post("devices/register", userData),
    getMe : () => httpService.get("devices/me")
}

export default authService;