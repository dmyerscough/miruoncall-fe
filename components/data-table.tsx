'use client'

import { useMemo, useEffect, useState, useId, useRef } from 'react'
import { LiaStickyNoteSolid } from 'react-icons/lia'

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
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconCircleCheckFilled,
    IconGripVertical,
    IconLoader,
} from '@tabler/icons-react'
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
} from '@tanstack/react-table'

import { incidentSchema } from '@/lib/schemas/incidents'

import { z } from 'zod'

import { useIsMobile } from '@/hooks/use-mobile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Textarea } from './ui/textarea'

import nextConfig from '@/next.config'

const { publicRuntimeConfig } = nextConfig

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
    const { attributes, listeners } = useSortable({
        id,
    })

    return (
        <Button {...attributes} {...listeners} variant="ghost" size="icon" className="text-muted-foreground size-7 hover:bg-transparent">
            <IconGripVertical className="text-muted-foreground size-3" />
            <span className="sr-only">Drag to reorder</span>
        </Button>
    )
}

const createColumns = (teamId: string): ColumnDef<z.infer<typeof incidentSchema>>[] => [
    {
        id: 'drag',
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
        minSize: 15,
        maxSize: 15,
    },
    {
        id: 'select',
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        minSize: 20,
        maxSize: 20,
    },
    {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => {
            return (
                <div className="min-w-0 w-full">
                    <TableCellViewer item={row.original} teamId={teamId} />
                </div>
            )
        },
        enableHiding: false,
    },
    {
        accessorKey: 'triggered',
        header: 'Triggered',
        cell: ({ row }) => {
            const date = new Date(row.original.created_at)
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
            return (
                <div className="w-24">
                    <Badge variant="outline" className="text-muted-foreground px-1.5 text-xs whitespace-nowrap">
                        {formattedDate}
                    </Badge>
                </div>
            )
        },
        minSize: 90,
        maxSize: 90,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <div className="w-[110px]">
                <Badge variant="outline" className="text-muted-foreground px-1.5 gap-1 whitespace-nowrap">
                    {row.original.status === 'resolved' ? (
                        <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 size-3 shrink-0" />
                    ) : row.original.status === 'acknowledged' ? (
                        <IconLoader className="fill-yellow-500 dark:fill-yellow-400 size-3 shrink-0" />
                    ) : (
                        <IconLoader className="fill-red-500 dark:fill-red-400 size-3 shrink-0" />
                    )}
                    <span className="capitalize">{row.original.status}</span>
                </Badge>
            </div>
        ),
        minSize: 80,
        maxSize: 80,
    },
    {
        accessorKey: 'urgency',
        header: 'Urgency',
        cell: ({ row }) => (
            <div className="w-16">
                <Badge variant={row.original.urgency === 'high' ? 'destructive' : 'secondary'} className="px-1.5 capitalize whitespace-nowrap">
                    {row.original.urgency}
                </Badge>
            </div>
        ),
        minSize: 50,
        maxSize: 50,
    },
    {
        accessorKey: 'annotation',
        header: 'Notes',
        cell: ({ row }) => <div className="w-14">{row.original.annotation ? <LiaStickyNoteSolid /> : null}</div>,
        minSize: 40,
        maxSize: 40,
    },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof incidentSchema>> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && 'selected'}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell
                    key={cell.id}
                    style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize,
                    }}
                >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

interface DataTableProps {
    data: z.infer<typeof incidentSchema>[]
    urgencyFilter?: 'high' | 'low' | null
    teamId: string
}

export function DataTable({ data: initialData, urgencyFilter, teamId }: DataTableProps) {
    const [data, setData] = useState(() => initialData)
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const sortableId = useId()
    const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))

    const columns = useMemo(() => createColumns(teamId), [teamId])
    const dataIds = useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data])

    // Sync internal data state when initialData prop changes
    useEffect(() => {
        setData(initialData)
    }, [initialData])

    useEffect(() => {
        if (urgencyFilter) {
            setColumnFilters((prev) => {
                const otherFilters = prev.filter((filter) => filter.id !== 'urgency')
                return [...otherFilters, { id: 'urgency', value: urgencyFilter }]
            })
        } else {
            setColumnFilters((prev) => prev.filter((filter) => filter.id !== 'urgency'))
        }
    }, [urgencyFilter])

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
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
        defaultColumn: {
            minSize: 50,
            maxSize: 500,
        },
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
        <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
            <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <div className="overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <DndContext
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                            onDragEnd={handleDragEnd}
                            sensors={sensors}
                            id={sortableId}
                        >
                            <Table style={{ minWidth: '700px' }}>
                                <TableHeader className="bg-muted sticky top-0 z-10">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead
                                                        key={header.id}
                                                        colSpan={header.colSpan}
                                                        style={{
                                                            width: header.getSize(),
                                                            minWidth: header.column.columnDef.minSize,
                                                            maxWidth: header.column.columnDef.maxSize,
                                                        }}
                                                    >
                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </TableHead>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                                            {table.getRowModel().rows.map((row) => (
                                                <DraggableRow key={row.id} row={row} />
                                            ))}
                                        </SortableContext>
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </DndContext>
                    </div>
                </div>
                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
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
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
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
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
                            <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
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
            <TabsContent value="past-performance" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
            <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
            <TabsContent value="focus-documents" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
        </Tabs>
    )
}

function TableCellViewer({ item, teamId }: { item: z.infer<typeof incidentSchema>; teamId: string }) {
    const isMobile = useIsMobile()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // TODO(damian): Show a progress bar / toast when the annotation has been updated
    const saveAnnotation = async (annotation: string, incidentId: string, teamId: string) => {
        const req = await fetch(`${publicRuntimeConfig?.apiBackend}/api/v1/incident/${incidentId}_${teamId}/annotation`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ annotation: annotation }),
        })

        const resp = await req.json()

        if (!req.ok) {
            console.error('Error saving annotation:', resp)
            return
        }
    }

    return (
        <Drawer direction={isMobile ? 'bottom' : 'right'}>
            <DrawerTrigger asChild>
                <Button variant="link" className="text-foreground w-full px-0 text-left h-auto justify-start min-w-0">
                    <span className="truncate block w-full" title={item.title}>
                        {item.title}
                    </span>
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>{item.title}</DrawerTitle>
                    <DrawerDescription>Incident Details - {item.incident_id}</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    <div className="grid gap-2">
                        <div className="flex gap-2 leading-none font-medium">
                            Status: {item.status} | Urgency: {item.urgency}
                        </div>
                        <div className="text-muted-foreground">{item.description}</div>
                    </div>
                    <Separator />
                    <form className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" ref={textareaRef} defaultValue={item.annotation ? item.annotation.summary : ''} />
                        </div>
                    </form>
                </div>
                <DrawerFooter>
                    <Button
                        onClick={() => {
                            saveAnnotation(textareaRef?.current?.value || '', item.incident_id, teamId)
                        }}
                    >
                        Submit
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Done</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
