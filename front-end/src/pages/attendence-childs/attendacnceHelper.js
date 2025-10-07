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
    }
     
}

export default Ahelper
 