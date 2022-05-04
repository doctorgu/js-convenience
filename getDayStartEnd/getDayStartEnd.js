function getYyyymmdd(date) {
    return date.getFullYear() 
            + '-' + (date.getMonth() + 1).toString().padStart(2, '0')
            + '-' + (date.getDate()).toString().padStart(2, '0')
}

/*
--Summary
Get array of [day, start date, end day] by days array
--Example
const startDate = new Date('2022-05-06')
const days = [1,2,2,3,1,2,3,2,2]
const holidays = ['2022-05-07','2022-05-08','2022-05-14','2022-05-15','2022-05-21','2022-05-22','2022-05-28','2022-05-29','2022-06-01','2022-06-04','2022-06-05','2022-06-06','2022-06-11','2022-06-12','2022-06-18','2022-06-19','2022-06-25','2022-06-26','2022-07-02','2022-07-03','2022-07-09','2022-07-10']
                .map(ymd => new Date(ymd))
const list = getDayStartEnd(startDate, days, holidays)
const listToExcel = list
                .map(([day, start, end]) => `${day}\t${getYyyymmdd(start)}\t${getYyyymmdd(end)}`)
                .join('\r\n')
console.log(listToExcel)
// Result:
1	2022-05-06	2022-05-06
2	2022-05-09	2022-05-10
2	2022-05-11	2022-05-12
3	2022-05-13	2022-05-17
1	2022-05-18	2022-05-18
2	2022-05-19	2022-05-20
3	2022-05-23	2022-05-25
2	2022-05-26	2022-05-27
2	2022-05-30	2022-05-31
*/
function getDayStartEnd(startDate, days, holidays) {
    function addDays(date, days) {
        let dateNew = new Date(date.getTime())
        
        let i = 0
        while (i < days) {
            dateNew.setDate(dateNew.getDate() + 1)
            
            if (!holidays.some(h => h.getTime() === dateNew.getTime())) {
                i += 1
            }
        }

        return dateNew
    }
    
    let start = startDate

    const list = []
    for (let i = 0; i < days.length; i += 1) {
        const day = days[i]
        const end = addDays(start, day - 1)
        list.push([day, start, end])
        start = addDays(end, 1)
    }

    return list
}
