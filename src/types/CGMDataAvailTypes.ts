import { type CGMDataAvail5MinDiasType } from "@/types/SubjectCardTypes"

// new interfaces for v2
interface CGMDataAvail5MinDiasTypeCertain extends CGMDataAvail5MinDiasType {
    diasPresent: boolean;
    diasMultiple: boolean;
    diasCount: number;
    awsPresent: boolean;
    awsMultiple: boolean;
    awsCount: number;
    egvTime: number;
}

interface CGMDataAvailDayType {
    dayStartTimestamp: number,
    percentageOfCgmAvailableDias: number,
    percentageOfCgmAvailableAws: number,
    percentageOfCgmAvailable: number,
    availabilityBy5Min: CGMDataAvail5MinDiasTypeCertain[]
}

interface CGMDataAvailTypeMinimal {
    username: string,
    dailyPercentageOfCgmAvailable: CGMDataAvailDayType[],
    firstTimestamp: number,
    lastTimestamp: number,
    lastActualTimestamp: number,
    enrolled: boolean,
}

interface CGMDataAvailFrontendType extends CGMDataAvailTypeMinimal {
    loading: boolean,
    empty: boolean,
    timezone: string,
    randomization: boolean,
}

interface CGMDataFromAPIType {
    timezone: string,
    cgmPercentage: CGMDataAvailTypeMinimal,
    errorMsg: string,
}

// old interfaces

interface CGMDataAvailDayTypeOld {
    dayStartTimestamp: number,
    percentageOfCgmAvailable: number,
}

interface CGMDataAvailTypeMinimalOld {
    username: string,
    dailyPercentageOfCgmAvailable: CGMDataAvailDayTypeOld[],
    firstTimestamp: number,
    lastTimestamp: number,
}

interface CGMDataAvailFrontendTypeOld extends CGMDataAvailTypeMinimalOld {
    loading: boolean,
    empty: boolean,
    timezone: string,
    randomization: boolean,
}

interface CGMDataFromAPITypeOld {
    timezone: string,
    cgmPercentage: CGMDataAvailTypeMinimalOld,
    errorMsg: string,
}

export {
    type CGMDataAvailDayType,
    type CGMDataAvailTypeMinimal,
    type CGMDataAvailFrontendType,
    type CGMDataFromAPIType
}