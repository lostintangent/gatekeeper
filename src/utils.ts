export function onPropertyChanged(
  object: any,
  propertyName: string,
  onChange: any
) {
  const handler = {
    defineProperty(target: any, property: any, descriptor: any) {
      const result = Reflect.defineProperty(target, property, descriptor);
      if (property === propertyName) {
        onChange();
      }

      return result;
    },
    deleteProperty(target: any, property: any) {
      const result = Reflect.deleteProperty(target, property);
      if (property === propertyName) {
        onChange();
      }
      return result;
    },
  };

  return new Proxy(object, handler);
}
