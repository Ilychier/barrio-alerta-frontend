import * as icons from 'lucide-react-native/icons';

interface IconProps {
  name: keyof typeof icons;
  color?: string;
  size?: number;
  style?: object;
}

const Icon = ({ name, color, size, style }: IconProps) => {
  console.log(Object.keys(icons).filter(i => i.toLowerCase().includes("alert")));
  const LucideIcon = icons[name];

  console.log("Icon solicitado:", name);
  console.log("Existe:", !!LucideIcon);

  if (!LucideIcon) {
    console.error("Icono no encontrado:", name);
    return null;
  }

  return <LucideIcon color={color} size={size} style={style} />;
};

export default Icon;