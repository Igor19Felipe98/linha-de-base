'use client'

import * as React from "react"
import { MonthlyData } from "@/lib/services/monthly-analytics"

interface HousesCompletedTableProps {
  monthlyData: MonthlyData[]
}

export function HousesCompletedTable({ monthlyData }: HousesCompletedTableProps) {
  // Filtrar apenas meses com casas finalizadas
  const monthsWithCompletions = monthlyData.filter(month => month.housesCompleted > 0)
  const totalCompleted = monthsWithCompletions.reduce((sum, month) => sum + month.housesCompleted, 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-industrial-primary text-white">
            <th className="border border-gray-300 px-4 py-2 text-left">Mês</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Casas Finalizadas</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Acumulado</th>
          </tr>
        </thead>
        <tbody>
          {monthsWithCompletions.map((month, index) => {
            const accumulated = monthlyData
              .filter((_, originalIndex) => originalIndex <= monthlyData.indexOf(month))
              .reduce((sum, m) => sum + m.housesCompleted, 0)
            
            return (
              <tr key={month.monthKey} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {month.month} {month.year}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {month.housesCompleted}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                  {accumulated}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td className="border border-gray-300 px-4 py-2">Total</td>
            <td className="border border-gray-300 px-4 py-2 text-center">{totalCompleted}</td>
            <td className="border border-gray-300 px-4 py-2 text-center">{totalCompleted}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}