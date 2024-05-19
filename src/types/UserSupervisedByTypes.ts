interface UserSupervisedByFromAPIType {
    supervisee_username: string,
    supervisor_username: string,
    supervisee_id: number,
    supervisor_id: number,
    supervisee_role_name: string,
    supervisor_role_name: string,
    active: number,
    supervisee_site_id: number,
    supervisor_site_id: number,
    supervisee_site_name: string,
    supervisor_site_name: string,
}

interface Supervisee {
    supervisee_username: string,
    supervisee_id: number,
    supervisee_role_name: string,
    active: number,
    site_id: number,
    site_name: string,
}

interface UserSupervisedByAPIEndpointType {
    message: string,
    user_list?: UserSupervisedByFromAPIType[],
    supervisor_list?: Supervisee[],
}

interface USBModifiedType {
    supervisee_username: string,
    modified: boolean,
    added: boolean,
    changes_text: string,
    usbg_supervisee: UserSupervisedByFromAPIType
}

interface Supervisor {
    supervisor_username: string,
    supervisor_id: number,
    supervisor_role_name: string,
    active: number,
    supervisor_site_id: number,
    supervisor_site_name: string,
}

interface UserSupervisedByGroupBySuperviseeType {
    supervisee_username: string,
    supervisee_id: number,
    supervisee_role_name: string,
    supervisee_site_id: number,
    supervisee_site_name: string,
    supervisors: Supervisor[],
}

interface USBGFrontendSortType {
    sortDirsDesc: {
        username: boolean,
        role: boolean,
    },
    sortDirsVisible: {
        username: boolean,
        role: boolean,
    },
}

export {
    type UserSupervisedByFromAPIType,
    type UserSupervisedByAPIEndpointType,
    type Supervisor,
    type Supervisee,
    type UserSupervisedByGroupBySuperviseeType,
    type USBGFrontendSortType,
    type USBModifiedType,
}