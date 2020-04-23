exports.welcome = function(url, user) {
      const link = url + '/self/' + user._id;
      const message = { to: user.email,
                        subject: 'Welcome! Please, confirm your email adress!',
                        text: 'Welcome ' + user.username + ', \n\xA0 \n\xA0' + 
                              'to activate the account, please confirm this email address by clicking on the following link:'  + ' \n\xA0' + 
                              link + ' \n\xA0' + 
                              'Just to verify your identity.'  + ' \n\xA0 \n\xA0'
                        };
      return message;
};

exports.reset = function(url, user, reset) {
      const link = url + '/self?reset=' + reset + '&password=CHANGE_YOUR_PASSWORD';
      const message = { to: user.email,
                        subject: 'New password request!',
                        text: 'Welcome ' + user.usernamne + ', \n\xA0' + 
                              'to change the password, please add the new one in the following link and follow it: \n\xA0' + link
                        };
      return message;
};
