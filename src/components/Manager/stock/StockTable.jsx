import { Plus, Minus, Trash2 } from "lucide-react";
import StockStatusBadge from "./StockStatusBadge";

export default function StockTable({
    stocks = [],
    onIncrease,
    onDecrease,
    onChangeStock,
    onUpdate,
    onDelete,
}) {

    return (
        <section className="bg-white rounded-2xl shadow-sm p-6">

            <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-800">
                    Stock Management
                </h2>

                <p className="text-sm text-gray-500">
                    รายการสินค้าและจำนวนคงเหลือ
                </p>
            </div>


            <div className="overflow-x-auto">

                <table className="w-full text-sm">

                    <thead>
                        <tr className="border-b text-gray-500">

                            <th className="py-3 text-left">#</th>

                            <th className="py-3 text-left">
                                สินค้า
                            </th>

                            <th className="py-3 text-center">
                                จำนวน
                            </th>

                            <th className="py-3 text-center">
                                หน่วย
                            </th>

                            <th className="py-3 text-center">
                                สถานะ
                            </th>

                            <th className="py-3 text-right">
                                อัปเดตล่าสุด
                            </th>

                            <th className="py-3 text-center">
                                จัดการ
                            </th>

                        </tr>
                    </thead>


                    <tbody>

                        {stocks.length > 0 ? (

                            stocks.map((item,index)=>(

                                <tr
                                    key={item.id}
                                    className="border-b last:border-none hover:bg-gray-50"
                                >

                                    <td className="py-4 font-semibold text-gray-700">
                                        {index+1}
                                    </td>


                                    <td className="py-4 font-medium text-gray-800">
                                        {item.name}
                                    </td>


                                    <td className="py-4">

                                        <div className="flex items-center justify-center gap-3">

                                            <button
                                                onClick={()=>onDecrease?.(item.id,1)}
                                                className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-100"
                                            >
                                                <Minus size={15}/>
                                            </button>


                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e)=>onChangeStock?.(
                                                    item.id,
                                                    Number(e.target.value)
                                                )}
                                                onBlur={()=>onUpdate?.(
                                                    item.id,
                                                    item.quantity
                                                )}
                                                className="w-16 text-center font-semibold text-gray-800 px-2 py-1 outline-none"
                                            />


                                            <button
                                                onClick={()=>onIncrease?.(item.id,1)}
                                                className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-100"
                                            >
                                                <Plus size={15}/>
                                            </button>

                                        </div>

                                    </td>


                                    <td className="py-4 text-center text-gray-600">
                                        {item.unit || "ชิ้น"}
                                    </td>


                                    <td className="py-4 text-center">

                                        <StockStatusBadge
                                            stock_quantity={item.quantity}
                                            minimum_stock={item.minimum_stock}
                                        />

                                    </td>


                                    <td className="py-4 text-right text-gray-500">

                                        {item.updated_at
                                            ? new Date(item.updated_at).toLocaleString("th-TH")
                                            : "-"}

                                    </td>


                                    <td className="py-4 text-center">

                                        <button
                                            onClick={()=>{
                                                if(window.confirm("ต้องการลบสินค้านี้ใช่ไหม?")){
                                                    onDelete?.(item.id);
                                                }
                                            }}
                                            className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center mx-auto"
                                        >
                                            <Trash2 size={16}/>
                                        </button>

                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr>
                                <td
                                    colSpan="7"
                                    className="py-8 text-center text-gray-400"
                                >
                                    ไม่มีข้อมูล Stock
                                </td>
                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );

}