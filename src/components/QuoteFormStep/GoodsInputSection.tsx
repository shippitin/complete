import type { QuoteFormData } from "../../types/QuoteFormData";

interface Props {
  formData: QuoteFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>;
}

export default function GoodsInputSection({ formData, setFormData }: Props) {
  return (
    <div>
      <h3 className="font-semibold">Goods Info</h3>
      <input
        value={formData.goods.goodsType}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            goods: { ...prev.goods, goodsType: e.target.value },
          }))
        }
        className="border p-2 mr-2"
        placeholder="Goods Type"
      />
      <input
        value={formData.goods.goodsValue}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            goods: { ...prev.goods, goodsValue: e.target.value },
          }))
        }
        className="border p-2 mr-2"
        placeholder="Goods Value"
      />
      <label className="mr-4">
        <input
          type="checkbox"
          checked={formData.goods.isHazardous}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              goods: { ...prev.goods, isHazardous: e.target.checked },
            }))
          }
        />
        Hazardous
      </label>
      <label>
        <input
          type="checkbox"
          checked={formData.goods.isReadyToShip}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              goods: { ...prev.goods, isReadyToShip: e.target.checked },
            }))
          }
        />
        Ready to Ship
      </label>
    </div>
  );
}