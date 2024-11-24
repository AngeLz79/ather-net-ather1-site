
function formatTime(timestamp: number) {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userDate = new Date(timestamp).toLocaleString("en-US", {
        timeZone: userTimezone
    });
    const currentDate = new Date();
    const formattedDate = new Date(userDate);

    if (currentDate.toDateString() === formattedDate.toDateString()) {
        return "Today at " + formattedDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        currentDate.setDate(currentDate.getDate() - 1);
        if (currentDate.toDateString() === formattedDate.toDateString()) {
            return "Yesterday at " + formattedDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return formattedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
    }
}


interface TimeProps {
    timestamp: number
}

const FormatTime: React.FC<TimeProps> = ({
    timestamp
}) => {  
    return (
        <span className="text-xs text-gray-400">
            {formatTime(timestamp)}
        </span>
    )
}

export default FormatTime;