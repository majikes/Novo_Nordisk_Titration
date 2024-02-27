import { type CGMDataAvailType } from "./CGMDataAvailType"

interface CGMDataFromAPIType {
    timezone: string,
    cgmPercentage: CGMDataAvailType[],
}

export { type CGMDataFromAPIType }