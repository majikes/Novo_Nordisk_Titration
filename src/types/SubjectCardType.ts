import TiRType from "./TiRType"
import AdherenceCircleType from "./AdherenceCircleType"

interface SubjectCardType {
    id?: number,
    username: string,
    status: string,
    tconnectStatus: boolean,
    tirData: TiRType,
    dataQualityBreakdown: AdherenceCircleType,
    daysToTitrate: number,
}

export default SubjectCardType