import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../../components/ui/command";
import { Button } from "../../components/ui/button";

interface SearchSelectProps {
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  fetchData: (query: string) => Promise<any[]>;
}

export default function SearchSelect({
  value,
  placeholder = "Search...",
  onChange,
  fetchData,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [list, setList] = useState<any[]>([]);

  // Fetch only when search text changes AND search is not empty
  useEffect(() => {
    if (!open) return;

    if (search.trim() === "") {
      setList([]);
      return;
    }

    const load = async () => {
      const result = await fetchData(search);
      setList(result);
    };

    load();
  }, [search, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-gray-700 font-normal"
        >
          <span>{list.find((i) => i._id === value)?.name || placeholder}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
          />

          <CommandEmpty>No results found</CommandEmpty>

          <CommandGroup className="w-full">
            {list.map((item) => (
              <CommandItem
                key={item._id}
                onSelect={() => {
                  onChange(item._id);
                  setSearch("");
                  setOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.email}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
