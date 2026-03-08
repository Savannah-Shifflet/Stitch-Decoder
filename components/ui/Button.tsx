import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}

const variants = {
  primary: "bg-brand-500",
  secondary: "bg-white border border-brand-200",
  ghost: "bg-transparent",
};

const labelVariants = {
  primary: "text-white font-semibold",
  secondary: "text-ink font-semibold",
  ghost: "text-brand-500",
};

export function Button({ label, onPress, variant = "primary", loading, disabled }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-xl py-4 items-center ${variants[variant]} ${disabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "white" : "#C08040"} />
      ) : (
        <Text className={labelVariants[variant]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
