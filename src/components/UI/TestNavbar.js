// src/components/UI/TestNavbar.js
export default function TestNavbar() {
    return (
      <div className="navbar bg-red-500 p-4">
        <div className="flex-1">
          <a className="btn btn-ghost text-white text-xl">测试导航栏</a>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary">测试按钮</button>
        </div>
      </div>
    )
  }