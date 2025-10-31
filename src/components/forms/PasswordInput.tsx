import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, TextInputProps, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

type NativeWindTextInputProps = TextInputProps & {
  className?: string;
};

type PasswordInputProps = Omit<
  NativeWindTextInputProps,
  'value' | 'onChangeText' | 'placeholder' | 'secureTextEntry'
> & {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  containerClassName?: string;
  testID?: string;
};

const ICON_COLOR = '#111827';

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder,
  containerClassName = '',
  testID,
  className,
  style,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const inputClassName = useMemo(
    () => ['flex-1 py-3 font-montserrat pr-10 pl-0', className].filter(Boolean).join(' '),
    [className],
  );

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <View className={`w-full flex-row items-center rounded-3xl border border-black px-5 ${containerClassName}`}>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!isVisible}
        className={inputClassName}
        style={[style, { paddingLeft: 0 }]}
        testID={testID}
        placeholderTextColor={rest.placeholderTextColor ?? '#9CA3AF'}
      />
      <Pressable
        onPress={toggleVisibility}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={isVisible ? 'Sembunyikan password' : 'Tampilkan password'}
        android_ripple={{ color: 'transparent', borderless: true }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          paddingLeft: 12,
        })}
      >
        <Feather name={isVisible ? 'eye-off' : 'eye'} size={20} color={ICON_COLOR} />
      </Pressable>
    </View>
  );
};

export default PasswordInput;
