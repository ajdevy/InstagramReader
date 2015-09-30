


#Install Android tools 
Full instructions  - https://facebook.github.io/react-native/docs/android-setup.html#content


#TODO: install homebrew
#Install React tools 
(From https://facebook.github.io/react-native/docs/getting-started.html#content)
```bash


#(If you have a problem with spawnSync react android TypeError: Object [object Object] has no method 'spawnSync' - fix npm and node version on macosx https://gist.github.com/DanHerbert/9520689)

 brew instal nvm watchman flow

 nvm install node && nvm alias default node

 #problem with nvm not found

 brew info nvm

# [~] brew info nvm
#nvm: stable 0.20.0, HEAD
#https://github.com/creationix/nvm
#Not installed
#From: https://github.com/Homebrew/homebrew/blob/master/Library/Formula/nvm.rb
#==> Caveats
#Add the following to $HOME/.bashrc, $HOME/.zshrc, or your shell's
#equivalent configuration file:
#Node installs will be lost upon upgrading nvm. Add the following above
#the source line to move install location and prevent this:

nano ~/.bash_profile
#add the following lines:
 source $(brew --prefix nvm)/nvm.sh
 export NVM_DIR=~/.nvm


#install nodejs

  nvm install node && nvm alias default node


#install the reactive stuff

  npm install -g react-native-cli

#create a react project
  react-native init InstagramReader


#For convenience we need to create an emulator that has a Menu button.
#This allows us to reload the changes on the emulator without rebuilding.
#The one emulator with a Menu button I found is the WXGA 720 emulator, available in the default emulator list.
TODO: launch emulator manager and create emulator, find tutorial

#Have an Android emulator running, or a device connected
  cd /Users/n0n3/Documents/code/react/InstagramReader
  react-native run-android


#also we need to install a library for refreshing the list view 
 npm install react-native-refreshable-listview --save

#install the gridview
 npm install react-native-grid-view --save

#the module is installed in ls node_modules/
 ls -la node_modules/

drwxr-xr-x  15 user  staff  510 Sep 24 00:03 react-native
drwxr-xr-x  11 user  staff  374 Sep 28 14:45 react-native-refresher



#first you need to register in instagram if you haven't already
TODO: link to registration


#then you need to register your developer application 
https://instagram.com/accounts/login/?next=%2Fdeveloper%2Fregister%2F

#after you have registered and activated your account from the email sent
#go to the manage client sections to create a new client 
https://instagram.com/developer/clients/manage/

```



#need to get screen size so we can have a good fit for our elements
TODO: https://github.com/pjjanak/react-native-viewport
#or use the pixeldensity stuff provided by react
