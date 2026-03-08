import { View } from "react-native";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: Props) {
  return (
    <View className={`bg-white rounded-2xl p-4 border border-brand-100 ${className}`}>
      {children}
    </View>
  );
}
