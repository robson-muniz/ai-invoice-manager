import * as React from "react"

const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className = "", ...props }, ref) => (
  <div className="overflow-x-auto">
    <table
      ref={ref}
      className={`w-full text-sm border-collapse ${className}`}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.TableHTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => (
  <thead ref={ref} className={`bg-gray-50 ${className}`} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.TableHTMLAttributes<HTMLTableSectionElement>
>(({ className = "", ...props }, ref) => (
  <tbody ref={ref} className={className} {...props} />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.TableHTMLAttributes<HTMLTableRowElement>
>(({ className = "", ...props }, ref) => (
  <tr
    ref={ref}
    className={`border-b border-gray-200 hover:bg-gray-50 ${className}`}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.TableHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => (
  <th
    ref={ref}
    className={`px-4 py-2 text-left font-semibold text-gray-700 ${className}`}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TableHTMLAttributes<HTMLTableCellElement>
>(({ className = "", ...props }, ref) => (
  <td ref={ref} className={`px-4 py-2 ${className}`} {...props} />
))
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
