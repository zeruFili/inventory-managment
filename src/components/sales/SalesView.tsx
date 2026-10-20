import React, { useState, useMemo } from "react";
import { SalesOrder } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import SalesOrderModal from "./SalesOrderModal";

export const SalesView: React.FC = () => {
  const { salesOrders, fulfillSalesOrder, can, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  const totalSalesRevenue = salesOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalGrossProfit = salesOrders.reduce((acc, o) => acc + o.grossProfit, 0);

  const filteredOrders = useMemo(() => {
    return salesOrders.filter((o) => {
      if (activeTab === "Quotations" && o.orderStatus !== "Quotation") return false;
      if (activeTab === "Confirmed" && o.orderStatus !== "Confirmed") return false;
      if (activeTab === "Fulfilled" && o.orderStatus !== "Fulfilled") return false;

      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.invoiceNumber.toLowerCase().includes(q) ||
        o.items.some((i) => i.materialName.toLowerCase().includes(q) || i.materialCode.toLowerCase().includes(q))
      );
    });
  }, [salesOrders, activeTab, search]);

  const handleFulfill = (orderId: string) => {
    fulfillSalesOrder(orderId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            SALES & ORDER MANAGEMENT
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            Direct Sales & Quotations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Process direct equipment sales, calculate gross margins, fulfill orders, and update stock availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can("manage_sales") && (
            <button
              onClick={() => setIsSalesModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-950 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <Icon name="plus" size={14} />
              New Sales Order
            </button>
          )}
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
            TOTAL SALES REVENUE
          </span>
          <strong className="text-2xl font-bold text-gray-900 font-display mt-1 block">
            ${totalSalesRevenue.toLocaleString()}
          </strong>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Across {salesOrders.length} completed & confirmed orders
          </span>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
            ACCUMULATED GROSS PROFIT
          </span>
          <strong className="text-2xl font-bold text-emerald-950 font-display mt-1 block">
            +${totalGrossProfit.toLocaleString()}
          </strong>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Margin: {Math.round((totalGrossProfit / (totalSalesRevenue || 1)) * 100)}% profit margin
          </span>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 shadow-2xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
            OPEN FULFILLMENT QUEUE
          </span>
          <strong className="text-2xl font-bold text-amber-950 font-display mt-1 block">
            {salesOrders.filter((o) => o.orderStatus === "Confirmed").length} Orders
          </strong>
          <span className="text-[11px] text-amber-800 font-semibold mt-1 block">
            Awaiting dispatch & stock deduction
          </span>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {["All", "Confirmed", "Quotations", "Fulfilled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative sm:w-80">
            <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sales orders, invoices, or products..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Order & Invoice #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Items Purchased</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Gross Profit</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-3 px-4">
                    <strong className="text-xs font-bold text-gray-900 block font-mono">{order.orderNumber}</strong>
                    <span className="text-[10px] text-gray-400 font-mono">{order.invoiceNumber}</span>
                  </td>

                  <td className="py-3 px-3 font-bold text-gray-900">{order.customerName}</td>

                  <td className="py-3 px-3 text-gray-500 font-medium">{order.orderDate}</td>

                  <td className="py-3 px-3">
                    <span className="text-gray-900 font-bold block">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                    </span>
                    <span className="text-[10px] text-gray-500 line-clamp-1">
                      {order.items.map((i) => `${i.quantity}x ${i.materialName}`).join(", ")}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-gray-900 font-display">${order.totalAmount}</td>

                  <td className="py-3 px-3">
                    <strong className="text-emerald-700 font-bold font-display block">+${order.grossProfit}</strong>
                    <span className="text-[9px] text-gray-400">
                      {Math.round((order.grossProfit / (order.subtotal || 1)) * 100)}% margin
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <Badge tone={order.paymentStatus === "Paid" ? "green" : "yellow"} size="sm">
                      {order.paymentStatus}
                    </Badge>
                  </td>

                  <td className="py-3 px-3">
                    <Badge
                      tone={
                        order.orderStatus === "Fulfilled"
                          ? "green"
                          : order.orderStatus === "Confirmed"
                          ? "yellow"
                          : "gray"
                      }
                      size="sm"
                    >
                      {order.orderStatus}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {order.orderStatus === "Confirmed" && can("manage_sales") ? (
                      <button
                        onClick={() => handleFulfill(order.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-md transition-colors shadow-2xs"
                        title="Fulfill order & deduct physical inventory"
                      >
                        Fulfill Order
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              ))}

              {!filteredOrders.length && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <Icon name="cart" size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                    <strong className="block text-gray-700">No sales orders found</strong>
                    <span className="text-xs">Create a new sales order to begin direct sales.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <SalesOrderModal
        isOpen={isSalesModalOpen}
        onClose={() => setIsSalesModalOpen(false)}
      />
    </div>
  );
};

export default SalesView;
