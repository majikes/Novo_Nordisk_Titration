import { type CGMDataAvailDayType } from "./CGMDataAvailDayType"

interface CGMDataAvailTypeMinimal {
    username: string | null,
    dailyPercentageOfCgmAvailable: CGMDataAvailDayType[],
    firstTimestamp: number,
    lastTimestamp: number,
}

export { type CGMDataAvailTypeMinimal }