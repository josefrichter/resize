require 'rubygems'
require 'sinatra'
require 'base64'

get '/' do
  erb :upload
end

post '/submit' do
  
  newimages = []
  now = Time.now.to_i.to_s #timestamp string
  
  params[:images].each_with_index do |image, index|

    imagedata = image.split(',')[1] #basically remove the header
    filename = 'uploads/'+ now + '_' + (index+1).to_s + '.jpg' #construct the new filename
    
    # write the file
    File.open('public/'+filename, 'wb') do|f|
      f.write(Base64.decode64(imagedata))
    end
    
    newimages << filename
    
  end
  
  erb :received, :locals => {:images => newimages}
  
end