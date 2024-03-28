interface CGMDataAvailDayType {
    dayStartTimestamp: number,
    percentageOfCgmAvailable: number,
}

interface CGMDataAvailTypeMinimal {
    username: string,
    dailyPercentageOfCgmAvailable: CGMDataAvailDayType[],
    firstTimestamp: number,
    lastTimestamp: number,
}

interface CGMDataAvailFrontendType extends CGMDataAvailTypeMinimal {
    loading: boolean,
}

interface CGMDataFromAPIType {
    timezone: string,
    cgmPercentage: CGMDataAvailTypeMinimal[],
    errorMsg: string,
}

export {
    type CGMDataAvailDayType,
    type CGMDataAvailTypeMinimal,
    type CGMDataAvailFrontendType,
    type CGMDataFromAPIType
}