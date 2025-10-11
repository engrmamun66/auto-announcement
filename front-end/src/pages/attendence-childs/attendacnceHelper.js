import moment from 'moment/moment';

const Ahelper = { 
    printDate({date}){
        let today = moment().format('Y-MM-DD')
        let yesterday = moment().subtract(1, 'day').format('Y-MM-DD')
        let date_today = moment(date).format('Y-MM-DD')
        if(today == date_today){
            return 'Today'
        }
        else if(date_today == yesterday){
            return 'Yesterday'
        } else {
            return moment(date).format('DD MMMM, Y')
        }
    },
    timeFromTime(time_text){
        let dateTime = moment().format('Y-MM-DD ') + time_text
        return moment(dateTime).format('hh:mm:ss A')
    },
    generateUniqueString() {
        return Math.random().toString(36).substring(2, 14) + Date.now().toString(36).substring(0, 2);
    },
    printShift(times_text){
        if(typeof times_text == 'object' && times_text?.start && times_text?.end){
            times_text = times_text?.start + ' - ' + times_text?.end
        }

        let [ startTime, endTime ] = times_text.split(' - ')
        if(startTime && endTime){
            return `${moment(moment().format('Y-MM-DD ') + startTime).format('hh:mm A')} - ${moment(moment().format('Y-MM-DD ') + endTime).format('hh:mm A')}`
        } else {
            return times_text
        }
    },
    count: {
        in(data){
            return (data || []).filter(s => s?.in_time).length || 0
        },
        out(data){
            return (data || []).filter(s => s?.out_time).length || 0
        },
        late(data){
            return (data || []).filter(s => s?.status === 'Late').length || 0
        },
    }
     
}

export default Ahelper
 