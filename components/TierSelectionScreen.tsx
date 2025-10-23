
import React from 'react';

interface TierSelectionScreenProps {
  onSelectTier: (tier: string) => void;
}

export const TierSelectionScreen: React.FC<TierSelectionScreenProps> = ({ onSelectTier }) => {
  return (
    <div className="fixed inset-0 bg-[#161616] z-[100] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-gray-100">
          Chọn Gói VIP Của Bạn
        </h1>
        <p className="mt-4 text-[#aaaaaa]">Mở khóa toàn bộ tiềm năng của HCDOOR.AI.</p>
        
        <div className="mt-8 grid md:grid-cols-3 gap-8">
          {/* Tier 1 */}
          <div className="bg-[#222222] border border-[#333333] p-6 rounded-xl shadow-lg flex flex-col">
            <h2 className="text-2xl font-bold text-[#ff6600]">Gói Bạc</h2>
            <p className="text-4xl font-bold my-4">199k<span className="text-lg font-normal text-gray-400">/tháng</span></p>
            <ul className="text-left space-y-2 text-gray-300 flex-grow">
              <li>- 100 lượt render mỗi tháng</li>
              <li>- Chất lượng tiêu chuẩn</li>
              <li>- Hỗ trợ cơ bản</li>
            </ul>
            <button onClick={() => onSelectTier('silver')} className="mt-6 w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 bg-[#282828] text-white hover:bg-[#333333]">Chọn Gói</button>
          </div>

          {/* Tier 2 - Highlighted */}
          <div className="bg-[#222222] border-2 border-[#ff6600] p-6 rounded-xl shadow-lg flex flex-col transform scale-105">
            <h2 className="text-2xl font-bold text-[#ff6600]">Gói Vàng</h2>
            <p className="text-4xl font-bold my-4">499k<span className="text-lg font-normal text-gray-400">/tháng</span></p>
            <ul className="text-left space-y-2 text-gray-300 flex-grow">
              <li>- 500 lượt render mỗi tháng</li>
              <li>- Chất lượng cao (HD)</li>
              <li>- Hỗ trợ ưu tiên</li>
              <li>- Truy cập sớm tính năng mới</li>
            </ul>
            <button onClick={() => onSelectTier('gold')} className="mt-6 w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 bg-[#ff6600] text-white hover:bg-[#e65c00]">Phổ biến nhất</button>
          </div>

          {/* Tier 3 */}
          <div className="bg-[#222222] border border-[#333333] p-6 rounded-xl shadow-lg flex flex-col">
            <h2 className="text-2xl font-bold text-[#ff6600]">Gói Kim Cương</h2>
            <p className="text-4xl font-bold my-4">999k<span className="text-lg font-normal text-gray-400">/tháng</span></p>
            <ul className="text-left space-y-2 text-gray-300 flex-grow">
              <li>- Render không giới hạn</li>
              <li>- Chất lượng cao nhất (4K)</li>
              <li>- Hỗ trợ 24/7</li>
              <li>- API access</li>
            </ul>
            <button onClick={() => onSelectTier('diamond')} className="mt-6 w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 bg-[#282828] text-white hover:bg-[#333333]">Chọn Gói</button>
          </div>
        </div>
      </div>
    </div>
  );
};