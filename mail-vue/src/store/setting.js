import { defineStore } from 'pinia'

export const useSettingStore = defineStore('setting', {
    state: () => ({
        domainList: [],
        settings: {
            r2Domain: '',
            title: 'RelayDot',
            register: 1,
            loginOpacity: 1.00,
        },
        lang: '',
    }),
    actions: {

    },
    persist: {
        pick: ['lang'],
    },
})
