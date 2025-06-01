"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconGripVertical,
  IconLoader,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import { incidentSchema } from "@/lib/schemas/incidents"

import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"


// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<z.infer<typeof incidentSchema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {new Date(row.original.created_at).toLocaleDateString()}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "resolved" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : row.original.status === "acknowledged" ? (
          <IconLoader className="fill-yellow-500 dark:fill-yellow-400" />
        ) : (
          <IconLoader className="fill-red-500 dark:fill-red-400" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "urgency",
    header: "Urgency",
    cell: ({ row }) => (
      <Badge variant={row.original.urgency === "high" ? "destructive" : "secondary"} className="px-1.5">
        {row.original.urgency}
      </Badge>
    ),
  },
  {
    accessorKey: "annotation",
    header: "Notes",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.annotation ? "Yes" : "No"}
      </Badge>
    ),
  }
]

function DraggableRow({ row }: { row: Row<z.infer<typeof incidentSchema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof incidentSchema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

const chartData = {
  "incidents": [
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Tue, 27 May 2025 00:12:31 GMT",
      "description": "[FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)",
      "id": 14388,
      "incident_id": "Q0WHRE9UJ5ERON",
      "status": "resolved",
      "summary": "[#7559400] [FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Tue, 27 May 2025 14:17:31 GMT",
      "description": "[FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-1 warning dgxc_observability)",
      "id": 14410,
      "incident_id": "Q1F6PL9SVWDGXX",
      "status": "resolved",
      "summary": "[#7560702] [FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-1 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] gcp-us-central1-dca-wl-lab-003 config-reloader (ContainerHighThrottleRate alloy-cluster-1 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Tue, 27 May 2025 15:27:14 GMT",
      "description": "[FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-58b747d546-c6d52 otel-gateway critical dgxc_observability)",
      "id": 14412,
      "incident_id": "Q01WJ5A5ZI2WIK",
      "status": "resolved",
      "summary": "[#7560804] [FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-58b747d546-c6d52 otel-gateway critical dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-58b747d546-c6d52 otel-gateway critical dgxc_observability)",
      "urgency": "high"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Tue, 27 May 2025 16:09:29 GMT",
      "description": "[FIRING:1] dgxc-us-east-1-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-98-194.ec2.internal kubelet telemetry ip-100-65-98-194.ec2.internal NSPECT-A87B-PMQV storage-mimir-store-gateway-us-east-1a-37 warning dgxc_observability)",
      "id": 14415,
      "incident_id": "Q1CVZYZBVJDBKU",
      "status": "resolved",
      "summary": "[#7560890] [FIRING:1] dgxc-us-east-1-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-98-194.ec2.internal kubelet telemetry ip-100-65-98-194.ec2.internal NSPECT-A87B-PMQV storage-mimir-store-gateway-us-east-1a-37 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-east-1-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-98-194.ec2.internal kubelet telemetry ip-100-65-98-194.ec2.internal NSPECT-A87B-PMQV storage-mimir-store-gateway-us-east-1a-37 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Tue, 27 May 2025 16:50:02 GMT",
      "description": "[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)",
      "id": 14417,
      "incident_id": "Q27G4H0GZVI6Q1",
      "status": "resolved",
      "summary": "[#7560974] [FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Tue, 27 May 2025 17:37:31 GMT",
      "description": "[FIRING:1] dgxc-us-east-1-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm mimir-store-gateway opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)",
      "id": 14419,
      "incident_id": "Q20AAULVYZY78B",
      "status": "resolved",
      "summary": "[#7561050] [FIRING:1] dgxc-us-east-1-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm mimir-store-gateway opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-east-1-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm mimir-store-gateway opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Tue, 27 May 2025 23:33:17 GMT",
      "description": "[FIRING:2]  (MimirRolloutStuck dgxc-us-east-1-aws-prod-001 kube-state-metrics http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV mimir opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability statefulset)",
      "id": 14421,
      "incident_id": "Q2OAAH7YB644G8",
      "status": "resolved",
      "summary": "[#7561995] [FIRING:2]  (MimirRolloutStuck dgxc-us-east-1-aws-prod-001 kube-state-metrics http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV mimir opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability statefulset)",
      "team": 98,
      "title": "[FIRING:2]  (MimirRolloutStuck dgxc-us-east-1-aws-prod-001 kube-state-metrics http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV mimir opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-47pbm opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability statefulset)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": {
        "created_at": "Thu, 29 May 2025 06:37:19 GMT",
        "summary": "Test annotation"
      },
      "created_at": "Tue, 27 May 2025 23:49:14 GMT",
      "description": "[FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-59ffc5495b-8bs8q otel-gateway critical dgxc_observability)",
      "id": 14424,
      "incident_id": "Q19JSYBG5MNVP4",
      "status": "resolved",
      "summary": "[#7562054] [FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-59ffc5495b-8bs8q otel-gateway critical dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (OtelGatewayReceiverRefusedMetrics dgxc-us-west-2-aws-prod-001 otel metrics-otel-gateway-59ffc5495b-8bs8q otel-gateway critical dgxc_observability)",
      "urgency": "high"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 00:33:10 GMT",
      "description": "We need tcarr/DGXOBSERV-1713 deployed ",
      "id": 14426,
      "incident_id": "Q1URVGSZJB2TD0",
      "status": "acknowledged",
      "summary": "[#7562186] We need tcarr/DGXOBSERV-1713 deployed ",
      "team": 98,
      "title": "We need tcarr/DGXOBSERV-1713 deployed ",
      "urgency": "high"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 06:04:29 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)",
      "id": 107685,
      "incident_id": "Q0VU1E0675G9QC",
      "status": "resolved",
      "summary": "[#7562759] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 06:04:31 GMT",
      "description": "[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)",
      "id": 107690,
      "incident_id": "Q1HAKHDERVTYWY",
      "status": "resolved",
      "summary": "[#7562760] [FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 07:54:29 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)",
      "id": 107693,
      "incident_id": "Q33I9YPYGH0CZK",
      "status": "resolved",
      "summary": "[#7562956] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-250-100.us-west-2.compute.internal kubelet telemetry ip-100-65-250-100.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-0 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 07:54:37 GMT",
      "description": "[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)",
      "id": 107696,
      "incident_id": "Q197ET7M15DG6C",
      "status": "resolved",
      "summary": "[#7562957] [FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-0 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 08:37:29 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 warning dgxc_observability)",
      "id": 107698,
      "incident_id": "Q2AXIZCT4CVH2I",
      "status": "resolved",
      "summary": "[#7563029] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 08:37:31 GMT",
      "description": "[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-1 warning dgxc_observability)",
      "id": 107700,
      "incident_id": "Q17QYIEZO8DZJ3",
      "status": "resolved",
      "summary": "[#7563030] [FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-1 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-1 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 08:45:30 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 critical dgxc_observability)",
      "id": 107702,
      "incident_id": "Q35MFH1623SMS7",
      "status": "resolved",
      "summary": "[#7563041] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 critical dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-148-15.us-west-2.compute.internal kubelet telemetry ip-100-65-148-15.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-1 critical dgxc_observability)",
      "urgency": "high"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 20:01:31 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)",
      "id": 107704,
      "incident_id": "Q2ZVCNI72JEQGI",
      "status": "resolved",
      "summary": "[#7564209] [FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 20:09:29 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighMemoryUtilization tempo-metrics-generator-2 critical dgxc_observability)",
      "id": 107705,
      "incident_id": "Q20J6SV8C4PJFW",
      "status": "resolved",
      "summary": "[#7564220] [FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighMemoryUtilization tempo-metrics-generator-2 critical dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighMemoryUtilization tempo-metrics-generator-2 critical dgxc_observability)",
      "urgency": "high"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 20:13:33 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PodContainerOutOfMemory tempo-metrics critical dgxc_observability)",
      "id": 107708,
      "incident_id": "Q2I0VCG3NMWAIS",
      "status": "resolved",
      "summary": "[#7564245] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PodContainerOutOfMemory tempo-metrics critical dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PodContainerOutOfMemory tempo-metrics critical dgxc_observability)",
      "urgency": "high"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 20:25:30 GMT",
      "description": "[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (PodContainerWaitingDueToImageOrCrashIssues http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV tempo-metrics-generator-2 CrashLoopBackOff opentelemetry-kube-stack-kube-state-metrics critical dgxc_observability 01ab9a2c-895f-4365-a530-33e7a7cd9935)",
      "id": 107710,
      "incident_id": "Q08MNCGVW8EMOS",
      "status": "resolved",
      "summary": "[#7564264] [FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (PodContainerWaitingDueToImageOrCrashIssues http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV tempo-metrics-generator-2 CrashLoopBackOff opentelemetry-kube-stack-kube-state-metrics critical dgxc_observability 01ab9a2c-895f-4365-a530-33e7a7cd9935)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (PodContainerWaitingDueToImageOrCrashIssues http 100.65.181.169:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV tempo-metrics-generator-2 CrashLoopBackOff opentelemetry-kube-stack-kube-state-metrics critical dgxc_observability 01ab9a2c-895f-4365-a530-33e7a7cd9935)",
      "urgency": "high"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 20:27:30 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighPodRestartRate tempo-metrics-generator-1 critical dgxc_observability)",
      "id": 107712,
      "incident_id": "Q3OYSFU6Y9ZAGM",
      "status": "resolved",
      "summary": "[#7564267] [FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighPodRestartRate tempo-metrics-generator-1 critical dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 metrics-generator (HighPodRestartRate tempo-metrics-generator-1 critical dgxc_observability)",
      "urgency": "high"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 20:43:31 GMT",
      "description": "[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-0 warning dgxc_observability)",
      "id": 107714,
      "incident_id": "Q1KLCKJBQ699Y0",
      "status": "resolved",
      "summary": "[#7564280] [FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-0 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-0 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 20:49:31 GMT",
      "description": "[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-2 warning dgxc_observability)",
      "id": 107719,
      "incident_id": "Q0DZ4K7B22D9J1",
      "status": "resolved",
      "summary": "[#7564290] [FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-2 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-east-1-aws-prod-001 metrics-generator (ContainerHighThrottleRate tempo-metrics-generator-2 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Wed, 28 May 2025 22:58:32 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)",
      "id": 107721,
      "incident_id": "Q24C9C5AQAY0HV",
      "status": "resolved",
      "summary": "[#7564605] [FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 alloy (ContainerHighThrottleRate alloy-cluster-0 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Thu, 29 May 2025 13:43:29 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 warning dgxc_observability)",
      "id": 108966,
      "incident_id": "Q1BX4Y7O1E0LHL",
      "status": "resolved",
      "summary": "[#7566262] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove80Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Thu, 29 May 2025 13:43:31 GMT",
      "description": "[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-2 warning dgxc_observability)",
      "id": 108967,
      "incident_id": "Q08PHH9U8N8EB6",
      "status": "resolved",
      "summary": "[#7566263] [FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-2 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (MimirCompactorAboutToRunOutOfDiskSpace dgxc-us-west-2-aws-prod-001 mimir storage-mimir-compactor-2 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Thu, 29 May 2025 13:57:29 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 critical dgxc_observability)",
      "id": 108969,
      "incident_id": "Q10X07WGW3CB12",
      "status": "resolved",
      "summary": "[#7566279] [FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 critical dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 (PVCUtilizationAbove90Pct ip-100-65-113-153.us-west-2.compute.internal kubelet telemetry ip-100-65-113-153.us-west-2.compute.internal NSPECT-A87B-PMQV storage-mimir-compactor-2 critical dgxc_observability)",
      "urgency": "high"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Thu, 29 May 2025 18:11:30 GMT",
      "description": "[FIRING:1] dgxc-us-west-2-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.137.197:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-69xf5 mimir-ingester opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)",
      "id": 108971,
      "incident_id": "Q0NF7NFN5WFIOX",
      "status": "resolved",
      "summary": "[#7566779] [FIRING:1] dgxc-us-west-2-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.137.197:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-69xf5 mimir-ingester opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-us-west-2-aws-prod-001 kube-state-metrics (PodDisruptionBudgetViolation http 100.65.137.197:8080 kube-state-metrics telemetry NSPECT-A87B-PMQV opentelemetry-kube-stack-kube-state-metrics-75c7c488bb-69xf5 mimir-ingester opentelemetry-kube-stack-kube-state-metrics warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Thu, 29 May 2025 20:24:16 GMT",
      "description": "[FIRING:1]  (MimirCacheRequestErrors dgxc-us-east-1-aws-prod-001 index-cache telemetry set mimir warning dgxc_observability)",
      "id": 108972,
      "incident_id": "Q2GI3N9WSKWU71",
      "status": "resolved",
      "summary": "[#7567138] [FIRING:1]  (MimirCacheRequestErrors dgxc-us-east-1-aws-prod-001 index-cache telemetry set mimir warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (MimirCacheRequestErrors dgxc-us-east-1-aws-prod-001 index-cache telemetry set mimir warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Fri, 30 May 2025 09:15:03 GMT",
      "description": "[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)",
      "id": 110243,
      "incident_id": "Q0ID0O2R64KEAJ",
      "status": "resolved",
      "summary": "[#7568767] [FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Fri, 30 May 2025 15:28:03 GMT",
      "description": "[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)",
      "id": 110245,
      "incident_id": "Q0TLSX5XCB0X99",
      "status": "resolved",
      "summary": "[#7569274] [FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (DatasourceInFlightRequests dgxc-us-east-1-aws-prod-002 grafana mimiruseast1 prometheus service 100.65.43.111:3000 grafana-spg telemetry NSPECT-A87B-PMQV grafana grafana-spg-6bbfd6cb79-wnrmx false grafana-spg warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Fri, 30 May 2025 16:30:32 GMT",
      "description": "[FIRING:1] dgxc-ap-northeast-1-aws-prod-001 compactor (ContainerHighThrottleRate mimir-compactor-0 warning dgxc_observability)",
      "id": 110248,
      "incident_id": "Q3YFEOPO5MLB9E",
      "status": "resolved",
      "summary": "[#7569392] [FIRING:1] dgxc-ap-northeast-1-aws-prod-001 compactor (ContainerHighThrottleRate mimir-compactor-0 warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1] dgxc-ap-northeast-1-aws-prod-001 compactor (ContainerHighThrottleRate mimir-compactor-0 warning dgxc_observability)",
      "urgency": "low"
    },
    {
      "actionable": null,
      "annotation": null,
      "created_at": "Fri, 30 May 2025 21:24:02 GMT",
      "description": "[FIRING:1]  (FailedNotificationRequest dgxc-us-east-1-aws-prod-002 grafana service 100.65.7.106:3000 slack grafana-spg telemetry NSPECT-A87B-PMQV 4 grafana grafana-spg-6bbfd6cb79-mnjn7 grafana-spg warning dgxc_observability)",
      "id": 110251,
      "incident_id": "Q13SH0XE1MCQXI",
      "status": "resolved",
      "summary": "[#7570087] [FIRING:1]  (FailedNotificationRequest dgxc-us-east-1-aws-prod-002 grafana service 100.65.7.106:3000 slack grafana-spg telemetry NSPECT-A87B-PMQV 4 grafana grafana-spg-6bbfd6cb79-mnjn7 grafana-spg warning dgxc_observability)",
      "team": 98,
      "title": "[FIRING:1]  (FailedNotificationRequest dgxc-us-east-1-aws-prod-002 grafana service 100.65.7.106:3000 slack grafana-spg telemetry NSPECT-A87B-PMQV 4 grafana grafana-spg-6bbfd6cb79-mnjn7 grafana-spg warning dgxc_observability)",
      "urgency": "low"
    }
  ],
  "summary": {
    "2025-05-25": {
      "high": 0,
      "low": 0
    },
    "2025-05-26": {
      "high": 0,
      "low": 0
    },
    "2025-05-27": {
      "high": 2,
      "low": 6
    },
    "2025-05-28": {
      "high": 6,
      "low": 10
    },
    "2025-05-29": {
      "high": 1,
      "low": 4
    },
    "2025-05-30": {
      "high": 0,
      "low": 4
    },
    "2025-05-31": {
      "high": 0,
      "low": 0
    }
  },
  "team": {
    "alias": null,
    "created_at": "2025-05-28T05:11:24",
    "id": 98,
    "last_checked": "2025-06-01T06:12:45.616871",
    "name": "DGXCloud Observability (Panoptes)",
    "summary": "DGXCloud Observability (Panoptes)",
    "team_id": "PJ1BDNM"
  }
}

function TableCellViewer({ item }: { item: z.infer<typeof incidentSchema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.title}</DrawerTitle>
          <DrawerDescription>
            Incident Details - {item.incident_id}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="grid gap-2">
            <div className="flex gap-2 leading-none font-medium">
              Status: {item.status} | Urgency: {item.urgency}
            </div>
            <div className="text-muted-foreground">
              {item.description}
            </div>
          </div>
          <Separator />
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="title">Title</Label>
              <Input id="title" defaultValue={item.title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="triggered">Triggered</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="urgency">Urgency</Label>
                <Select defaultValue={item.urgency}>
                  <SelectTrigger id="urgency" className="w-full">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Description</Label>
              <Input id="description" defaultValue={item.description} />
            </div>
            {item.annotation && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="annotation">Annotation</Label>
                <Input id="annotation" defaultValue={item.annotation.summary} />
              </div>
            )}
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
