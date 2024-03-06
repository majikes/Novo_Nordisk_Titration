import { type CGMDataAvailDayType } from "./CGMDataAvailDayType"

interface CGMDataAvailType {
    username: string | null,
    dailyPercentageOfCgmAvailable: CGMDataAvailDayType[],
    dailyPercentageOfCgmAvailableOld: CGMDataAvailDayType[],
    percentageOfCgmAvailable: number,
    percentageOfCgmAvailableOld: number,
    firstTimestamp: number,
    lastTimestamp: number,
}

export { type CGMDataAvailType }