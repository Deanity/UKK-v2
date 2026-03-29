import API from "./api";

export interface ApiUser {
    id: number;
    nama: string;
    username: string;
    email: string;
    role: string;
    type: string;
}

export interface LoginResponse {
    status: boolean;
    message: string;
    token?: string;
    user?: ApiUser;
}

export const loginRequest = async (
    username: string,
    password: string
): Promise<LoginResponse> => {
    const response = await API.post<LoginResponse>("/login", {
        username,
        password,
    });
    return response.data;
};
