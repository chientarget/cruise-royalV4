import {defineStore} from 'pinia';
import router from '../router';
import { API_URL } from './config';

const api_url = API_URL;

interface AuthState {
    user: string | null;
    access_token: string | null;
    refresh_token: string | null;
    returnUrl: string;
}

export const useAuthStore = defineStore({
    id: 'auth',
    state: (): AuthState => ({
        user: localStorage.getItem('user') || null,
        access_token: localStorage.getItem('access_token') || null,
        refresh_token: localStorage.getItem('refresh_token') || null,
        returnUrl: '/',
    }),
    actions: {
        async login(username: string, password: string) {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            const url = `${api_url}/login`;
                let response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (response.status === 403) {
                await this.refreshToken();
                response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${this.access_token}`,
                    },
                });
                return false;
            }

            if (response.status === 200) {
                const {access_token, refresh_token} = await response.json();
                localStorage.setItem('user', username);
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
                await this.fetchUserInfo();
                this.user = username;
                this.access_token = access_token;
                this.refresh_token = refresh_token;

                const redirectUrl = localStorage.getItem('redirectUrl');
                localStorage.removeItem('redirectUrl');

                await this.fetchUserImage();
                await router.push(redirectUrl || this.returnUrl);
                return true;
            }
        },

        async fetchUserInfo() {
            const username = localStorage.getItem('user');
            const access_token = localStorage.getItem('access_token');
            const url = `${api_url}/user?username=${username}`;

            try {
                const res = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                });

                if (res.status === 403) {
                    useAuthStore().logout();
                    return;
                }

                if (!res.ok) {
                    throw new Error(`Server responded with status code ${res.status}`);
                }

                const userData = await res.json();
                console.log("User Data:", userData);
                localStorage.setItem('userInfo', JSON.stringify(userData));
                localStorage.setItem('userId', JSON.stringify(userData.id))
            } catch (error) {
                // await router.replace("/");
                console.log("Error fetching user by username!", error);

            }
        },
        async fetchUserImage() {
            const userId = localStorage.getItem('userId');
            const url = `${api_url}/images/?userId=${userId}`;
            const access_token = localStorage.getItem('access_token');
            try {
                const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    },
                });

                if (!res.ok) {
                    throw new Error(`Server responded with status code ${res.status}`);
                }

                const data = await res.json();
                localStorage.setItem('userImage', JSON.stringify(data));
            } catch (error) {
                console.log("Error fetching user image!", error);
            }
        },

        async register(username: string, password: string) {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            const url = '${api_url}/register'; // replace with your register endpoint

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (response.status === 201) {
                return true;
            } else {
                return false;
            }
        },

        async refreshToken() {
            const response = await fetch('${api_url}/api/token/refresh', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.refresh_token}`,
                },
            });

            if (response.status === 200) {
                const {access_token} = await response.json();
                localStorage.setItem('access_token', access_token);
                this.access_token = access_token;
            } else {
                this.logout();
            }
        },

        logout() {

            this.user = null;
            this.access_token = '';
            this.refresh_token = '';
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('userId')
            localStorage.removeItem('userImage')
            setTimeout(() => {
                router.push('/').then(r => r);
            }, 500);
        },
    },
});
