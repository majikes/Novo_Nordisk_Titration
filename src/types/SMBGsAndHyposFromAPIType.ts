import SMBGFromAPIType from "./SMBGFromAPIType"
import HypoFromAPIType from "./HypoFromAPIType"

interface SMBGsAndHyposFromAPIType {
  hypoHistory: HypoFromAPIType[],
  smbgHistory: SMBGFromAPIType[],
}

export default SMBGsAndHyposFromAPIType