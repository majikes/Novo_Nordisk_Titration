interface SubjectFromAPI {
    id: number[],
    username: string[],
    email: string[],
    status: string[],
    group: number[],
    phaseName: string[],
    phase: string[],
    startDate: string[],
    t_status: string[],
    lastI_BAM: string,
    lastI_PAM: string,
    lastRec: string,
    lastGMI: number[],
    lastIdentNE: number[],
    lastBWeeklyOpt: number[],
    t_not: string[],
    nWeeksSD: number[], 
    nWeeksP: number[],
    tControl: number[],
    lastLog: string
}

export default SubjectFromAPI