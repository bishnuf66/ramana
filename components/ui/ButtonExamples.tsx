import { Button } from "./Button";
import { Download, Trash2, Plus, Edit } from "lucide-react";

export default function ButtonExamples() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="success">Success</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Button States</h3>
        <div className="flex flex-wrap gap-4">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button fullWidth>Full Width</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Buttons with Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
