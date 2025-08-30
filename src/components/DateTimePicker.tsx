import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";

const DateTimePicker = ({ value, onChange, disabled = false }) => {
    const [date, setDate] = useState(value?.date || '');
    const [time, setTime] = useState(value?.time || '09:00');

    useEffect(() => {
        onChange({ date, time });
    }, [date, time, onChange]);

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(new Date(date), "PPP") : "Select date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date ? new Date(date) : undefined}
                            onSelect={(selectedDate) => setDate(selectedDate ? selectedDate.toISOString().split('T')[0] : '')}
                            disabled={(date) => date < new Date() || disabled}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default DateTimePicker;