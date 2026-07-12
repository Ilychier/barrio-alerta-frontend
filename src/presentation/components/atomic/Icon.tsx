import * as icons from 'lucide-react-native/icons';

interface IconProps {
  name: keyof typeof icons;
  color?: string;
  size?: number;
  style?: object;
}

const Icon = ({ name, color, size, style }: IconProps) => {
  // eslint-disable-next-line import/namespace
  const LucideIcon = icons[name];

  return <LucideIcon color={color} size={size} style={style} />;
};

export default Icon;