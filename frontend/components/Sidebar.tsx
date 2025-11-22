import React from "react";
import Link from "next/link";

// Components
import Card from "./Card/Card";

export default function Sidebar({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 flex flex-col gap-6">
        <Card>
          <Link href="/#">
            <div className="flex flex-col items-start gap-0.5 justify-center">
              <div className="w-full py-1.5 px-0 flex items-center gap-2 text-slate-900 hover:bg-gray-200 rounded-sm transition duration-300 ease-in-out cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 -960 960 960"
                  fill="var(--color-blue-600)"
                  className="text-blue-600"
                >
                  <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
                </svg>
                <span className="font-medium">Home</span>
              </div>
            </div>
          </Link>
          {/* <Link href="#">
            <div className="w-full py-1.5 px-0 flex items-center gap-2 text-slate-900 hover:bg-gray-200 rounded-sm transition duration-300 ease-in-out cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 -960 960 960"
                fill="var(--color-blue-600)"
                className="text-blue-600"
              >
                <path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
              </svg>
              <span className="font-medium">Saved</span>
            </div>
          </Link>*/}
        </Card>
        {children}
      </div>
    </aside>
  );
}
