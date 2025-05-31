import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { Metadata } from "next";

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "Prompt Genius - AI Image Guessing Game",
  description: "Challenge others to guess your AI-generated image prompts on the blockchain!",
  icons: "/logo.ico",
};
=======
export const metadata = getMetadata({
  title: "Prompt Guesser - AI Image Guessing Game",
  description: "Guess AI-generated image prompts and win ETH rewards in this exciting blockchain game!",
});
>>>>>>> ab4cb396e4e801361efff6b2f098e2c4106f92ff

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body className="pt-16">
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
