"use client";

export default function Resume() {
  return (
    <div className="flex flex-col w-screen min-w-screen h-screen min-h-screen">
      <iframe
        className="mt-28"
        src={"/pirouz_mehmandoost_swe_resume.pdf"}
        width="100%"
        height="100%"
        allowFullScreen
      />
    </div>
  );
}
