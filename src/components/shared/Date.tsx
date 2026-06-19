import { useEffect, useState } from "react";
import moment from "moment";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledRules?: any;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  disabledRules,
}: DatePickerProps) {
  const [date, setDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false); // Control Popover

  useEffect(() => {
    if (value) setDate(value);
    else setDate(null);
  }, [value]);

  const handleSelect = (selectedDate?: Date | null) => {
    const next = selectedDate ?? null;
    setDate(next);
    if (onChange) onChange(next);

    setOpen(false); // Automatically close Popover after selecting
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal hover:bg-white",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? moment(date).format("DD/MM/YYYY") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={handleSelect}
          initialFocus
          disabled={disabledRules}
        />
      </PopoverContent>
    </Popover>
  );
}
