import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { useCostCategories } from "../hooks/use-costs";
import type { ListCostsFilters } from "@shared-types/ipc";

interface CostsFilterBarProps {
  filters: ListCostsFilters;
  onChange: (filters: ListCostsFilters) => void;
}

const ALL_CATEGORIES = "__all__";

export function CostsFilterBar({ filters, onChange }: CostsFilterBarProps) {
  const { data: categories } = useCostCategories();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Categorie</Label>
        <Select
          value={filters.category ?? ALL_CATEGORIES}
          onValueChange={(value) =>
            onChange({ ...filters, category: value === ALL_CATEGORIES ? undefined : value })
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Toate categoriile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>Toate categoriile</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>De la data</Label>
        <Input
          type="date"
          className="w-40"
          value={filters.dateFrom?.slice(0, 10) ?? ""}
          onChange={(e) =>
            onChange({ ...filters, dateFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined })
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Până la data</Label>
        <Input
          type="date"
          className="w-40"
          value={filters.dateTo?.slice(0, 10) ?? ""}
          onChange={(e) =>
            onChange({ ...filters, dateTo: e.target.value ? new Date(e.target.value).toISOString() : undefined })
          }
        />
      </div>

      {(filters.category || filters.dateFrom || filters.dateTo) && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Resetează filtrele
        </Button>
      )}
    </div>
  );
}
