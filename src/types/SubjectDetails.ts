interface SubjectDetails {
    id?: string,
    tdbasal: number,
    tdbolus: number,
    nmeals: number,
    firstLog: string,
    lastLog: string,
    tControl: number[],
    mControl: number[][],
    mCV: number[],
    mTDBB: number[][],
    mCHO: number[][],
    hControl: number[][],
    lwControl: number[][],
    owControl: number[][][],
    sIDP: {
        time: number[],
        basal: number[],
        CF: number[],
        CR: number[]
    },
    cIDP: {
        time: number[],
        basal: number[],
        CF: number[],
        CR: number[]
    },
    glucoseV: number[],
    mealsV: number[],
    basalV: number[],
    mbolusV: number[],
    cbolusV: number[]
}

export default SubjectDetails