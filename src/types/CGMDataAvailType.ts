import { type CGMDataAvailDayType } from "./CGMDataAvailDayType"

interface CGMDataAvailType {
    username: string | null,
    dailyPercentageOfCgmAvailable: CGMDataAvailDayType[],
    percentageOfCgmAvailable: number,
    firstTimestamp: number,
    lastTimestamp: number,
}

export { type CGMDataAvailType }