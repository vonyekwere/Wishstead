export default function Footer({ role }: { role: string }) {
  return (
    <footer className="border-t border-[#E9E2D6] bg-[#FBF9F4]">
      <p className="px-5 py-5 text-center text-[0.62rem] uppercase tracking-[0.2em] text-[#8A8172] sm:px-8">
        &copy; Wishstead Curation Engine. {role.replace("_", " ")} access active.
      </p>
    </footer>
  );
}
