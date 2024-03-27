import { type CGMDataAvailType } from "./CGMDataAvailType"

interface CGMSingleSubjectDataFromAPIType {
    timezone: string,
    cgmPercentage: CGMDataAvailType[],
    errorMsg: string,
}

export { type CGMSingleSubjectDataFromAPIType }