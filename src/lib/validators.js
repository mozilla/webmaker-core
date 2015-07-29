var owasp = require('owasp-password-strength-test');

// this removes the repeating character required test
// https://github.com/cadecairos/PassTest/blob/master/index.js
owasp.tests.required.splice(2, 1);

//https://github.com/mozilla/id.webmaker.org/blob/develop/web/server.js#L13
owasp.config({
  minLength: 8,
  maxLength: 256,
  minPhraseLength: 20,
  minOptionalTestsToPass: 2,
  allowPassphrases: true
});

module.exports = {

  validators: {
    email: {
      regex: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
      message: 'email_error_message'
    },
    password: {
      test: function (input) {
        input = input || '';
        return owasp.test(input).strong;
      },
      message: 'password_error_message'
    },
    username: {
      regex: /^[a-zA-Z0-9\-]{1,20}$/,
      message: 'username_error_message'
    }
  },

  // Looks at this.fields, and returns an object of errors
  // keyed on field.name
  //
  // e.g. this.fields should look like:
  // [{
  //   name: 'username',
  //   label: 'Username',
  //   required: true,
  //   validations: 'username'
  // },
  // {
  //   name: 'email',
  //   label: 'Email',
  //   type: 'email',
  //   required: true,
  //   validations: 'email'
  // },
  // {
  //   name: 'password',
  //   label: 'Password',
  //   type: 'password',
  //   required: true,
  //   validations: ['passwordLength', 'lowerCase', 'upperCase', 'numbers']
  // }]

  getValidationErrors: function () {
    var errors = {};
    var fields = this.fields;

    if (!fields) {
      return errors;
    }

    fields.forEach(fieldData => {

      var field = fieldData.name;
      var value = this.state[field];
      var isRequired = fieldData.required;
      var isEmpty = !value && value !== 0;
      var validations = fieldData.validations;

      // Required
      if (isRequired && isEmpty) {
        errors.requiredFieldsMissing = true;
      }

      // Custom Validation
      if (validations) {
        if (typeof validations === 'string') {
          validations = [validations];
        }
        validations.forEach(type => {
          var validation = this.validators[type];
          var errorMessage = validation.message;
          var test = validation.test || (input) => validation.regex.test(input);

          // Test the value if it is non-emptynpm tun
          if (!isEmpty && !test(value)) {
            errors[field] = errors[field] || [];
            errors[field].push(errorMessage);
          }

        });
      }

    });

    return errors;
  }
};
