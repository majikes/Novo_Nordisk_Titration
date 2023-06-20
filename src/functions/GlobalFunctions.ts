import Subject from '@/types/Subject'
import UserListItem from '@/types/UserListItem'
import SubjectFromAPI from '@/types/SubjectFromAPI'
import SubjectGraphable from '@/types/SubjectGraphable'
import QuantileGraphable from '@/types/QuantileGraphable'

// https://www.newline.co/@bespoyasov/how-to-use-fetch-with-typescript--a81ac257
// Make the `request` function generic
// to specify the return data type
// usage:
// Handling errors outside:
// (async () => {
//     try {
//       const user = await request<User>('/api/users/42');
//     }
//     catch (error) {
//       // Handle any error happened.
//     }
//   })()

export async function request<TResponse>(
    url: string,
    // `RequestInit` is a type for configuring 
    // a `fetch` request. By default, an empty object.
    config: RequestInit = {}
     
  // This function is async, it will return a Promise:
  ): Promise<TResponse> {
      
    // Inside, we call the `fetch` function with 
    // a URL and config given:
    // const response = await fetch(url, config)
    // return await response.json()
    // https://stackoverflow.com/questions/71514377/how-could-i-save-data-from-get-response-in-typescript-and-access-them
    return await fetch(url, config).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        return response.json()
    })
}

// predefining get and post
// usage:
// const user = await api.get<User>('/api/users/42');
export const api = {
    get: <TResponse>(url: string) => 
        request<TResponse>(url),
    
    // Using `extends` to set a type constraint:
    post: <TBody extends BodyInit, TResponse>(url: string, body: TBody) => 
        request<TResponse>(url, { method: 'POST', body: body }),
}

// helper function to convert dumb return value describing
// subjects to the Subject type we defined.
// mainly we're just extracting values from arrays.
export function subject_convert(s: SubjectFromAPI): Subject {
    const ret_s: Subject = {
        id: s.id[0],
        username: s.username[0],
        email: s.email[0],
        status: s.status[0],
        group: s.group[0],
        phaseName: s.phaseName[0],
        phase: s.phase[0],
        startDate: s.startDate[0],
        t_status: s.t_status[0],
        lastI_BAM: s.lastI_BAM,
        lastI_PAM: s.lastI_PAM,
        lastRec: s.lastRec,
        lastGMI: s.lastGMI,
        lastIdentNE: s.lastIdentNE,
        lastBWeeklyOpt: s.lastBWeeklyOpt,
        t_not: s.t_not[0],
        nWeeksSD: s.nWeeksSD[0], 
        nWeeksP: s.nWeeksP[0],
        tControl: s.tControl,
        lastLog: s.lastLog
    }
    return ret_s
}

export function user_convert(s: SubjectFromAPI): UserListItem {
    const ret_s: UserListItem = {
        id: s.id[0],
        username: s.username[0],
        status: s.status[0]
    }
    return ret_s
}

// date string repr conversion
// incoming dates from API are MM/DD/YYYY, 
// min and max HTML attrs are YYYY-MM-DD (ISO 8601)
// https://stackoverflow.com/questions/28246788/convert-yyyy-mm-dd-to-mm-dd-yyyy-in-javascript
export function dateConvertToISO(input: string): string {
    const pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
    if (!input || !input.match(pattern)) {
        return input;
    }
    return input.replace(pattern, '$3-$1-$2');
}