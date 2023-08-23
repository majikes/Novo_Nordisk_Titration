import AdherenceCircleType from "./AdherenceCircleType"
import TiRType from "./TiRType"

interface SubjectCardFromAPIType {
    subjectUsername: string,
    connectionStatus: number, 
    nDays: number,
    activeStatus: number,
    adherenceCircle: AdherenceCircleType,
    timeInRange: TiRType
}

export default SubjectCardFromAPIType