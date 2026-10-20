import React from "react";
import { Material } from "../../types";
import Icon from "../common/Icons";

interface CategoryBrowserProps {
  categories: string[];
  materials: Material[];
  onSelectCategory: (category: string) => void;
}

const CATEGORY_META: Record<
  string,
  {
    icon: string;
    description: string;
    imageUrl: string;
    eventHighlights: string[];
  }
> = {
  Seating: {
    icon: "box",
    description: "Banquet chairs, Chiavari chairs, executive conference seating, velvet sofas, and barstools.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    eventHighlights: ["Weddings", "Conferences", "VIP Lounges", "Banquets"],
  },
  Tables: {
    icon: "grid",
    description: "Round banquet tables, rustic farm tables, high-boy cocktail tables, and exhibition showcases.",
    imageUrl: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80",
    eventHighlights: ["Dinners", "Receptions", "Seminars", "Booths"],
  },
  Lighting: {
    icon: "sun",
    description: "Wireless battery uplights, moving head beams, festoon bistro strings, and low-fog machines.",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
    eventHighlights: ["Concerts", "Ballrooms", "Festivals", "Stage"],
  },
  "Audio & Sound": {
    icon: "headphones",
    description: "Concert line arrays, wireless handheld microphones, Pioneer DJ booths, and monitor wedges.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    eventHighlights: ["Concerts", "Keynotes", "Weddings", "DJ Sets"],
  },
  "Visual & Displays": {
    icon: "monitor",
    description: "Modular 4K LED video walls, 10K laser projectors, 65in smart displays, and interactive kiosks.",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    eventHighlights: ["Keynotes", "Expos", "Brand Activations", "AGMs"],
  },
  "Structures & Tents": {
    icon: "compass",
    description: "High-peak marquees, clear-top luxury pavilions, pop-up canopies, and subflooring systems.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    eventHighlights: ["Outdoor Weddings", "Galas", "Festivals"],
  },
  "Staging & Truss": {
    icon: "box",
    description: "Modular aluminum stage decks, box trussing, catwalk runways, acrylic podiums, and barricades.",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    eventHighlights: ["Live Music", "Fashion Shows", "Graduations"],
  },
  "Power & Climate": {
    icon: "zap",
    description: "Silenced diesel generators, 3-phase distros, patio heaters, evaporative coolers, and cable ramps.",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    eventHighlights: ["Outdoor Sites", "Winter/Summer", "Festival Rigging"],
  },
  Tableware: {
    icon: "package",
    description: "Titanium gold flatware, crystal stemware, fine china, chafing warmers, and drink stations.",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
    eventHighlights: ["Black-Tie Galas", "Catering", "Toasts"],
  },
  "Decor & Drapery": {
    icon: "tag",
    description: "Pipe & drape velvet backdrops, floral wedding arches, VIP red carpets, dance floors, and 360 booths.",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    eventHighlights: ["Weddings", "Premieres", "Photo Stations"],
  },
};

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  categories,
  materials,
  onSelectCategory,
}) => {
  const pureCategories = categories.filter((c) => c !== "All");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900 font-display">
            Browse Inventory by Category
          </h2>
          <p className="text-xs text-gray-500">
            Select a category to browse specific item models, view aggregate performance, and inspect individual units.
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {pureCategories.length} Categories · {materials.filter((m) => !m.isArchived).length} Models
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {pureCategories.map((cat) => {
          const catMaterials = materials.filter(
            (m) => m.category === cat && !m.isArchived
          );
          const modelCount = catMaterials.length;
          const totalUnits = catMaterials.reduce((acc, m) => acc + m.totalOwned, 0);
          const availableUnits = catMaterials.reduce(
            (acc, m) => acc + m.physicallyAvailable,
            0
          );
          const rentedUnits = catMaterials.reduce((acc, m) => acc + m.rentedOut, 0);
          const underRepairUnits = catMaterials.reduce((acc, m) => acc + m.underRepair, 0);
          const availPct = totalUnits > 0 ? Math.round((availableUnits / totalUnits) * 100) : 0;

          const meta = CATEGORY_META[cat] || {
            icon: "box",
            description: "Event equipment and supplies catalog.",
            imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
            eventHighlights: ["Events"],
          };

          return (
            <div
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className="group bg-white rounded-2xl border border-gray-200 hover:border-emerald-500/70 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-amber-400 opacity-80 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Image & Badges */}
                <div className="relative h-28 w-full bg-gray-100 rounded-xl overflow-hidden mb-3">
                  <img
                    src={meta.imageUrl}
                    alt={cat}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20">
                    {modelCount} Models
                  </span>

                  <div className="absolute bottom-2 left-2 text-white">
                    <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider block">
                      Category
                    </span>
                    <strong className="text-sm font-bold font-display drop-shadow-xs">
                      {cat}
                    </strong>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">
                  {meta.description}
                </p>

                {/* Event Highlights Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {meta.eventHighlights.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-semibold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Stats */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Total Inventory:</span>
                  <strong className="text-gray-900 font-bold">{totalUnits} units</strong>
                </div>

                {/* Availability Bar */}
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-emerald-700 font-bold">{availableUnits} Available</span>
                    <span className="text-gray-400">{availPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${availPct}%` }}
                      title={`Available: ${availableUnits}`}
                    />
                    <div
                      className="bg-amber-400 h-full"
                      style={{
                        width: `${totalUnits > 0 ? (rentedUnits / totalUnits) * 100 : 0}%`,
                      }}
                      title={`Rented: ${rentedUnits}`}
                    />
                    <div
                      className="bg-rose-400 h-full"
                      style={{
                        width: `${totalUnits > 0 ? (underRepairUnits / totalUnits) * 100 : 0}%`,
                      }}
                      title={`Under Repair: ${underRepairUnits}`}
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
                  <span>Explore {cat}</span>
                  <Icon
                    name="chevron"
                    size={14}
                    className="-rotate-90 group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBrowser;
