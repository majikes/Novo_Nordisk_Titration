interface UserSupervisedByFromAPIType {
    supervisee_username: string,
    supervisor_username: string,
    supervisee_id: number,
    supervisor_id: number,
    supervisee_role_name: string,
    supervisor_role_name: string,
    active: number,
    site_id: number,
    site_name: string,
  }

interface UserSupervisedByAPIEndpointType {
    message: string,
    user_list?: UserSupervisedByFromAPIType[],
}

interface Supervisor {
    supervisor_username: string,
    supervisor_id: number,
    supervisor_role_name: string,
    active: number,
    site_id: number,
    site_name: string,
}

interface UserSupervisedByGroupBySuperviseeType {
    supervisee_username: string,
    supervisee_id: number,
    supervisee_role_name: string,
    supervisors: Supervisor[],
}

export {
    type UserSupervisedByFromAPIType,
    type UserSupervisedByAPIEndpointType,
    type Supervisor,
    type UserSupervisedByGroupBySuperviseeType,
} 