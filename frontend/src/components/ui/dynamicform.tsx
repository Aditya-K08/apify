import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  schema: any;
  formData: any;
  setFormData: (data: any) => void;
};

const DynamicForm: React.FC<Props> = ({ schema, formData, setFormData }) => {
  const properties = schema.properties || schema;
  const required = schema.required || [];

  if (!properties || typeof properties !== "object") {
    return <p>No input schema available</p>;
  }

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {Object.entries(properties).map(([key, value]: [string, any]) => {
        const isRequired = required.includes(key);
        const label = `${value.title || key}${isRequired ? "*" : ""}`;

        if (value.enum) {
          return (
            <div key={key}>
              <Label className="mb-1 block">{label}</Label>
              <Select
  onValueChange={(val) => handleChange(key, val)}
  value={formData[key] ?? value.prefill ?? value.default ?? value.enum?.[0]}
>
  <SelectTrigger>
    <SelectValue
      placeholder={`Select ${label}`}
    />
  </SelectTrigger>
  <SelectContent>
    {value.enum
      .filter((option: string) => option?.trim() !== "")
      .map((option: string, i: number) => (
        <SelectItem key={option} value={option}>
          {value.enumTitles?.[i] || option}
        </SelectItem>
      ))}
  </SelectContent>
</Select>
            </div>
          );
        }

        switch (value.type) {
          case "string":
            return (
              <div key={key}>
                <Label className="mb-1 block">{label}</Label>
                <Input
                  type="text"
                  value={formData[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            );
          case "integer":
          case "number":
            return (
              <div key={key}>
                <Label className="mb-1 block">{label}</Label>
                <Input
                  type="number"
                  value={formData[key] || ""}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                />
              </div>
            );
          case "boolean":
            return (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  checked={formData[key] || false}
                  onCheckedChange={(checked) => handleChange(key, checked)}
                />
                <Label>{label}</Label>
              </div>
            );
          case "array":
            return (
              <div key={key}>
                <Label className="mb-1 block">{label}</Label>
                <Textarea
                  placeholder={`Enter one item per line`}
                  value={(formData[key] || []).join("\n")}
                  onChange={(e) =>
                    handleChange(
                      key,
                      e.target.value.split("\n").filter(Boolean)
                    )
                  }
                />
              </div>
            );
          default:
            return (
              <div key={key}>
                <Label className="mb-1 block">{label}</Label>
                <Input
                  value={formData[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            );
        }
      })}
    </div>
  );
};
export default DynamicForm;