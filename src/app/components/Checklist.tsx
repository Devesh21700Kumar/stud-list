"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { useState, useEffect } from "react";
import { Category, Item } from "@/types";

// NEW: Add 'women' to our type definition
type ListType = "general" | "men" | "women";

export default function Checklist() {
  const [listType, setListType] = useState<ListType>("general");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: The state is now initialized from a function that tries to load from localStorage
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    () => new Set()
  );

  // NEW: useEffect hook to load data from localStorage when the component mounts or listType changes.
  // This runs only on the client-side.
  useEffect(() => {
    const stored = localStorage.getItem(`checkedItems_${listType}`);
    if (stored) {
      setCheckedItems(new Set(JSON.parse(stored)));
    } else {
      // If nothing is stored for this list type, start with an empty set
      setCheckedItems(new Set());
    }
  }, [listType]);

  // NEW: useEffect hook to save data to localStorage whenever checkedItems changes.
  useEffect(() => {
    // We check if the component has finished loading to prevent writing the initial empty set
    if (!loading) {
      localStorage.setItem(
        `checkedItems_${listType}`,
        JSON.stringify(Array.from(checkedItems))
      );
    }
  }, [checkedItems, listType, loading]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/checklist/${listType}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [listType]);

  const handleToggleCheck = (itemName: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const progress = totalItems > 0 ? (checkedItems.size / totalItems) * 100 : 0;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Student Abroad Checklist
        </h1>
        <div className="flex flex-wrap justify-center gap-2 p-1 bg-gray-700 rounded-lg">
          <button
            onClick={() => setListType("general")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              listType === "general"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:bg-gray-600"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setListType("women")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              listType === "women"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:bg-gray-600"
            }`}
          >
            Women List
          </button>
          <button
            onClick={() => setListType("men")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              listType === "men"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:bg-gray-600"
            }`}
          >
            Men List
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-1 text-white">
          <span className="text-base font-medium">Progress</span>
          <span className="text-sm font-medium">
            {checkedItems.size} / {totalItems} Items
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{
              width: `${progress}%`,
              transition: "width 0.3s ease-in-out",
            }}
          ></div>
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-400">Loading your checklist...</p>
      )}
      {error && <p className="text-center text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="space-y-8">
          {categories.map((category) => (
            <div
              key={category.categoryName}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <h2 className="text-2xl font-semibold text-white p-4 bg-gray-700/50 border-b border-gray-600">
                {category.categoryName}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                    <tr>
                      <th scope="col" className="p-4 w-12">
                        Done
                      </th>
                      <th scope="col" className="p-4">
                        Item Name
                      </th>
                      <th scope="col" className="p-4">
                        Quantity
                      </th>
                      <th scope="col" className="p-4">
                        Buy In
                      </th>
                      <th scope="col" className="p-4">
                        Type / Store
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item) => (
                      <tr
                        key={item.name}
                        className={`border-b border-gray-700 transition-colors ${
                          checkedItems.has(item.name)
                            ? "bg-green-900/30"
                            : "hover:bg-gray-700/50"
                        }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded bg-gray-600 border-gray-500 focus:ring-blue-500 cursor-pointer"
                            checked={checkedItems.has(item.name)}
                            onChange={() => handleToggleCheck(item.name)}
                          />
                        </td>
                        <td
                          className={`p-4 font-medium text-white transition-all ${
                            checkedItems.has(item.name)
                              ? "line-through text-gray-400"
                              : ""
                          }`}
                        >
                          {item.name}
                        </td>
                        <td className="p-4">{item.quantity}</td>
                        <td className="p-4">{item.buyLocation}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-xs font-medium text-cyan-200 bg-cyan-900/50 rounded-full mr-2">
                            {item.itemType}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium text-purple-200 bg-purple-900/50 rounded-full">
                            {item.storeType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
