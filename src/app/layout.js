import Navbar from '@/components/UI/Navbar'
import "./globals.css"; // 确保路径正确


export const metadata = {
  title: "你的网站标题",
  description: "描述信息"
}

export default function RootLayout({ children }) {
  console.log('RootLayout 渲染了！')

  return (
    <html lang="zh">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
