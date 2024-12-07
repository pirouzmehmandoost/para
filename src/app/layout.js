import { UnifrakturCook } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
const cook = UnifrakturCook({ weight: '700', subsets: ["latin"], });

export const metadata = {
    title: "App Main",
    description: "Generated by create next app",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className ={`bg-neutral-200  ${cook.className}`}>
                <NavBar />
                {children}
            </body>
        </html>
    );
}
