exports.welcome = function(url, user) {
      const link = url + '/self/' + user._id;
      const message = { to: user.email,
                        subject: 'Welcome! Please, confirm your email adress!',
                        text: 'Welcome ' + user.username + ', \n\xA0 \n\xA0' + 
                              'to activate the account, please confirm this email address by clicking on the following link:' + ' \n\xA0' + 
                              link + ' \n\xA0' + 
                              'Just to verify your identity.'  + ' \n\xA0 \n\xA0'
                        };
      return message;
};

exports.reset = function(url, user, reset) {
      const link = url + '/self?reset=' + reset + '&password=MY_NEW_PASSWORD';
      const message = { to: user.email,
                        subject: 'New password request!',
                        text: 'Welcome ' + user.usernamne + ', \n\xA0' + 
                              'to change your password, please replace "MY_NEW_PASSWORD" with your new password in the following string and copy&paste it in your Internet Browser:' + '\n\xA0' + 
                              link + '\n\xA0'
                        };
      return message;
};

exports.await = function(url, user) {
      const link = url + '/self/' + user._id;
      const message = { to: user.email,
                        subject: 'Thank you for registering a new user!',
                        text: 'Welcome ' + user.username + ', \n\xA0 \n\xA0' + 
                              'Thank you for registering a new user!' + ' \n\xA0' + 
                              'Please, wait for an administrator to accept your request before try to login' + ' \n\xA0 \n\xA0'
                        };
      return message;
};

exports.accepted = function(url, user) {
      const link = url + '/self/' + user._id;
      const message = { to: user.email,
                        subject: 'Registration accepted!',
                        text: 'Welcome ' + user.username + ', \n\xA0 \n\xA0' + 
                              'Your registration is now complete!' + ' \n\xA0' + 
                              'You can start using Measurify Cloud API Server!' + ' \n\xA0 \n\xA0'
                        };
      return message;
};

exports.disabled = function(url, user) {
      const link = url + '/self/' + user._id;
      const message = { to: user.email,
                        subject: 'Account disabled!',
                        text: 'Dear ' + user.username + ', \n\xA0 \n\xA0' + 
                              'Your account is disabled' + ' \n\xA0' + 
                              'Please, contact Measurify Framework administrators' + ' \n\xA0 \n\xA0'
                        };
      return message;
};

