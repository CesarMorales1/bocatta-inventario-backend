const Validator = 
{
    isTextWithoutNumbers(value)
    {
        const textWithoutNumbersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return typeof value === "string" && textWithoutNumbersRegex.test(value);
    },
    isOnlyNumbers(value) {
        const onlyNumbersRegex = /^[0-9]+$/;
        return typeof value === 'string' && onlyNumbersRegex.test(value);
    },
    
    isOnlyNumbersWithDecimals(value) {
        const numberWithDecimalRegex = /^[0-9]+(\.[0-9]+)?$/;
        return (typeof value === 'number' || (typeof value === 'string' && numberWithDecimalRegex.test(value)));
    },
    
    isOnlyNumbersWithSpaces(value) {
        const numberWithSpacesRegex = /^[0-9\s]+$/;
        return typeof value === 'string' && numberWithSpacesRegex.test(value);
    },

    isAnEmail(value)
    {
        const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        return typeof value === 'string' && validEmailRegex.test(value);
    },

    isBoolean(value) {
        return typeof value === 'boolean';
    }
}

export 
{
    Validator
}