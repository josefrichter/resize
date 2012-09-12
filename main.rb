require 'rubygems'
require 'sinatra'

get '/' do
  erb :upload
end

post '/submit' do
  
  erb :received
  
end