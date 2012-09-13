require 'rubygems'
require 'sinatra'
require 'open-uri'

get '/' do
  erb :upload
end

post '/submit' do
  
  #TODO write the file
  
  erb :received
  
end