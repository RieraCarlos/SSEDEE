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
    IconTrendingUp,
} from "@tabler/icons-react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type Row,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { z } from "zod"
import type { DisciplineConfig } from "@/core/disciplines"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
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

// Schema remains for basic structure, but columns will be dynamic
const baseSchema = z.object({
    id: z.number(),
    nameClub: z.string(),
    puntos: z.number().optional(),
    dg: z.number().optional(),
    pj: z.number().optional(),
    ganados: z.number().optional(),
    perdidos: z.number().optional(),
    sets_ganados: z.number().optional(),
    sets_perdidos: z.number().optional(),
    mejor_tiempo: z.string().optional(),
    posicion: z.number().optional(),
})

type StandingItem = z.infer<typeof baseSchema> & Record<string, any>;

function DraggableRow({ row }: { row: Row<z.infer<typeof baseSchema>> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 border-gray-700 hover:bg-[#1d2029]"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-white">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

export default function PosicionesTable({
    data: initialData = [],
    config
}: {
    data?: StandingItem[],
    config?: DisciplineConfig | null
}) {
    const [data, setData] = React.useState(() => initialData)
    
    const columns = React.useMemo<ColumnDef<StandingItem>[]>(() => {
        const cols: ColumnDef<StandingItem>[] = [
            {
                id: "drag",
                header: () => null,
                cell: ({ row }) => <span className="text-gray-500">#{row.index + 1}</span>,
            },
            {
                accessorKey: "nameClub",
                header: config?.layoutMode === 'participants' ? "Participantes" : "Equipos",
                cell: ({ row }) => <TableCellViewer item={row.original} config={config} />,
                enableHiding: false,
            }
        ];

        if (config?.standingsLayout) {
            config.standingsLayout.columnIds.forEach((colId: string) => {
                const labelMap: Record<string, string> = {
                    'puntos': 'PTS',
                    'pj': 'PJ',
                    'dg': 'DG',
                    'ganados': 'G',
                    'perdidos': 'P',
                    'sets_ganados': 'SG',
                    'sets_perdidos': 'SP',
                    'mejor_tiempo': 'TIEMPO',
                    'posicion': 'POS'
                };
                
                cols.push({
                    accessorKey: colId,
                    header: labelMap[colId] || colId.toUpperCase(),
                    cell: ({ row }) => (
                        <div className={`w-auto ${colId === 'puntos' ? 'font-bold text-emerald-400' : 'text-gray-300'}`}>
                            {row.original[colId] ?? '-'}
                        </div>
                    ),
                });
            });
        } else {
            // Default (Football) if no config
            ['puntos', 'dg', 'pj'].forEach(col => {
                cols.push({
                    accessorKey: col,
                    header: col.toUpperCase(),
                    cell: ({ row }) => (
                        <div className={`w-auto ${col === 'puntos' ? 'font-bold text-emerald-400' : 'text-gray-300'}`}>
                            {row.original[col] ?? '-'}
                        </div>
                    ),
                });
            });
        }

        return cols;
    }, [config]);
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([
        {
            id: 'puntos',
            desc: true,
        },
    ])
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
            className="w-full flex-col justify-start gap-6 text-white bg-[#13161c]"
        >
            <TabsContent
                value="outline"
                className="relative flex flex-col gap-4 overflow-auto"
            >
                <div className="overflow-hidden rounded-lg border-none">
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}
                    >
                        <Table>
                            <TableHeader className="bg-[#1d2029] sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-gray-700 hover:bg-[#1d2029]">
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} colSpan={header.colSpan} className="text-white font-bold">
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
                                            className="h-24 text-center text-gray-400"
                                        >
                                            No hay resultados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>
            </TabsContent>
        </Tabs>
    )
}

const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--primary)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--primary)",
    },
} satisfies ChartConfig

function TableCellViewer({ item, config }: { item: StandingItem, config?: DisciplineConfig | null }) {
    const isMobile = useIsMobile()

    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <Button variant="link" className="w-fit px-0 text-left text-white hover:text-emerald-400">
                    {item.nameClub}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-[#13161c] border-gray-700 text-white">
                <DrawerHeader className="gap-1">
                    <DrawerTitle>{item.nameClub}</DrawerTitle>
                    <DrawerDescription className="text-gray-400">
                        Estadísticas detalladas del equipo
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    {!isMobile && (
                        <>
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <AreaChart
                                    accessibilityLayer
                                    data={chartData}
                                    margin={{
                                        left: 0,
                                        right: 10,
                                    }}
                                >
                                    <CartesianGrid vertical={false} stroke="#374151" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                        hide
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Area
                                        dataKey="mobile"
                                        type="natural"
                                        fill="var(--color-mobile)"
                                        fillOpacity={0.6}
                                        stroke="var(--color-mobile)"
                                        stackId="a"
                                    />
                                    <Area
                                        dataKey="desktop"
                                        type="natural"
                                        fill="var(--color-desktop)"
                                        fillOpacity={0.4}
                                        stroke="var(--color-desktop)"
                                        stackId="a"
                                    />
                                </AreaChart>
                            </ChartContainer>
                            <Separator className="bg-gray-700" />
                            <div className="grid gap-2">
                                <div className="flex gap-2 leading-none font-medium text-emerald-400">
                                    Trending up by 5.2% this month{" "}
                                    <IconTrendingUp className="size-4" />
                                </div>
                            </div>
                            <Separator className="bg-gray-700" />
                        </>
                    )}
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            {config?.standingsLayout.columnIds.map((colId: string) => (
                                <div key={colId} className="flex flex-col gap-2">
                                    <span className="text-gray-400 capitalize">{colId.replace('_', ' ')}</span>
                                    <span className={`text-xl font-bold ${colId === 'puntos' ? 'text-emerald-400' : ''}`}>
                                        {item[colId] ?? '-'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">Cerrar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
