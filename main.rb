require 'rubygems'
require 'sinatra'

get '/' do
  erb :upload
end

post '/submit' do
  
  saved = []
  
  params[:file].each do |file|

    File.open('public/uploads/' + file[:filename], "w") do |f|
      f.write(file[:tempfile].read)
    end
    
    saved << file[:filename]
    
  end
  
  erb :received, :locals  =>  {:names => saved}
end