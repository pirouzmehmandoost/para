"use client";

export default function Resume() {
  return (
    <div className="mt-28  mb-20  flex flex-col w-full min-w-full h-full min-h-full items-center justify-stretch">
      <div className="flex flex-col w-5/6 h-screen min-h-screen">
        <iframe
          className="h-full place-self-center items-center place-items-center"
          src={"/pirouz_mehmandoost_swe_resume.pdf"}
          width="90%"
          height="80%"
          allowFullScreen
        />
      </div>
    </div>
  );
}
