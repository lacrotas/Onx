// middleware/validateParams.js
const validateParams = (rules) => {
    return (req, res, next) => {
        const errors = [];
        
        rules.forEach(rule => {
            const value = req.params[rule.param];
            const paramName = rule.name || rule.param;
            
            if (rule.required && (!value || value === '')) {
                errors.push(`Параметр '${paramName}' обязателен`);
                return;
            }
            
            if (value) {
                if (rule.type === 'number' && isNaN(Number(value))) {
                    errors.push(`Параметр '${paramName}' должен быть числом`);
                }
                
                if (rule.type === 'integer') {
                    const num = Number(value);
                    if (isNaN(num) || !Number.isInteger(num)) {
                        errors.push(`Параметр '${paramName}' должен быть целым числом`);
                    }
                }
                
                if (rule.min && Number(value) < rule.min) {
                    errors.push(`Параметр '${paramName}' должен быть не меньше ${rule.min}`);
                }
            }
        });
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: errors
            });
        }
        
        next();
    };
};

module.exports = validateParams;