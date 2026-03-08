import { View, Text } from "react-native";

interface Props {
  label: string;
  variant?: "default" | "premium" | "success";
}

const variants = {
  default: { bg: "bg-brand-100", text: "text-brand-700" },
  premium: { bg: "bg-amber-100", text: "text-amber-700" },
  success: { bg: "bg-sage-100", text: "text-sage-700" },
};

export function Badge({ label, variant = "default" }: Props) {
  const v = variants[variant];
  return (
    <View className={`${v.bg} rounded-full px-2.5 py-0.5 self-start`}>
      <Text className={`${v.text} text-xs font-medium`}>{label}</Text>
    </View>
  );
}
