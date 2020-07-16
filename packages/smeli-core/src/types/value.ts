export interface TypedConstructor<T extends TypedValue> {
  new (...args: any[]): T;
  readonly typeName: string;
}

export abstract class TypedValue {
  // type traits
  dispose?(): void;

  __add__?(rhs: TypedValue): TypedValue;
  __sub__?(rhs: TypedValue): TypedValue;
  __mul__?(rhs: TypedValue): TypedValue;
  __div__?(rhs: TypedValue): TypedValue;

  __str__?(): string;

  type(): TypedConstructor<TypedValue> {
    const typedConstructor = this.constructor as TypedConstructor<TypedValue>;
    if (typedConstructor.typeName === undefined) {
      throw new Error(
        `Invalid type class '${typedConstructor.name}', missing static typeName`
      );
    }
    return typedConstructor;
  }

  as<U extends TypedValue>(type: TypedConstructor<U>): U {
    if (this.constructor === type) {
      return (this as unknown) as U;
    }

    const typeName = this.type().typeName;
    const expectedTypeName = type.typeName;

    throw new Error(
      `Type error: 'found '${typeName}' instead of '${expectedTypeName}'`
    );
  }

  is<U extends TypedValue>(type: TypedConstructor<U>): this is U {
    return this.constructor === type;
  }

  match<A extends TypedValue>(
    list: [
      [TypedConstructor<A>, (arg: A) => TypedValue],
      ["_", (arg: TypedValue) => TypedValue]?
    ]
  ): TypedValue;
  match<A extends TypedValue, B extends TypedValue>(
    list: [
      [TypedConstructor<A>, (arg: A) => TypedValue],
      [TypedConstructor<B>, (arg: B) => TypedValue],
      ["_", (arg: TypedValue) => TypedValue]?
    ]
  ): TypedValue;
  match(list: any): any {
    for (const item of list) {
      if (item[0] === this.constructor || item[0] === "_") {
        return item[1](this);
      }
    }

    const typeName = this.type().typeName;

    // if one of the items is "_", the loop above is guaranteed to return early,
    // so the cast is safe here
    const listNames = list
      .map((item: any[]) => (item[0] as TypedConstructor<TypedValue>).typeName)
      .join(", ");

    throw new Error(
      `Type error: 'found '${typeName}', expected one of: '${listNames}'`
    );
  }
}
