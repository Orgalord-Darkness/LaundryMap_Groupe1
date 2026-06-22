interface Ec2eLogoProps {
  /** Classe Tailwind de hauteur (ex. "h-35") — la largeur suit automatiquement (w-auto),
   * car le PNG clair et le PNG sombre n'ont pas le même ratio largeur/hauteur. */
  className?: string;
}

export function Ec2eLogo({ className = "h-35" }: Ec2eLogoProps) {
  return (
    <>
      <img src="/logo_ec2e.png" alt="EC2E" className={`${className} w-auto dark:hidden`} />
      <img
        src="/fichiers/logo/ec2e_logo_sombre.png"
        alt="EC2E"
        className={`${className} w-auto hidden dark:block`}
      />
    </>
  );
}
